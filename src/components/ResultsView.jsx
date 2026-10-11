import { categoryLabel } from "../lib/states";
import { formatRank } from "../lib/predict";

const BUCKETS = [
  { key: "Safe", tone: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", hint: "AIR at or below 85% of last year's close" },
  { key: "Moderate", tone: "bg-gold-500/15 text-gold-300 border-gold-500/30", hint: "AIR between 85% and 100% of last year's close" },
  { key: "Reach", tone: "bg-orange-500/15 text-orange-300 border-orange-500/30", hint: "AIR between 100% and 115% of last year's close" },
];

export default function ResultsView({ prediction, score, category, state, onWhatsapp, onCta, ctaDone }) {
  const { air, qualified, emptyReason, buckets, counts } = prediction;
  const total = counts.Safe + counts.Moderate + counts.Reach;

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-gold-500/30 bg-night-700 px-5 py-5">
        <p className="text-xs uppercase tracking-[0.16em] text-gold-500">Estimated All India Rank</p>
        <p className="mt-1 text-4xl font-extrabold text-gold-400">{formatRank(air)}</p>
        <p className="mt-2 text-sm text-white/65">
          Score {score} · {categoryLabel(category)} · {state}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {BUCKETS.map((bucket) => (
            <div key={bucket.key} className="rounded-2xl bg-night-600 px-2 py-2">
              <p className="text-lg font-bold text-ink">{counts[bucket.key]}</p>
              <p className="text-[11px] text-white/55">{bucket.key}</p>
            </div>
          ))}
        </div>
      </section>

      {!qualified || emptyReason === "not_qualified" ? (
        <EmptyState
          title="This score is below the 2025 qualifying mark"
          body="General and EWS qualified from 144 marks. OBC, SC and ST qualified from 113. Talk to a counsellor about a drop year or other courses."
        />
      ) : emptyReason === "no_match" ? (
        <EmptyState
          title="No AIQ government MBBS seat in this 50-college sample"
          body="Your estimated rank is outside the 2025 All India Quota closing range we have. State-quota counselling can still open more government seats in your home state. A counsellor can map that next."
        />
      ) : (
        BUCKETS.map((bucket) => (
          <section key={bucket.key}>
            <div className="mb-2 flex items-end justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-ink">{bucket.key}</h3>
                <p className="text-xs text-white/45">{bucket.hint}</p>
              </div>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${bucket.tone}`}>
                {buckets[bucket.key].length}
              </span>
            </div>
            <div className="space-y-3">
              {buckets[bucket.key].map((college) => (
                <article key={college.id} className="rounded-3xl border border-white/10 bg-night-700 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold leading-snug text-ink">{college.college}</h4>
                      <p className="mt-1 text-sm text-white/50">
                        {college.city}, {college.state} · {college.type}
                      </p>
                    </div>
                    {college.isHomeState ? (
                      <span className="shrink-0 rounded-full bg-gold-500 px-2 py-1 text-[11px] font-bold text-night-900">
                        Home state
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm text-white/65">
                    2025 {categoryLabel(category)} close:{" "}
                    <span className="font-semibold text-gold-400">AIR {formatRank(college.closing)}</span>
                  </p>
                </article>
              ))}
            </div>
          </section>
        ))
      )}

      <div className="grid gap-3">
        <button className="btn-primary" type="button" onClick={onWhatsapp}>
          Share my result on WhatsApp
        </button>
        <button className="btn-secondary" type="button" onClick={onCta} disabled={ctaDone}>
          {ctaDone ? "Counsellor will call you" : "Get a free NEETprep counselling call"}
        </button>
      </div>

      {total > 0 ? (
        <p className="text-center text-xs text-white/35">Showing up to 10 colleges in each bucket, sorted by closing rank.</p>
      ) : null}

      <p className="rounded-2xl border border-white/10 bg-night-700 px-4 py-3 text-xs leading-5 text-white/45">
        Indicative 2025 All India Quota figures for this exercise. A few points come from published MCC
        summaries; the rest follow 2025 trends. Not official MCC or NTA data, and not counselling advice.
      </p>
    </div>
  );
}

function EmptyState({ title, body }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/15 bg-night-700 px-5 py-6">
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/60">{body}</p>
    </div>
  );
}
