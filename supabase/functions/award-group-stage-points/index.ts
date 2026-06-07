import { createClient } from "jsr:@supabase/supabase-js@2";
const POINTS_FOR_POSITION = {
  1: 3,
  2: 1,
  3: 1,
  4: 1
};
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
  // ── 1. Fetch all picks joined to their parent prediction ─────────────────────
  const { data: picks, error: picksError } = await supabase.from("group_stage_prediction_picks").select(`
      id,
      team_id,
      predicted_position,
      prediction_id,
      group_stage_predictions (
        id,
        user_id,
        group_name
      )
    `);
  if (picksError) {
    return new Response(JSON.stringify({
      success: false,
      error: picksError
    }), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
  if (!picks || picks.length === 0) {
    return new Response(JSON.stringify({
      success: true,
      message: "No picks found",
      users_updated: 0
    }), {
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
  // ── 2. Fetch current group standings ─────────────────────────────────────────
  const { data: standings, error: standingsError } = await supabase.from("group_standings").select("team_id, group_position");
  if (standingsError) {
    return new Response(JSON.stringify({
      success: false,
      error: standingsError
    }), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
  // team_id → actual position
  const actualPosition = new Map((standings ?? []).map((s)=>[
      s.team_id,
      s.group_position
    ]));
  // ── 3. Evaluate each pick, accumulate group_points per prediction ─────────────
  const updatedPicks = [];
  // prediction_id → { user_id, group_name, group_points }
  const predictionTotals = new Map();
  for (const pick of picks){
    const parent = pick.group_stage_predictions;
    const actual = actualPosition.get(pick.team_id) ?? null;
    const is_correct = actual !== null && actual === pick.predicted_position;
    updatedPicks.push({
      id: pick.id,
      is_correct
    });
    if (!predictionTotals.has(pick.prediction_id)) {
      predictionTotals.set(pick.prediction_id, {
        user_id: parent.user_id,
        group_name: parent.group_name,
        group_points: 0
      });
    }
    if (is_correct) {
      predictionTotals.get(pick.prediction_id).group_points += POINTS_FOR_POSITION[pick.predicted_position] ?? 1;
    }
  }
  // ── 4. Upsert is_correct for every pick ──────────────────────────────────────
  const { error: picksUpsertError } = await supabase.from("group_stage_prediction_picks").upsert(updatedPicks, {
    onConflict: "id"
  });
  if (picksUpsertError) {
    return new Response(JSON.stringify({
      success: false,
      error: picksUpsertError
    }), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
  // ── 5. Upsert group_points back to group_stage_predictions ───────────────────
  const predictionRows = Array.from(predictionTotals.entries()).map(([id, val])=>({
      id,
      user_id: val.user_id,
      group_name: val.group_name,
      group_points: val.group_points,
      updated_at: new Date().toISOString()
    }));
  const { error: predUpsertError } = await supabase.from("group_stage_predictions").upsert(predictionRows, {
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
  // ── 6. Recompute feature1_points per affected user (full recompute, idempotent)
  const affectedUserIds = [
    ...new Set(predictionRows.map((r)=>r.user_id))
  ];
  const { data: groupTotals, error: groupTotalsError } = await supabase.from("group_stage_predictions").select("user_id, group_points").in("user_id", affectedUserIds);
  if (groupTotalsError) {
    return new Response(JSON.stringify({
      success: false,
      error: groupTotalsError
    }), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
  const { data: knockoutTotals, error: knockoutTotalsError } = await supabase.from("knockout_predictions").select("user_id, points_awarded").in("user_id", affectedUserIds);
  if (knockoutTotalsError) {
    return new Response(JSON.stringify({
      success: false,
      error: knockoutTotalsError
    }), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
  // Sum group points per user
  const userPoints = new Map();
  for (const row of groupTotals ?? []){
    userPoints.set(row.user_id, (userPoints.get(row.user_id) ?? 0) + row.group_points);
  }
  // Add knockout points
  for (const row of knockoutTotals ?? []){
    userPoints.set(row.user_id, (userPoints.get(row.user_id) ?? 0) + row.points_awarded);
  }
  const userScoreRows = Array.from(userPoints.entries()).map(([user_id, feature1_points])=>({
      user_id,
      feature1_points,
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
    picks_evaluated: updatedPicks.length,
    predictions_updated: predictionRows.length,
    users_updated: userScoreRows.length
  }), {
    headers: {
      "Content-Type": "application/json"
    }
  });
});
