import { createClient } from "jsr:@supabase/supabase-js@2";
Deno.serve(async (_req)=>{
  const secret = _req.headers.get("x-internal-secret");
  if (secret !== Deno.env.get("INTERNAL_SECRET")) {
    return new Response(JSON.stringify({
      success: false,
      error: "Unauthorized"
    }), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 401
    });
  }
  const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
  // ── 1. Fetch all knockout predictions with their match ────────────────────────
  const { data: predictions, error: predError } = await supabase.from("knockout_predictions").select(`
      id,
      user_id,
      match_id,
      predicted_winner_id,
      matches (
        id,
        stage,
        winner_id,
        status
      )
    `);
  if (predError) {
    return new Response(JSON.stringify({
      success: false,
      error: predError
    }), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
  if (!predictions || predictions.length === 0) {
    return new Response(JSON.stringify({
      success: true,
      message: "No knockout predictions found",
      users_updated: 0
    }), {
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
  // ── 2. Fetch points per round ─────────────────────────────────────────────────
  const { data: roundPoints, error: roundError } = await supabase.from("knockout_round_points").select("stage, points");
  if (roundError) {
    return new Response(JSON.stringify({
      success: false,
      error: roundError
    }), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
  const pointsForStage = new Map((roundPoints ?? []).map((r)=>[
      r.stage,
      r.points
    ]));
  // ── 3. Evaluate each prediction ───────────────────────────────────────────────
  const FINISHED = new Set([
    "FINISHED",
    "AWARDED"
  ]);
  const updatedPredictions = [];
  // user_id → total knockout points
  const userKnockoutPoints = new Map();
  for (const pred of predictions){
    const match = pred.matches;
    // only evaluate finished matches with a decided winner
    const isFinished = FINISHED.has(match?.status ?? "");
    const hasWinner = match?.winner_id !== null && match?.winner_id !== undefined;
    const is_correct = isFinished && hasWinner && match.winner_id === pred.predicted_winner_id;
    const points_awarded = is_correct ? pointsForStage.get(match.stage) ?? 0 : 0;
    updatedPredictions.push({
      id: pred.id,
      is_correct,
      points_awarded,
      updated_at: new Date().toISOString()
    });
    userKnockoutPoints.set(pred.user_id, (userKnockoutPoints.get(pred.user_id) ?? 0) + points_awarded);
  }
  // ── 4. Upsert is_correct + points_awarded for every prediction ────────────────
  const { error: predUpsertError } = await supabase.from("knockout_predictions").upsert(updatedPredictions, {
    onConflict: "id"
  });
  if (predUpsertError) {
    return new Response(JSON.stringify({
      success: false,
      error: predUpsertError
    }), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
  // ── 5. Write knockout_points only — feature1_points auto-updates ──────────────
  const userScoreRows = Array.from(userKnockoutPoints.entries()).map(([user_id, knockout_points])=>({
      user_id,
      knockout_points,
      updated_at: new Date().toISOString()
    }));
  const { error: scoresError } = await supabase.from("user_scores").upsert(userScoreRows, {
    onConflict: "user_id"
  });
  if (scoresError) {
    return new Response(JSON.stringify({
      success: false,
      error: scoresError
    }), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
  return new Response(JSON.stringify({
    success: true,
    predictions_evaluated: updatedPredictions.length,
    users_updated: userScoreRows.length
  }), {
    headers: {
      "Content-Type": "application/json"
    }
  });
});
