import { createClient } from "jsr:@supabase/supabase-js@2";
//to fetch matches initially
Deno.serve(async (_req)=>{
  const FOOTBALL_API_KEY = Deno.env.get("FOOTBALL_DATA_API_KEY");
  const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
  const res = await fetch("https://api.football-data.org/v4/competitions/WC/matches?season=2026", {
    headers: {
      "X-Auth-Token": FOOTBALL_API_KEY
    }
  });
  if (!res.ok) {
    return new Response(JSON.stringify({
      success: false,
      error: `API error: ${res.status}`
    }), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
  const data = await res.json();
  const matches = data.matches.map((m)=>{
    const homeScore = m.score.fullTime.home;
    const awayScore = m.score.fullTime.away;
    const halfTimeHome = m.score.halfTime.home;
    const halfTimeAway = m.score.halfTime.away;
    // Use fulltime if available, fall back to halftime
    const effectiveHome = homeScore ?? halfTimeHome;
    const effectiveAway = awayScore ?? halfTimeAway;
    let winner_id = null;
    if (effectiveHome !== null && effectiveAway !== null) {
      if (effectiveHome > effectiveAway) winner_id = m.homeTeam.id;
      else if (effectiveAway > effectiveHome) winner_id = m.awayTeam.id;
    }
    // assigning
    let home_booking_score = null;
    let away_booking_score = null;
    if (homeScore !== null && awayScore !== null) {
      home_booking_score = 0;
      away_booking_score = 0;
      const bookings = m.bookings ?? [];
      for (const booking of bookings){
        let points = 0;
        switch(booking.card){
          case "YELLOW":
            points = 1;
            break;
          case "YELLOW_RED":
            points = 3;
            break; // second yellow / indirect red
          case "RED":
            points = 4;
            break; // straight red
        }
        if (booking.team.id === m.homeTeam.id) {
          home_booking_score += points;
        } else if (booking.team.id === m.awayTeam.id) {
          away_booking_score += points;
        }
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
  const { error } = await supabase.from("matches").upsert(matches, {
    onConflict: "id"
  });
  return new Response(JSON.stringify({
    success: !error,
    count: matches.length,
    error
  }), {
    headers: {
      "Content-Type": "application/json"
    }
  });
});
