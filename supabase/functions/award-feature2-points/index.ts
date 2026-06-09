import { createClient } from "jsr:@supabase/supabase-js@2";
// award-feature2-points edge function
// Scores all predictions for active matches and aggregates into
// per-stage columns on user_scores.
Deno.serve(async (req)=>{
  const internalSecret = Deno.env.get("INTERNAL_SECRET");
  if (req.headers.get("x-internal-secret") !== internalSecret) {
    return new Response(JSON.stringify({
      error: "Unauthorized"
    }), {
      status: 401
    });
  }
  const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
  // ── 1. Fetch all active matches with stage/matchday info ──────────────────
  const { data: matches, error: matchesError } = await supabase.from("matches").select("id, status, stage, matchday, full_time_home, full_time_away, half_time_home, half_time_away").not("status", "in", '("TIMED","SCHEDULED","SUSPENDED","POSTPONED","CANCELLED")');
  if (matchesError) return errorResponse(matchesError.message);
  if (!matches || matches.length === 0) {
    return okResponse({
      message: "No active matches",
      predictions_scored: 0
    });
  }
  const activeMatchIds = matches.map((m)=>m.id);
  // ── 2. Fetch all predictions for those matches ────────────────────────────
  const { data: predictions, error: predsError } = await supabase.from("score_predictions").select("user_id, match_id, predicted_home, predicted_away").in("match_id", activeMatchIds);
  if (predsError) return errorResponse(predsError.message);
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
    const actualHome = match.full_time_home ?? match.half_time_home;
    const actualAway = match.full_time_away ?? match.half_time_away;
    let points_awarded = 0;
    if (actualHome !== null && actualAway !== null) {
      const actualOutcome = Math.sign(actualHome - actualAway);
      const predictedOutcome = Math.sign(p.predicted_home - p.predicted_away);
      if (actualOutcome === predictedOutcome) {
        // Correct outcome: 3 points base
        points_awarded = 3;
        // Correct score on top: +2 bonus
        if (p.predicted_home === actualHome && p.predicted_away === actualAway) {
          points_awarded = 5;
        }
      }
    }
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
  if (upsertError) return errorResponse(upsertError.message);
  // ── 5. Map each match to its user_scores column ───────────────────────────
  // Returns the column name for a given match's stage/matchday.
  function stageColumn(match) {
    if (match.stage === "GROUP_STAGE") {
      if (match.matchday === 1) return "matchday1";
      if (match.matchday === 2) return "matchday2";
      if (match.matchday === 3) return "matchday3";
      return null;
    }
    const stageMap = {
      LAST_32: "last_32",
      LAST_16: "last_16",
      QUARTER_FINALS: "qf",
      SEMI_FINALS: "sf",
      FINAL: "final",
      THIRD_PLACE: "third"
    };
    return stageMap[match.stage] ?? null;
  }
  // ── 6. Aggregate points per user per column ───────────────────────────────
  // userTotals: Map<user_id, Map<column, points>>
  const userTotals = new Map();
  for (const p of scored){
    const match = matchMap.get(p.match_id);
    const col = stageColumn(match);
    if (!col) continue; // unknown stage — skip
    if (!userTotals.has(p.user_id)) userTotals.set(p.user_id, new Map());
    const cols = userTotals.get(p.user_id);
    cols.set(col, (cols.get(col) ?? 0) + p.points_awarded);
  }
  // ── 7. Build upsert rows for user_scores ──────────────────────────────────
  const allColumns = [
    "matchday1",
    "matchday2",
    "matchday3",
    "last_32",
    "last_16",
    "qf",
    "sf",
    "final",
    "third"
  ];
  const userScoreRows = Array.from(userTotals.entries()).map(([user_id, cols])=>{
    const row = {
      user_id,
      updated_at: new Date().toISOString()
    };
    for (const col of allColumns){
      row[col] = cols.get(col) ?? 0;
    }
    return row;
  });
  const { error: scoresError } = await supabase.from("user_scores").upsert(userScoreRows, {
    onConflict: "user_id"
  });
  if (scoresError) return errorResponse(scoresError.message);
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
