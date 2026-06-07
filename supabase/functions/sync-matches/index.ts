import { createClient } from "jsr:@supabase/supabase-js@2";
const COUNTABLE_STATUSES = new Set([
  "IN_PLAY",
  "PAUSED",
  "FINISHED",
  "AWARDED"
]);
Deno.serve(async (_req)=>{
  const FOOTBALL_API_KEY = Deno.env.get("FOOTBALL_DATA_API_KEY");
  const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
  // ── 1. Fetch matches from API ────────────────────────────────────────────────
  const res = await fetch("https://api.football-data.org/v4/competitions/WC/matches?season=2026", {
    headers: {
      "X-Auth-Token": FOOTBALL_API_KEY
    }
  });
  if (!res.ok) {
    return new Response(JSON.stringify({
      success: false,
      error: `Football API error: ${res.status}`
    }), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
  const data = await res.json();
  // ── 2. Map API response → matches rows ──────────────────────────────────────
  const matches = data.matches.map((m)=>{
    const homeScore = m.score.fullTime.home;
    const awayScore = m.score.fullTime.away;
    const halfTimeHome = m.score.halfTime.home;
    const halfTimeAway = m.score.halfTime.away;
    // Best available score for determining winner
    const effectiveHome = homeScore ?? halfTimeHome;
    const effectiveAway = awayScore ?? halfTimeAway;
    let winner_id = null;
    if (effectiveHome !== null && effectiveAway !== null) {
      if (effectiveHome > effectiveAway) winner_id = m.homeTeam.id;
      else if (effectiveAway > effectiveHome) winner_id = m.awayTeam.id;
    // draw → winner_id stays null
    }
    // Booking points only once fulltime scores are present
    let home_booking_score = null;
    let away_booking_score = null;
    if (homeScore !== null && awayScore !== null) {
      home_booking_score = 0;
      away_booking_score = 0;
      for (const booking of m.bookings ?? []){
        let pts = 0;
        switch(booking.card){
          case "YELLOW":
            pts = 1;
            break;
          case "YELLOW_RED":
            pts = 3;
            break; // second yellow / indirect red
          case "RED":
            pts = 4;
            break; // straight red
        }
        if (booking.team?.id === m.homeTeam.id) home_booking_score += pts;
        else if (booking.team?.id === m.awayTeam.id) away_booking_score += pts;
      }
    }
    return {
      id: m.id,
      utc_date: m.utcDate,
      status: m.status,
      stage: m.stage,
      group_name: m.group ?? null,
      home_team_id: m.homeTeam.id ?? null,
      away_team_id: m.awayTeam.id ?? null,
      duration: m.score.duration ?? null,
      full_time_home: homeScore,
      full_time_away: awayScore,
      half_time_home: halfTimeHome,
      half_time_away: halfTimeAway,
      winner_id,
      home_booking_score,
      away_booking_score,
      next_match_id: null
    };
  });
  // ── 3. Upsert matches (overwrite everything) ─────────────────────────────────
  const { error: matchesError } = await supabase.from("matches").upsert(matches, {
    onConflict: "id"
  });
  if (matchesError) {
    return new Response(JSON.stringify({
      success: false,
      error: matchesError
    }), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
  // ── 4. Recalculate group standings ───────────────────────────────────────────
  const { standingsRows, error: standingsError } = buildStandings(matches);
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
  if (standingsRows.length > 0) {
    const { error: upsertError } = await supabase.from("group_standings").upsert(standingsRows, {
      onConflict: "team_id"
    });
    if (upsertError) {
      return new Response(JSON.stringify({
        success: false,
        error: upsertError
      }), {
        headers: {
          "Content-Type": "application/json"
        },
        status: 500
      });
    }
  }
  return new Response(JSON.stringify({
    success: true,
    matches_synced: matches.length,
    standings_updated: standingsRows.length
  }), {
    headers: {
      "Content-Type": "application/json"
    }
  });
});
function buildStandings(matches) {
  // Only group-stage matches
  const groupMatches = matches.filter((m)=>m.stage === "GROUP_STAGE" && m.group_name);
  // Accumulate per-team stats
  const statsMap = new Map();
  const getOrCreate = (teamId, groupName)=>{
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
        group_position: null
      });
    }
    return statsMap.get(teamId);
  };
  for (const m of groupMatches){
    const homeId = m.home_team_id;
    const awayId = m.away_team_id;
    const groupName = m.group_name;
    if (!homeId || !awayId) continue;
    const home = getOrCreate(homeId, groupName);
    const away = getOrCreate(awayId, groupName);
    // Booking points — always accumulate when non-null (even mid-game)
    if (m.home_booking_score !== null) home.booking_points += m.home_booking_score;
    if (m.away_booking_score !== null) away.booking_points += m.away_booking_score;
    // Only count match results for countable statuses
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
        // Home win
        home.won += 1;
        home.points += 3;
        away.lost += 1;
      } else if (awayGoals > homeGoals) {
        // Away win
        away.won += 1;
        away.points += 3;
        home.lost += 1;
      } else {
        // Draw
        home.drawn += 1;
        home.points += 1;
        away.drawn += 1;
        away.points += 1;
      }
    }
  }
  // Compute goal_difference and assign group_position
  // Sort within each group: points desc → goal_difference desc → goals_for desc → name (stable)
  const byGroup = new Map();
  for (const stats of statsMap.values()){
    stats.goal_difference = stats.goals_for - stats.goals_against;
    if (!byGroup.has(stats.group_name)) byGroup.set(stats.group_name, []);
    byGroup.get(stats.group_name).push(stats);
  }
  const standingsRows = [];
  for (const [, teams] of byGroup){
    teams.sort((a, b)=>b.points - a.points || b.goal_difference - a.goal_difference || b.goals_for - a.goals_for || a.booking_points - b.booking_points // lower booking score = better position
    );
    teams.forEach((t, idx)=>{
      t.group_position = idx + 1;
      standingsRows.push(t);
    });
  }
  return {
    standingsRows,
    error: null
  };
}
// Type helper so TypeScript knows the shape used in buildStandings
function buildMatchRow(m) {
  return m;
}
