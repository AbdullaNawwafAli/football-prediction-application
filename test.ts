/// <reference lib="deno.ns" />
// ── Constants & Types ─────────────────────────────────────────────────────────

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

// ── buildStandings (copied from index.ts) ─────────────────────────────────────

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

// ── Helpers ───────────────────────────────────────────────────────────────────

function printStandings(rows: TeamStats[]) {
  for (const t of rows) {
    console.log(
      `  #${t.group_position} Team ${String(t.team_id).padEnd(3)} | ` +
      `P:${t.played} W:${t.won} D:${t.drawn} L:${t.lost} | ` +
      `GF:${t.goals_for} GA:${t.goals_against} GD:${t.goal_difference} | ` +
      `Pts:${t.points} Booking:${t.booking_points}`
    );
  }
}

let passed = 0;
let failed = 0;
function assert(label: string, condition: boolean) {
  if (condition) {
    console.log(`  ✅ PASS — ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL — ${label}`);
    failed++;
  }
}

// ── Test 1: Basic win / draw / loss + points ──────────────────────────────────

console.log("\n━━ Test 1: Basic win / draw / loss ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

const { standingsRows: t1 } = buildStandings([
  // Team 1 beats Team 2  →  Team1: W1 Pts3, Team2: L1 Pts0
  {
    stage: "GROUP_STAGE", group_name: "GROUP_A", status: "FINISHED",
    home_team_id: 1, away_team_id: 2,
    full_time_home: 3, full_time_away: 1,
    home_booking_score: 0, away_booking_score: 0,
  },
  // Team 3 draws Team 4  →  Team3: D1 Pts1, Team4: D1 Pts1
  {
    stage: "GROUP_STAGE", group_name: "GROUP_A", status: "FINISHED",
    home_team_id: 3, away_team_id: 4,
    full_time_home: 1, full_time_away: 1,
    home_booking_score: 0, away_booking_score: 0,
  },
]);

printStandings(t1);
const pos1 = (id: number) => t1.find(t => t.team_id === id)!;

assert("Team 1 is #1 (3 pts)", pos1(1).group_position === 1);
assert("Team 1 has 3 points", pos1(1).points === 3);
assert("Team 3 & 4 have 1 pt each", pos1(3).points === 1 && pos1(4).points === 1);
assert("Team 2 has 0 points", pos1(2).points === 0);
assert("Team 2 is #4", pos1(2).group_position === 4);

// ── Test 2: SCHEDULED match should not count toward played ────────────────────

console.log("\n━━ Test 2: SCHEDULED status not counted ━━━━━━━━━━━━━━━━━━━━━━━━━");

const { standingsRows: t2 } = buildStandings([
  {
    stage: "GROUP_STAGE", group_name: "GROUP_A", status: "FINISHED",
    home_team_id: 1, away_team_id: 2,
    full_time_home: 1, full_time_away: 0,
    home_booking_score: 0, away_booking_score: 0,
  },
  // This match is upcoming — should not affect played/points
  {
    stage: "GROUP_STAGE", group_name: "GROUP_A", status: "SCHEDULED",
    home_team_id: 1, away_team_id: 3,
    full_time_home: null, full_time_away: null,
    home_booking_score: null, away_booking_score: null,
  },
]);

printStandings(t2);
const pos2 = (id: number) => t2.find(t => t.team_id === id)!;

assert("Team 1 played 1 (not 2)", pos2(1).played === 1);
assert("Team 3 played 0", pos2(3).played === 0);

// ── Test 3: Non-group-stage match ignored ─────────────────────────────────────

console.log("\n━━ Test 3: ROUND_OF_16 match ignored ━━━━━━━━━━━━━━━━━━━━━━━━━━━");

const { standingsRows: t3 } = buildStandings([
  {
    stage: "GROUP_STAGE", group_name: "GROUP_A", status: "FINISHED",
    home_team_id: 1, away_team_id: 2,
    full_time_home: 2, full_time_away: 0,
    home_booking_score: 0, away_booking_score: 0,
  },
  // Knockout match — must be completely ignored
  {
    stage: "ROUND_OF_16", group_name: null, status: "FINISHED",
    home_team_id: 1, away_team_id: 2,
    full_time_home: 3, full_time_away: 0,
    home_booking_score: 0, away_booking_score: 0,
  },
]);

printStandings(t3);
const pos3 = (id: number) => t3.find(t => t.team_id === id)!;

assert("Team 1 played 1 only (knockout ignored)", pos3(1).played === 1);
assert("Team 1 GF is 2 only (knockout ignored)", pos3(1).goals_for === 2);

// ── Test 4: Tiebreaker — points → GD → GF → booking ──────────────────────────

console.log("\n━━ Test 4: Tiebreaker chain ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("  Teams 10 & 11 equal on pts/GD/GF — Team 11 wins on lower booking");

// Team 10 vs 12: Team 10 wins 1-0
// Team 11 vs 12: Team 11 wins 1-0
// Team 10 vs 11: draw 1-1
// → Team 10 & 11: Pts=4, GD=+1, GF=2, but Team 10 booking=4 vs Team 11 booking=1
const { standingsRows: t4 } = buildStandings([
  {
    stage: "GROUP_STAGE", group_name: "GROUP_B", status: "FINISHED",
    home_team_id: 10, away_team_id: 12,
    full_time_home: 1, full_time_away: 0,
    home_booking_score: 0, away_booking_score: 0,
  },
  {
    stage: "GROUP_STAGE", group_name: "GROUP_B", status: "FINISHED",
    home_team_id: 11, away_team_id: 12,
    full_time_home: 1, full_time_away: 0,
    home_booking_score: 0, away_booking_score: 0,
  },
  {
    stage: "GROUP_STAGE", group_name: "GROUP_B", status: "FINISHED",
    home_team_id: 10, away_team_id: 11,
    full_time_home: 1, full_time_away: 1,
    home_booking_score: 4, away_booking_score: 1, // Team 10 dirtier
  },
]);

printStandings(t4);
const pos4 = (id: number) => t4.find(t => t.team_id === id)!;

assert("Team 10 and 11 equal on pts (4)", pos4(10).points === 4 && pos4(11).points === 4);
assert("Team 10 and 11 equal on GD (+1)", pos4(10).goal_difference === 1 && pos4(11).goal_difference === 1);
assert("Team 10 and 11 equal on GF (2)", pos4(10).goals_for === 2 && pos4(11).goals_for === 2);
assert("Team 11 ranks above Team 10 (booking)", pos4(11).group_position! < pos4(10).group_position!);
assert("Team 12 is last", pos4(12).group_position === 3);

// ── Test 5: Booking points accumulate from IN_PLAY match ──────────────────────

console.log("\n━━ Test 5: Booking points from IN_PLAY match ━━━━━━━━━━━━━━━━━━━");

const { standingsRows: t5 } = buildStandings([
  {
    stage: "GROUP_STAGE", group_name: "GROUP_A", status: "IN_PLAY",
    home_team_id: 1, away_team_id: 2,
    full_time_home: 1, full_time_away: 0,
    home_booking_score: 3, away_booking_score: 1,
  },
]);

printStandings(t5);
const pos5 = (id: number) => t5.find(t => t.team_id === id)!;

assert("Team 1 booking = 3", pos5(1).booking_points === 3);
assert("Team 2 booking = 1", pos5(2).booking_points === 1);
assert("IN_PLAY counts as played", pos5(1).played === 1);

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n━━ Results: ${passed} passed, ${failed} failed ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
if (failed > 0) Deno.exit(1);