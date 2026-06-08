import { createClient } from "jsr:@supabase/supabase-js@2";
// award-feature2-points edge function
// Called by sync-matches after every upsert.
// Re-scores all predictions for matches that are IN_PLAY or FINISHED,
// then aggregates into user_scores.feature2_points.
Deno.serve(async (req)=>{
  // Internal-only — verify secret
  const internalSecret = Deno.env.get("INTERNAL_SECRET");
  if (req.headers.get("x-internal-secret") !== internalSecret) {
    return new Response(JSON.stringify({
      error: "Unauthorized"
    }), {
      status: 401
    });
  }
  const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
  // ── 1. Fetch all active matches (not TIMED/SCHEDULED) with their scores ────
  const { data: matches, error: matchesError } = await supabase.from("matches").select("id, status, full_time_home, full_time_away, half_time_home, half_time_away").not("status", "in", '("TIMED","SCHEDULED","SUSPENDED","POSTPONED","CANCELLED")');
  if (matchesError) {
    return errorResponse(matchesError.message);
  }
  if (!matches || matches.length === 0) {
    return okResponse({
      message: "No active matches",
      predictions_scored: 0
    });
  }
  const activeMatchIds = matches.map((m)=>m.id);
  // ── 2. Fetch all predictions for those matches ────────────────────────────
  const { data: predictions, error: predsError } = await supabase.from("score_predictions").select("user_id, match_id, predicted_home, predicted_away").in("match_id", activeMatchIds);
  if (predsError) {
    return errorResponse(predsError.message);
  }
  if (!predictions || predictions.length === 0) {
    return okResponse({
      message: "No predictions to score",
      predictions_scored: 0
    });
  }
  // ── 3. Score each prediction ──────────────────────────────────────────────
  const matchMap = new Map(matches.map((m)=>[
      m.id,
      m
    ]));
  const scored = predictions.map((p)=>{
    const match = matchMap.get(p.match_id);
    // Use full-time if available, fall back to half-time (live match)
    const actualHome = match.full_time_home ?? match.half_time_home;
    const actualAway = match.full_time_away ?? match.half_time_away;
    let points_awarded = 0;
    if (actualHome !== null && actualAway !== null) {
      if (p.predicted_home === actualHome && p.predicted_away === actualAway) {
        // Exact score
        points_awarded = 3;
      } else {
        // Check outcome only
        const actualOutcome = Math.sign(actualHome - actualAway); // 1 | 0 | -1
        const predictedOutcome = Math.sign(p.predicted_home - p.predicted_away);
        if (actualOutcome === predictedOutcome) {
          points_awarded = 1;
        }
      }
    }
    // null scores → points_awarded stays 0 (shouldn't reach here given the status filter)
    return {
      user_id: p.user_id,
      match_id: p.match_id,
      predicted_home: p.predicted_home,
      predicted_away: p.predicted_away,
      points_awarded,
      updated_at: new Date().toISOString()
    };
  });
  // ── 4. Upsert scored predictions ──────────────────────────────────────────
  const { error: upsertError } = await supabase.from("score_predictions").upsert(scored, {
    onConflict: "user_id,match_id"
  });
  if (upsertError) {
    return errorResponse(upsertError.message);
  }
  // ── 5. Aggregate per user and update user_scores.feature2_points ──────────
  // Group points by user
  const userTotals = new Map();
  for (const p of scored){
    userTotals.set(p.user_id, (userTotals.get(p.user_id) ?? 0) + p.points_awarded);
  }
  const userScoreRows = Array.from(userTotals.entries()).map(([user_id, feature2_points])=>({
      user_id,
      feature2_points,
      updated_at: new Date().toISOString()
    }));
  const { error: scoresError } = await supabase.from("user_scores").upsert(userScoreRows, {
    onConflict: "user_id"
  });
  if (scoresError) {
    return errorResponse(scoresError.message);
  }
  return okResponse({
    predictions_scored: scored.length,
    users_updated: userScoreRows.length
  });
});
// ── Helpers ──────────────────────────────────────────────────────────────────
function okResponse(data) {
  return new Response(JSON.stringify({
    success: true,
    ...data
  }), {
    headers: {
      "Content-Type": "application/json"
    }
  });
}
function errorResponse(message, status = 500) {
  return new Response(JSON.stringify({
    success: false,
    error: message
  }), {
    headers: {
      "Content-Type": "application/json"
    },
    status
  });
}
