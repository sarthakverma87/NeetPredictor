import { readFileSync } from "node:fs";
import { bucketFor, scoreToAir } from "../src/lib/predict.js";

const rankData = JSON.parse(readFileSync(new URL("../neet_2025_score_to_rank.json", import.meta.url)));
const cutoffData = JSON.parse(readFileSync(new URL("../neet_2025_college_cutoffs.json", import.meta.url)));

const air = scoreToAir(600, rankData.points);
const byName = Object.fromEntries(cutoffData.colleges.map((c) => [c.college, c.closing_rank_2025.UR]));

const checks = [
  ["AIR for score 600", air, 1300],
  ["AIIMS Raipur bucket", bucketFor(air, byName["AIIMS Raipur"]), "Reach"],
  ["AIIMS Nagpur bucket", bucketFor(air, byName["AIIMS Nagpur"]), "Moderate"],
  ["KEM bucket", bucketFor(air, byName["Seth GS Medical College & KEM Hospital"]), "Safe"],
  ["AIIMS Patna hidden", bucketFor(air, byName["AIIMS Patna"]), null],
  ["AIIMS Bhopal hidden", bucketFor(air, byName["AIIMS Bhopal"]), null],
];

let failed = 0;
for (const [label, actual, expected] of checks) {
  const ok = actual === expected;
  console.log(`${ok ? "PASS" : "FAIL"} ${label}: got ${actual}, expected ${expected}`);
  if (!ok) failed += 1;
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log("Worked example matches the assignment brief.");
}
