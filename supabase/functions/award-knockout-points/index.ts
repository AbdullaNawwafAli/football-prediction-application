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
  console.log("\n=== DEBUGGING KNOCKOUT_ROUND_POINTS ===");
  // Test 1: Count rows in the table
  const { data: countData, error: countError } = await supabase.from("knockout_round_points").select("*", {
    count: "exact",
    head: true
  });
  console.log("1️⃣ Table exists check:", {
    rowCount: countData?.length,
    error: countError?.message
  });
  // Test 2: Fetch with all columns to see structure
  const { data: allCols, error: allColsError } = await supabase.from("knockout_round_points").select("*");
  console.log("2️⃣ All columns fetch:", {
    error: allColsError?.message,
    rowCount: allCols?.length,
    firstRow: allCols?.[0],
    columnNames: allCols?.[0] ? Object.keys(allCols[0]) : "N/A"
  });
  // Test 3: Fetch just stage and points (the actual query)
  const { data: roundPoints, error: roundError } = await supabase.from("knockout_round_points").select("stage, points");
  console.log("3️⃣ Stage+Points fetch:", {
    error: roundError?.message,
    dataLength: roundPoints?.length,
    data: roundPoints
  });
  if (roundError) {
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to fetch roundPoints",
      details: roundError,
      debug: {
        countError: countError?.message,
        allColsError: allColsError?.message
      }
    }), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
  if (!roundPoints || roundPoints.length === 0) {
    console.error("❌ No roundPoints data returned");
    return new Response(JSON.stringify({
      success: false,
      error: "knockout_round_points table is empty or data structure mismatch",
      debug: {
        allRows: allCols
      }
    }), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
  const pointsForStage = new Map(roundPoints.map((r)=>[
      r.stage,
      r.points
    ]));
  console.log("✅ Points map created:", {
    size: pointsForStage.size,
    entries: Array.from(pointsForStage.entries())
  });
  // ── 3. Evaluate each prediction ───────────────────────────────────────────────
  // A prediction is only scored once the match is FINISHED and has a decided winner.
  // Draws (winner_id = null) leave predictions as incorrect until extra time / pens
  // resolve the match and the API sets a winner.
  const FINISHED = new Set([
    "FINISHED",
    "AWARDED"
  ]);
  const updatedPredictions = [];
  const userKnockoutPoints = new Map();
  for (const pred of predictions){
    const match = pred.matches;
    const isFinished = FINISHED.has(match?.status ?? "");
    const hasWinner = match?.winner_id !== null && match?.winner_id !== undefined;
    const is_correct = isFinished && hasWinner && match.winner_id === pred.predicted_winner_id;
    const points_awarded = is_correct ? pointsForStage.get(match.stage) ?? 0 : 0;
    updatedPredictions.push({
      id: pred.id,
      user_id: pred.user_id,
      match_id: pred.match_id,
      predicted_winner_id: pred.predicted_winner_id,
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
  // ── 5. Write knockout_points — feature1_points auto-updates via generated col ──
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
