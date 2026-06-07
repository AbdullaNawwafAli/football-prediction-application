import { createClient } from "jsr:@supabase/supabase-js@2";
const BOOKING_STATUSES = new Set([
  "FINISHED"
]);
const DELAY_MS = 15000; // 14s between calls to stay under 10 req/min free tier limit
function delay(ms) {
  return new Promise((resolve)=>setTimeout(resolve, ms));
}
Deno.serve(async (_req)=>{
  const FOOTBALL_API_KEY = Deno.env.get("FOOTBALL_DATA_API_KEY");
  const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
  // ── 0. Stop if knockout stage has begun ──────────────────────────────────────
  const { data: activeKnockout } = await supabase.from("matches").select("id").eq("stage", "LAST_32").neq("status", "TIMED").limit(1);
  if (activeKnockout && activeKnockout.length > 0) {
    return new Response(JSON.stringify({
      success: true,
      message: "Knockout stage has begun — sync disabled",
      skipped: true
    }), {
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
  // ── 1. Fetch finished group stage matches with no booking data yet ────────────
  const { data: matches, error: fetchError } = await supabase.from("matches").select("id, home_team_id, away_team_id").eq("stage", "GROUP_STAGE").in("status", [
    "FINISHED",
    "AWARDED"
  ]).is("home_booking_score", null);
  if (fetchError) {
    return new Response(JSON.stringify({
      success: false,
      error: fetchError
    }), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
  if (!matches || matches.length === 0) {
    return new Response(JSON.stringify({
      success: true,
      message: "No matches need booking sync",
      updated: 0
    }), {
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
  // ── 2. Fetch bookings for each match one at a time ───────────────────────────
  const errors = [];
  let updated = 0;
  for (const match of matches){
    // Rate limit delay (skip delay on first request)
    if (updated > 0 || errors.length > 0) await delay(DELAY_MS);
    // Fetch single match from API
    const res = await fetch(`https://api.football-data.org/v4/matches/${match.id}`, {
      headers: {
        "X-Auth-Token": FOOTBALL_API_KEY
      }
    });
    if (!res.ok) {
      errors.push({
        matchId: match.id,
        error: `API error: ${res.status}`
      });
      continue;
    }
    const data = await res.json();
    const m = data;
    // Calculate booking scores
    let home_booking_score = 0;
    let away_booking_score = 0;
    for (const booking of m.bookings ?? []){
      let pts = 0;
      switch(booking.card){
        case "YELLOW":
          pts = 1;
          break;
        case "YELLOW_RED":
          pts = 3;
          break;
        case "RED":
          pts = 4;
          break;
      }
      if (booking.team?.id === match.home_team_id) home_booking_score += pts;
      else if (booking.team?.id === match.away_team_id) away_booking_score += pts;
    }
    // Update match row
    const { error: updateError } = await supabase.from("matches").update({
      home_booking_score,
      away_booking_score
    }).eq("id", match.id);
    if (updateError) {
      errors.push({
        matchId: match.id,
        error: updateError.message
      });
      continue;
    }
    updated++;
  }
  // ── 3. Trigger recalculate-standings if anything was updated ─────────────────
  let standingsResult = null;
  const internalHeaders = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
    "x-internal-secret": Deno.env.get("INTERNAL_SECRET")
  };
  if (updated > 0) {
    const recalcUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/recalculate-standings`;
    const recalcRes = await fetch(recalcUrl, {
      method: "POST",
      headers: internalHeaders
    });
    standingsResult = await recalcRes.json();
  }
  return new Response(JSON.stringify({
    success: true,
    updated,
    errors: errors.length > 0 ? errors : undefined,
    standings: standingsResult
  }), {
    headers: {
      "Content-Type": "application/json"
    }
  });
});
