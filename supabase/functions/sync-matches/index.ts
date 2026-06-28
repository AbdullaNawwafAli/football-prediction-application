import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (_req) => {
  const FOOTBALL_API_KEY = Deno.env.get("FOOTBALL_DATA_API_KEY")!;
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // ── 1. Fetch matches from the football API ─────────────────────────────
  const res = await fetch(
    "https://api.football-data.org/v4/competitions/WC/matches?season=2026",
    { headers: { "X-Auth-Token": FOOTBALL_API_KEY } }
  );
  if (!res.ok) {
    return new Response(
      JSON.stringify({ success: false, error: `Football API error: ${res.status}` }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
  const data = await res.json();

  // ── 2. Map API response → matches rows ─────────────────────────────────
  const matches = (data.matches as any[]).map((m) => {
    const homeScore = m.score.fullTime.home;
    const awayScore = m.score.fullTime.away;
    const halfTimeHome = m.score.halfTime.home;
    const halfTimeAway = m.score.halfTime.away;
    const effectiveHome = homeScore ?? halfTimeHome;
    const effectiveAway = awayScore ?? halfTimeAway;

    let winner_id: number | null = null;
    if (effectiveHome !== null && effectiveAway !== null) {
      if (effectiveHome > effectiveAway) winner_id = m.homeTeam.id;
      else if (effectiveAway > effectiveHome) winner_id = m.awayTeam.id;
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
      matchday: m.matchday ?? null,
      full_time_home: homeScore,
      full_time_away: awayScore,
      half_time_home: halfTimeHome,
      half_time_away: halfTimeAway,
      winner_id,
    };
  });

  // ── 3. Upsert matches (next_match_id / next_match_slot untouched) ───────
  const { error: matchesError } = await supabase
    .from("matches")
    .upsert(matches, { onConflict: "id" });

  if (matchesError) {
    return new Response(
      JSON.stringify({ success: false, error: matchesError.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }

  // ── 4. Score feature-2 predictions (in-DB) ─────────────────────────────
  const { data: f2Data, error: f2Error } = await supabase.rpc("award_feature2_points");
  if (f2Error) {
    return new Response(
      JSON.stringify({ success: false, error: f2Error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }

  // ── 5. Branch on tournament phase ──────────────────────────────────────
  const { data: activeKnockout } = await supabase
    .from("matches")
    .select("id")
    .eq("stage", "LAST_32")
    .neq("status", "TIMED")
    .limit(1);

  const inGroupStage = !activeKnockout || activeKnockout.length === 0;

  if (inGroupStage) {
    const { data: standings, error } = await supabase.rpc("recalculate_standings");
    if (error) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }
    return new Response(
      JSON.stringify({
        success: true,
        matches_synced: matches.length,
        f2: f2Data,
        standings,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  const { data: award, error } = await supabase.rpc("award_knockout_points");
  if (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
  return new Response(
    JSON.stringify({
      success: true,
      matches_synced: matches.length,
      f2: f2Data,
      award,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});