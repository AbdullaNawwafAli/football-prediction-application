// supabase/functions/sync-matches/index.ts
//
// Cron-invoked edge function that:
//   1. Fetches World Cup match data from football-data.org
//   2. Upserts it into the `matches` table
//   3. Recalculates Feature 2 (score prediction) points based on the
//      CURRENT match state — not only the final result (Note 2)
//   4. Recalculates Feature 1 knockout points (predicted winner vs actual)
//   5. Rolls everything up into the per-user `user_scores` table that the
//      realtime leaderboards subscribe to
//
// Scheduled via the Supabase Cron UI (Integrations -> Cron), job type
// "Edge Function", schedule "*/2 * * * *".
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const FOOTBALL_DATA_URL = "https://api.football-data.org/v4";
const COMPETITION_CODE = "WC"; // World Cup
// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------
Deno.serve(async ()=>{
  const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
  const apiKey = Deno.env.get("FOOTBALL_DATA_API_KEY");
  try {
    const matches = await fetchMatches(apiKey);
    const rows = matches.map(toMatchRow);
    // 1. Upsert all matches (insert new, update changed, by external_id)
    const { error: upsertError } = await supabase.from("matches").upsert(rows, {
      onConflict: "external_id"
    });
    if (upsertError) throw upsertError;
    // 2. Only matches that are live or finished can affect points
    const activeMatches = rows.filter((m)=>m.status === "IN_PLAY" || m.status === "PAUSED" || m.status === "FINISHED");
    // 3. Recalculate per-prediction points for those matches
    for (const match of activeMatches){
      await recalculateScorePoints(supabase, match); // Feature 2
      await recalculateKnockoutPoints(supabase, match); // Feature 1 (knockout)
    }
    // 4. Roll per-prediction points up into user_scores
    if (activeMatches.length > 0) {
      await rollupUserScores(supabase);
    }
    return json({
      ok: true,
      synced: rows.length,
      active: activeMatches.length
    });
  } catch (err) {
    console.error("sync-matches error:", err);
    return json({
      ok: false,
      error: String(err)
    }, 500);
  }
});
// ---------------------------------------------------------------------------
// Fetching
// ---------------------------------------------------------------------------
async function fetchMatches(apiKey) {
  const res = await fetch(`${FOOTBALL_DATA_URL}/competitions/${COMPETITION_CODE}/matches?season=2026`, {
    headers: {
      "X-Auth-Token": apiKey
    }
  });
  if (!res.ok) throw new Error(`football-data.org returned ${res.status}`);
  const { matches } = await res.json();
  return matches;
}
function toMatchRow(m) {
  return {
    external_id: m.id,
    stage: m.stage,
    group: m.group ?? null,
    home_team_id: m.homeTeam.id,
    home_team_name: m.homeTeam.name,
    away_team_id: m.awayTeam.id,
    away_team_name: m.awayTeam.name,
    utc_date: m.utcDate,
    status: m.status,
    home_score: m.score.fullTime.home,
    away_score: m.score.fullTime.away,
    winner: m.score.winner,
    minute: m.minute ?? null
  };
}
// ---------------------------------------------------------------------------
// Feature 2 — score prediction points
// ---------------------------------------------------------------------------
async function recalculateScorePoints(supabase, match) {
  if (match.home_score === null || match.away_score === null) return;
  const { data: predictions, error } = await supabase.from("score_predictions").select("id, user_id, predicted_home, predicted_away").eq("match_external_id", match.external_id);
  if (error) throw error;
  if (!predictions?.length) return;
  const updates = predictions.map((p)=>({
      id: p.id,
      points: scorePoints(p, match),
      last_calculated_at: new Date().toISOString()
    }));
  const { error: updateError } = await supabase.from("score_predictions").upsert(updates);
  if (updateError) throw updateError;
}
// 3 points for an exact score, 1 for the correct outcome (win/draw/loss), else 0.
function scorePoints(p, match) {
  const home = match.home_score;
  const away = match.away_score;
  if (p.predicted_home === home && p.predicted_away === away) return 3;
  const predictedWinner = p.predicted_home > p.predicted_away ? "HOME_TEAM" : p.predicted_away > p.predicted_home ? "AWAY_TEAM" : "DRAW";
  return predictedWinner === match.winner ? 1 : 0;
}
// ---------------------------------------------------------------------------
// Feature 1 — knockout prediction points
// ---------------------------------------------------------------------------
// Group-stage standings scoring is more involved (it depends on the final
// group table from the /standings endpoint) and belongs in its own function.
// Knockout scoring is straightforward: did the predicted winner advance?
async function recalculateKnockoutPoints(supabase, match) {
  if (match.stage === "GROUP_STAGE") return;
  if (match.status !== "FINISHED" || !match.winner) return;
  const { data: predictions, error } = await supabase.from("knockout_predictions").select("id, user_id, predicted_winner").eq("match_external_id", match.external_id);
  if (error) throw error;
  if (!predictions?.length) return;
  const updates = predictions.map((p)=>({
      id: p.id,
      points: p.predicted_winner === match.winner ? 2 : 0,
      last_calculated_at: new Date().toISOString()
    }));
  const { error: updateError } = await supabase.from("knockout_predictions").upsert(updates);
  if (updateError) throw updateError;
}
// ---------------------------------------------------------------------------
// Rollup into user_scores
// ---------------------------------------------------------------------------
// Calls a Postgres function (see SQL below) that recomputes feature1_points
// and feature2_points for every user in one transaction. total_points is a
// generated column, so it updates automatically.
async function rollupUserScores(supabase) {
  const { error } = await supabase.rpc("rollup_user_scores");
  if (error) throw error;
}
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
} /*
-- ===========================================================================
-- Companion SQL — run once in the SQL editor.
-- Doing the rollup as a single Postgres function keeps it atomic and fast,
-- instead of issuing two UPDATEs from the edge function over the network.
-- ===========================================================================

create or replace function rollup_user_scores()
returns void
language sql
as $$
  -- Feature 1: group stage + knockout
  update user_scores us
  set feature1_points = coalesce(f1.total, 0),
      updated_at = now()
  from (
    select user_id, sum(points) as total
    from (
      select user_id, points from group_stage_predictions
      union all
      select user_id, points from knockout_predictions
    ) combined
    group by user_id
  ) f1
  where us.user_id = f1.user_id;

  -- Feature 2: match score predictions
  update user_scores us
  set feature2_points = coalesce(f2.total, 0),
      updated_at = now()
  from (
    select user_id, sum(points) as total
    from score_predictions
    group by user_id
  ) f2
  where us.user_id = f2.user_id;
$$;
*/ 
