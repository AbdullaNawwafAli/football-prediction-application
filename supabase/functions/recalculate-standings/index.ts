import { createClient } from "jsr:@supabase/supabase-js@2";

const COUNTABLE_STATUSES = new Set(["IN_PLAY", "PAUSED", "FINISHED", "AWARDED"]);

interface TeamStats {
  team_id: number;
  group_name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  booking_points: number;
  group_position: number | null;
}

Deno.serve(async (_req) => {
  const secret = _req.headers.get("x-internal-secret");
  if (secret !== Deno.env.get("INTERNAL_SECRET")) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized" }),
      { headers: { "Content-Type": "application/json" }, status: 401 }
    );
  }
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // ── 1. Read all group stage matches from DB ──────────────────────────────────
  const { data: matches, error: fetchError } = await supabase
    .from("matches")
    .select("*")
    .eq("stage", "GROUP_STAGE");

  if (fetchError) {
    return new Response(
      JSON.stringify({ success: false, error: fetchError }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }

  if (!matches || matches.length === 0) {
    return new Response(
      JSON.stringify({ success: true, message: "No group stage matches found", standings_updated: 0 }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  // ── 2. Build standings ───────────────────────────────────────────────────────
  const { standingsRows, error: buildError } = buildStandings(matches);

  if (buildError) {
    return new Response(
      JSON.stringify({ success: false, error: buildError }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }

  if (standingsRows.length === 0) {
    return new Response(
      JSON.stringify({ success: true, message: "No standings to update", standings_updated: 0 }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  // ── 3. Upsert standings (full overwrite) ─────────────────────────────────────
  const { error: upsertError } = await supabase
    .from("group_standings")
    .upsert(standingsRows, { onConflict: "team_id" });

  if (upsertError) {
    return new Response(
      JSON.stringify({ success: false, error: upsertError }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }

  // ── 4. Award group stage points only if matches are IN_PLAY or FINISHED ────────
  const hasAwardableMatches = matches.some(m => 
    m.stage === "GROUP_STAGE" && 
    (m.status === "IN_PLAY" || m.status === "FINISHED")
  );

  if (hasAwardableMatches) {
    const baseUrl = Deno.env.get("SUPABASE_URL");
    const internalHeaders = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!}`,
      "x-internal-secret": Deno.env.get("INTERNAL_SECRET")!,
    };

    const awardRes = await fetch(
      `${baseUrl}/functions/v1/award-group-stage-points`,
      { method: "POST", headers: internalHeaders }
    );
    const awardData = await awardRes.json();

    return new Response(
      JSON.stringify({
        success: true,
        standings_updated: standingsRows.length,
        award: awardData,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } else {
    return new Response(
      JSON.stringify({
        success: true,
        standings_updated: standingsRows.length,
        award: null,
        message: "No IN_PLAY or FINISHED matches to award points for"
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
});

// ── buildStandings ────────────────────────────────────────────────────────────

function buildStandings(
  matches: any[]
): { standingsRows: TeamStats[]; error: string | null } {
  const groupMatches = matches.filter((m) => m.stage === "GROUP_STAGE" && m.group_name);

  const statsMap = new Map<number, TeamStats>();

  const getOrCreate = (teamId: number, groupName: string): TeamStats => {
    if (!statsMap.has(teamId)) {
      statsMap.set(teamId, {
        team_id: teamId,
        group_name: groupName,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goals_for: 0,
        goals_against: 0,
        goal_difference: 0,
        points: 0,
        booking_points: 0,
        group_position: null,
      });
    }
    return statsMap.get(teamId)!;
  };

  for (const m of groupMatches) {
    const homeId = m.home_team_id;
    const awayId = m.away_team_id;
    const groupName = m.group_name!;

    if (!homeId || !awayId) continue;

    const home = getOrCreate(homeId, groupName);
    const away = getOrCreate(awayId, groupName);

    if (m.home_booking_score !== null) home.booking_points += m.home_booking_score;
    if (m.away_booking_score !== null) away.booking_points += m.away_booking_score;

    if (!COUNTABLE_STATUSES.has(m.status ?? "")) continue;

    home.played += 1;
    away.played += 1;

    const homeGoals = m.full_time_home;
    const awayGoals = m.full_time_away;

    if (homeGoals !== null && awayGoals !== null) {
      home.goals_for += homeGoals;
      home.goals_against += awayGoals;
      away.goals_for += awayGoals;
      away.goals_against += homeGoals;

      if (homeGoals > awayGoals) {
        home.won += 1; home.points += 3;
        away.lost += 1;
      } else if (awayGoals > homeGoals) {
        away.won += 1; away.points += 3;
        home.lost += 1;
      } else {
        home.drawn += 1; home.points += 1;
        away.drawn += 1; away.points += 1;
      }
    }
  }

  const byGroup = new Map<string, TeamStats[]>();
  for (const stats of statsMap.values()) {
    stats.goal_difference = stats.goals_for - stats.goals_against;
    if (!byGroup.has(stats.group_name)) byGroup.set(stats.group_name, []);
    byGroup.get(stats.group_name)!.push(stats);
  }

  const standingsRows: TeamStats[] = [];
  for (const [, teams] of byGroup) {
    teams.sort((a, b) =>
      b.points - a.points ||
      b.goal_difference - a.goal_difference ||
      b.goals_for - a.goals_for ||
      a.booking_points - b.booking_points
    );
    teams.forEach((t, idx) => {
      t.group_position = idx + 1;
      standingsRows.push(t);
    });
  }

  return { standingsRows, error: null };
}