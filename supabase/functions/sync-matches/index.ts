import { createClient } from "jsr:@supabase/supabase-js@2";
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
    const effectiveHome = homeScore ?? halfTimeHome;
    const effectiveAway = awayScore ?? halfTimeAway;
    let winner_id = null;
    if (effectiveHome !== null && effectiveAway !== null) {
      if (effectiveHome > effectiveAway) winner_id = m.homeTeam.id;
      else if (effectiveAway > effectiveHome) winner_id = m.awayTeam.id;
    // draw → winner_id stays null
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
      winner_id
    };
  });
  // ── 3. Upsert matches ────────────────────────────────────────────────────────
  // NOTE: next_match_id and next_match_slot are NOT sourced from the API —
  // they are set once manually when the bracket is seeded and must not be
  // overwritten here. Upsert only touches the columns listed above.
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
  // ── 4. Check tournament phase ────────────────────────────────────────────────
  const { data: activeKnockout } = await supabase.from("matches").select("id").eq("stage", "LAST_32").neq("status", "TIMED").limit(1);
  const baseUrl = Deno.env.get("SUPABASE_URL");
  const internalHeaders = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
    "x-internal-secret": Deno.env.get("INTERNAL_SECRET")
  };
  const f2Res = await fetch(`${baseUrl}/functions/v1/award-feature2-points`, {
    method: "POST",
    headers: internalHeaders
  });
  const f2Data = await f2Res.json();
  let recalcData = null;
  if (!activeKnockout || activeKnockout.length === 0) {
    // ── 5a. Still in group stage — recalculate standings ──────────────────────
    const recalcRes = await fetch(`${baseUrl}/functions/v1/recalculate-standings`, {
      method: "POST",
      headers: internalHeaders
    });
    recalcData = await recalcRes.json();
    return new Response(JSON.stringify({
      success: true,
      matches_synced: matches.length,
      standings: recalcData
    }), {
      headers: {
        "Content-Type": "application/json"
      }
    });
  } else {
    // ── 5b. Knockout stage active ─────────────────────────────────────────────
    // link-bracket-provenance is no longer needed: next_match_id on each match
    // makes the bracket graph explicit and is maintained separately.
    const awardRes = await fetch(`${baseUrl}/functions/v1/award-knockout-points`, {
      method: "POST",
      headers: internalHeaders
    });
    const awardData = await awardRes.json();
    return new Response(JSON.stringify({
      success: true,
      matches_synced: matches.length,
      award: awardData,
      f2: f2Data
    }), {
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
});
