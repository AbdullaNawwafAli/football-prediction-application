import { createClient } from "jsr:@supabase/supabase-js@2";
// Ordered knockout stages and the stage that feeds into each
const STAGE_PROGRESSION = [
  {
    stage: "LAST_16",
    previousStage: "LAST_32"
  },
  {
    stage: "QUARTER_FINALS",
    previousStage: "LAST_16"
  },
  {
    stage: "SEMI_FINALS",
    previousStage: "QUARTER_FINALS"
  },
  {
    stage: "FINAL",
    previousStage: "SEMI_FINALS"
  }
];
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
  const results = {};
  for (const { stage, previousStage } of STAGE_PROGRESSION){
    results[stage] = await linkStage(supabase, stage, previousStage);
  }
  return new Response(JSON.stringify({
    success: true,
    results
  }), {
    headers: {
      "Content-Type": "application/json"
    }
  });
});
async function linkStage(supabase, stage, previousStage) {
  let updated = 0;
  let skipped = 0;
  const errors = [];
  // Fetch all matches in the current stage that have teams assigned
  // but are missing at least one last_match link
  const { data: currentMatches, error: currentErr } = await supabase.from("matches").select("id, home_team_id, away_team_id, last_match_home_id, last_match_away_id").eq("stage", stage).not("home_team_id", "is", null) // API has assigned teams already
  .not("away_team_id", "is", null);
  if (currentErr) {
    errors.push(`Failed to fetch ${stage} matches: ${currentErr.message}`);
    return {
      updated,
      skipped,
      errors
    };
  }
  if (!currentMatches || currentMatches.length === 0) {
    // Stage not started yet — nothing to do
    return {
      updated,
      skipped,
      errors
    };
  }
  // Fetch all matches in the previous stage that have a winner
  const { data: previousMatches, error: prevErr } = await supabase.from("matches").select("id, winner_id").eq("stage", previousStage).not("winner_id", "is", null);
  if (prevErr) {
    errors.push(`Failed to fetch ${previousStage} matches: ${prevErr.message}`);
    return {
      updated,
      skipped,
      errors
    };
  }
  // Build a lookup: winner_id → match_id from the previous stage
  // A team can only win one match per stage, so this is 1:1
  const winnerToMatch = new Map((previousMatches ?? []).map((m)=>[
      m.winner_id,
      m.id
    ]));
  for (const match of currentMatches){
    // Skip if both links are already recorded
    if (match.last_match_home_id !== null && match.last_match_away_id !== null) {
      skipped++;
      continue;
    }
    const homePrevMatchId = winnerToMatch.get(match.home_team_id) ?? null;
    const awayPrevMatchId = winnerToMatch.get(match.away_team_id) ?? null;
    // Nothing resolvable yet for this match
    if (homePrevMatchId === null && awayPrevMatchId === null) {
      skipped++;
      continue;
    }
    const patch = {};
    if (match.last_match_home_id === null && homePrevMatchId !== null) {
      patch.last_match_home_id = homePrevMatchId;
      patch.last_match_home_team_id = match.home_team_id;
    }
    if (match.last_match_away_id === null && awayPrevMatchId !== null) {
      patch.last_match_away_id = awayPrevMatchId;
      patch.last_match_away_team_id = match.away_team_id;
    }
    if (Object.keys(patch).length === 0) {
      skipped++;
      continue;
    }
    const { error: updateErr } = await supabase.from("matches").update(patch).eq("id", match.id);
    if (updateErr) {
      errors.push(`Failed to update match ${match.id}: ${updateErr.message}`);
    } else {
      updated++;
    }
  }
  return {
    updated,
    skipped,
    errors
  };
}
