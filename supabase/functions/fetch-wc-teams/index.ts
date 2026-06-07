import { createClient } from "jsr:@supabase/supabase-js@2";
Deno.serve(async (_req)=>{
  const FOOTBALL_API_KEY = Deno.env.get("FOOTBALL_DATA_API_KEY");
  const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
  const res = await fetch("https://api.football-data.org/v4/competitions/WC/teams?season=2026", {
    headers: {
      "X-Auth-Token": FOOTBALL_API_KEY
    }
  });
  const data = await res.json();
  const { error } = await supabase.from("teams").upsert(data.teams.map((t)=>({
      id: t.id,
      name: t.name,
      short_name: t.shortName,
      tla: t.tla,
      crest_url: t.crest,
      group_name: t.group ?? null
    })), {
    onConflict: "id"
  });
  return new Response(JSON.stringify({
    success: !error,
    error
  }), {
    headers: {
      "Content-Type": "application/json"
    }
  });
});
