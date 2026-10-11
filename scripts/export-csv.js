import { writeFileSync } from "node:fs";

const cutoffs = JSON.parse(await readJson("./neet_2025_college_cutoffs.json"));
const ranks = JSON.parse(await readJson("./neet_2025_score_to_rank.json"));

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

const collegeHeader = ["id", "college", "city", "state", "type", "course", "quota", "UR", "EWS", "OBC", "SC", "ST"];
const collegeRows = cutoffs.colleges.map((c) => [
  c.id,
  c.college,
  c.city,
  c.state,
  c.type,
  c.course,
  c.quota,
  c.closing_rank_2025.UR,
  c.closing_rank_2025.EWS,
  c.closing_rank_2025.OBC,
  c.closing_rank_2025.SC,
  c.closing_rank_2025.ST,
]);

writeFileSync(
  "neet_2025_college_cutoffs.csv",
  [collegeHeader, ...collegeRows].map((row) => row.map(csvEscape).join(",")).join("\n") + "\n",
);

writeFileSync(
  "neet_2025_score_to_rank.csv",
  ["score,air", ...ranks.points.map((p) => `${p.score},${p.air}`)].join("\n") + "\n",
);

async function readJson(path) {
  const { readFile } = await import("node:fs/promises");
  return readFile(path, "utf8");
}

console.log("Wrote CSV copies of both datasets.");
