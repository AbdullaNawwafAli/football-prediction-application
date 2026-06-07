import { createClient } from "jsr:@supabase/supabase-js@2";
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
  const matches = data.matches.map((m)=>({
      id: m.id,
      utc_date: m.utcDate,
      stage: m.stage,
      group_name: m.group ?? null,
      home_team_id: m.homeTeam.id ?? null,
      away_team_id: m.awayTeam.id ?? null
    }));
  const { updated, error } = await assignTeamGroups(supabase, matches);
  if (error) {
    return new Response(JSON.stringify({
      success: false,
      error
    }), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
  return new Response(JSON.stringify({
    success: true,
    teams_group_updated: updated
  }), {
    headers: {
      "Content-Type": "application/json"
    }
  });
});
async function assignTeamGroups(supabase, matches) {
  const groupMatches = matches.filter((m)=>m.stage === "GROUP_STAGE" && m.group_name);
  const teamGroupMap = new Map();
  for (const m of groupMatches){
    if (m.home_team_id) teamGroupMap.set(m.home_team_id, m.group_name);
    if (m.away_team_id) teamGroupMap.set(m.away_team_id, m.group_name);
  }
  const teamIds = Array.from(teamGroupMap.keys());
  if (teamIds.length === 0) return {
    updated: 0,
    error: null
  };
  // Fetch teams that don't have a group assigned yet
  const { data: teamsWithoutGroup, error: fetchError } = await supabase.from("teams").select("id, name") // ← also fetch name for alphabetical ordering
  .in("id", teamIds).is("group_name", null);
  if (fetchError) return {
    updated: 0,
    error: fetchError
  };
  if (!teamsWithoutGroup || teamsWithoutGroup.length === 0) return {
    updated: 0,
    error: null
  };
  // 1. Update group_name on teams
  const groupUpdates = teamsWithoutGroup.map((t)=>({
      id: t.id,
      name: t.name,
      group_name: teamGroupMap.get(t.id)
    }));
  const teamUpdateResults = await Promise.all(groupUpdates.map(({ id, group_name })=>supabase.from("teams").update({
      group_name
    }).eq("id", id)));
  const updateError = teamUpdateResults.find((r)=>r.error)?.error ?? null;
  if (updateError) return {
    updated: 0,
    error: updateError
  };
  // 2. Compute alphabetical group_position per group
  //    Group teams by group_name, sort by name, assign 1-based position
  const byGroup = new Map();
  for (const t of groupUpdates){
    if (!byGroup.has(t.group_name)) byGroup.set(t.group_name, []);
    byGroup.get(t.group_name).push({
      id: t.id,
      name: t.name
    });
  }
  const standingsRows = [];
  for (const [group_name, teams] of byGroup){
    teams.sort((a, b)=>a.name.localeCompare(b.name)).forEach((t, idx)=>{
      standingsRows.push({
        team_id: t.id,
        group_name,
        group_position: idx + 1
      });
    });
  }
  // 3. Insert into group_standings (skip rows that already exist)
  const { error: standingsError } = await supabase.from("group_standings").upsert(standingsRows.map((r)=>({
      team_id: r.team_id,
      group_name: r.group_name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      points: 0,
      group_position: r.group_position,
      booking_points: 0
    })), {
    onConflict: "team_id",
    ignoreDuplicates: true
  } // PK is team_id; don't overwrite live stats
  );
  if (standingsError) return {
    updated: 0,
    error: standingsError
  };
  return {
    updated: groupUpdates.length,
    error: null
  };
}
