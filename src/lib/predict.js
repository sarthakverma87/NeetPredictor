export const QUALIFYING_SCORE = {
  UR: 144,
  EWS: 144,
  OBC: 113,
  SC: 113,
  ST: 113,
};

export const MAX_PER_BUCKET = 10;

export function scoreToAir(score, points) {
  const numeric = Number(score);
  const sorted = [...points].sort((a, b) => b.score - a.score);

  if (numeric >= sorted[0].score) return sorted[0].air;
  if (numeric <= sorted[sorted.length - 1].score) {
    const last = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2];
    if (numeric < last.score && prev) {
      const slope = (last.air - prev.air) / (last.score - prev.score);
      return Math.round(last.air + (numeric - last.score) * slope);
    }
    return last.air;
  }

  for (let i = 0; i < sorted.length - 1; i += 1) {
    const higher = sorted[i];
    const lower = sorted[i + 1];
    if (numeric <= higher.score && numeric >= lower.score) {
      if (higher.score === lower.score) return higher.air;
      const t = (numeric - higher.score) / (lower.score - higher.score);
      return Math.round(higher.air + t * (lower.air - higher.air));
    }
  }

  return sorted[sorted.length - 1].air;
}

export function isQualified(score, category) {
  return Number(score) >= (QUALIFYING_SCORE[category] ?? 144);
}

export function bucketFor(air, closingRank) {
  if (!closingRank || closingRank <= 0) return null;
  const safeCeiling = 0.85 * closingRank;
  const reachCeiling = 1.15 * closingRank;

  if (air <= safeCeiling) return "Safe";
  if (air <= closingRank) return "Moderate";
  if (air <= reachCeiling) return "Reach";
  return null;
}

export function predictColleges({ score, category, homeState, points, colleges }) {
  const air = scoreToAir(score, points);
  const qualified = isQualified(score, category);

  if (!qualified) {
    return {
      air,
      qualified: false,
      emptyReason: "not_qualified",
      buckets: { Safe: [], Moderate: [], Reach: [] },
      counts: { Safe: 0, Moderate: 0, Reach: 0 },
    };
  }

  const buckets = { Safe: [], Moderate: [], Reach: [] };

  colleges.forEach((college) => {
    const closing = college.closing_rank_2025?.[category];
    const chance = bucketFor(air, closing);
    if (!chance) return;

    buckets[chance].push({
      ...college,
      closing,
      chance,
      ratio: closing ? air / closing : null,
      isHomeState: college.state === homeState,
    });
  });

  Object.keys(buckets).forEach((key) => {
    buckets[key].sort((a, b) => a.closing - b.closing);
    buckets[key] = buckets[key].slice(0, MAX_PER_BUCKET);
  });

  const counts = {
    Safe: buckets.Safe.length,
    Moderate: buckets.Moderate.length,
    Reach: buckets.Reach.length,
  };

  const total = counts.Safe + counts.Moderate + counts.Reach;

  return {
    air,
    qualified: true,
    emptyReason: total === 0 ? "no_match" : null,
    buckets,
    counts,
  };
}

export function scoreBand(score) {
  const n = Number(score);
  if (n >= 650) return "650+";
  if (n >= 600) return "600-649";
  if (n >= 550) return "550-599";
  if (n >= 500) return "500-549";
  if (n >= 450) return "450-499";
  if (n >= 400) return "400-449";
  return "<400";
}

export function formatRank(air) {
  return new Intl.NumberFormat("en-IN").format(air);
}
