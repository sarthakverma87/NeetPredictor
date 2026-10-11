import { useEffect, useMemo, useState } from "react";
import cutoffData from "../neet_2025_college_cutoffs.json";
import rankData from "../neet_2025_score_to_rank.json";
import ScoreForm from "./components/ScoreForm";
import LeadGate from "./components/LeadGate";
import ResultsView from "./components/ResultsView";
import { predictColleges, scoreBand, formatRank } from "./lib/predict";
import { track, trackFormStart, trackPageView } from "./lib/analytics";
import { saveLead, sheetsConfigured } from "./lib/leads";
import { captureUtms, getDevice, isTestTraffic, withReferralUtms } from "./lib/utm";
import { categoryLabel } from "./lib/states";

const initialScore = { score: "", category: "", state: "" };
const initialLead = { name: "", phone: "" };

export default function App() {
  const [step, setStep] = useState("input");
  const [scoreForm, setScoreForm] = useState(initialScore);
  const [leadForm, setLeadForm] = useState(initialLead);
  const [scoreErrors, setScoreErrors] = useState({});
  const [leadErrors, setLeadErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [ctaDone, setCtaDone] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const prediction = useMemo(() => {
    if (!scoreForm.score || !scoreForm.category) return null;
    return predictColleges({
      score: Number(scoreForm.score),
      category: scoreForm.category,
      homeState: scoreForm.state,
      points: rankData.points,
      colleges: cutoffData.colleges,
    });
  }, [scoreForm]);

  useEffect(() => {
    captureUtms();
    trackPageView();
  }, []);

  function updateScore(key, value) {
    trackFormStart();
    setScoreForm((prev) => ({ ...prev, [key]: value }));
    setScoreErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function updateLead(key, value) {
    trackFormStart();
    setLeadForm((prev) => ({ ...prev, [key]: value }));
    setLeadErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function validateScore() {
    const next = {};
    const score = Number(scoreForm.score);
    if (scoreForm.score === "" || Number.isNaN(score) || score < 0 || score > 720) {
      next.score = "Enter a score between 0 and 720";
    }
    if (!scoreForm.category) next.category = "Pick your category";
    if (!scoreForm.state) next.state = "Select your home state";
    setScoreErrors(next);
    return Object.keys(next).length === 0;
  }

  function validateLead() {
    const next = {};
    if (!leadForm.name.trim() || leadForm.name.trim().length < 2) {
      next.name = "Enter your name";
    }
    if (!/^[6-9]\d{9}$/.test(leadForm.phone)) {
      next.phone = "Enter a valid 10-digit Indian mobile number";
    }
    setLeadErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleScoreSubmit(event) {
    event.preventDefault();
    if (!validateScore()) return;
    setStep("lead");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleLeadSubmit(event) {
    event.preventDefault();
    if (!validateLead() || !prediction) return;

    setSubmitting(true);
    setSubmitError("");
    const utms = captureUtms();
    const payload = {
      name: leadForm.name.trim(),
      phone: leadForm.phone,
      score: Number(scoreForm.score),
      category: categoryLabel(scoreForm.category),
      state: scoreForm.state,
      predicted_rank: prediction.air,
      timestamp: new Date().toISOString(),
      ...utms,
      is_test: isTestTraffic(),
      score_band: scoreBand(scoreForm.score),
      device: getDevice(),
      safe_count: prediction.counts.Safe,
      moderate_count: prediction.counts.Moderate,
      reach_count: prediction.counts.Reach,
    };

    try {
      track("form_submit", {
        score_band: payload.score_band,
        category: payload.category,
        state: payload.state,
        utm_source: utms.utm_source,
      });
      await saveLead(payload);
      track("result_view", {
        safe_count: prediction.counts.Safe,
        moderate_count: prediction.counts.Moderate,
        reach_count: prediction.counts.Reach,
      });
      setStep("results");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSubmitError("Could not save your details. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleWhatsapp() {
    track("cta_click", { cta_type: "whatsapp_share" });
    const shareUrl = withReferralUtms(window.location.origin + window.location.pathname);
    const message = prediction
      ? `I checked my NEET 2025 college options. Score ${scoreForm.score}, estimated AIR ${formatRank(prediction.air)}. Check yours: ${shareUrl}`
      : `Check which government MBBS college you can get with your NEET score: ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  function handleCta() {
    track("cta_click", { cta_type: "counselling_call" });
    setCtaDone(true);
  }

  function goPredict() {
    if (step === "results") {
      setScoreForm(initialScore);
      setLeadForm(initialLead);
      setScoreErrors({});
      setLeadErrors({});
      setCtaDone(false);
      setSubmitError("");
    }
    setStep("input");
    window.setTimeout(() => {
      document.getElementById("predictor")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  return (
    <div className="min-h-screen bg-night-900 text-ink">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-night-900/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <a href="#top" className="flex items-center gap-2">
            <img src="/logo.jpg" alt="neetprep.com" className="h-10 w-auto sm:h-12" />
          </a>
          <nav className="hidden items-center gap-2 md:flex">
            <a href="#predictor" className="rounded-full bg-gold-500 px-3 py-1.5 text-xs font-semibold text-night-900">
              College Predictor
            </a>
            {isTestTraffic() ? (
              <span className="rounded-full bg-gold-500 px-3 py-1.5 text-xs font-semibold text-night-900">
                Test Mode
              </span>
            ) : null}
            <a href="#how" className="rounded-full bg-gold-500 px-3 py-1.5 text-xs font-semibold text-night-900">
              How it works
            </a>
            <a href="#features" className="rounded-full bg-gold-500 px-3 py-1.5 text-xs font-semibold text-night-900">
              Features
            </a>
          </nav>
          <button
            type="button"
            onClick={goPredict}
            className="rounded-full bg-gold-500 px-3 py-2 text-xs font-bold text-night-900 sm:px-4 sm:text-sm"
          >
            {step === "results" ? "Fill new details" : "Predict My Colleges"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:pt-14">
        {step === "input" ? (
          <section id="predictor" className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-gold-500/40 px-3 py-1 text-xs font-semibold text-gold-400">
                NEETprep College Predictor live
                <span className="live-dot" />
              </p>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] text-gold-400 sm:text-5xl">
                Done with NEET? Now Get Your Expected Rank & Colleges
              </h1>
              <p className="glow-box mt-6 max-w-md rounded-2xl border border-gold-500 px-4 py-3 text-sm leading-6 text-ink">
                India's most authentic government MBBS college predictor. Enter your score — we estimate your AIR.
              </p>
              <div className="mt-6 flex flex-wrap gap-5 text-sm font-medium text-ink">
                <span className="flex items-center gap-2">
                  <span className="text-gold-400">✓</span> Easy to use
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-gold-400">✓</span> Completely free
                </span>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-night-800 p-5 shadow-card sm:p-7">
              <ScoreForm
                values={scoreForm}
                errors={scoreErrors}
                onChange={updateScore}
                onStart={trackFormStart}
                onSubmit={handleScoreSubmit}
              />
            </div>
          </section>
        ) : null}

        {step === "lead" && prediction ? (
          <section className="mx-auto max-w-lg">
            <button type="button" className="mb-4 text-sm font-semibold text-gold-400" onClick={() => setStep("input")}>
              ← Back
            </button>
            <h2 className="mb-2 text-3xl font-extrabold text-gold-400">Unlock your college list</h2>
            <p className="mb-5 text-sm text-white/65">
              Estimated AIR about <span className="font-bold text-ink">{formatRank(prediction.air)}</span> for a{" "}
              {categoryLabel(scoreForm.category)} candidate.
            </p>
            <div className="rounded-3xl border border-white/10 bg-night-800 p-5 shadow-card">
              <LeadGate
                values={leadForm}
                errors={leadErrors}
                counts={prediction.counts}
                submitting={submitting}
                onChange={updateLead}
                onStart={trackFormStart}
                onSubmit={handleLeadSubmit}
                onBack={() => setStep("input")}
              />
              {submitError ? <p className="mt-3 text-sm text-red-400">{submitError}</p> : null}
            </div>
          </section>
        ) : null}

        {step === "results" && prediction ? (
          <section className="mx-auto max-w-lg">
            <ResultsView
              prediction={prediction}
              score={scoreForm.score}
              category={scoreForm.category}
              state={scoreForm.state}
              onWhatsapp={handleWhatsapp}
              onCta={handleCta}
              ctaDone={ctaDone}
            />
          </section>
        ) : null}

        {step === "input" ? (
          <>
            <section id="how" className="mt-20 grid gap-4 sm:grid-cols-3">
              {[
                ["1. Enter score", "Score, category and home state. We convert marks to an estimated All India Rank."],
                ["2. Unlock list", "Name and a 10-digit mobile. Results stay hidden until this step is done."],
                ["3. See colleges", "Safe, Moderate and Reach government MBBS options under All India Quota."],
              ].map(([title, body]) => (
                <article key={title} className="rounded-3xl border border-white/10 bg-night-800 p-5">
                  <h3 className="font-bold text-gold-400">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/60">{body}</p>
                </article>
              ))}
            </section>
            <section id="features" className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-white/50">
              <span className="rounded-full border border-white/10 px-3 py-1">50 govt colleges</span>
              <span className="rounded-full border border-white/10 px-3 py-1">2025 AIQ closing ranks</span>
              <span className="rounded-full border border-white/10 px-3 py-1">Free · 30 seconds</span>
            </section>
          </>
        ) : null}

        <footer className="mt-14 space-y-2 text-center text-xs text-white/30">
          <p>All India Quota (15%) government MBBS only. No private, deemed, BDS or AYUSH seats.</p>
          {!sheetsConfigured() ? (
            <p>Lead webhook is not set. Submissions stay in this browser until you add VITE_SHEETS_WEBHOOK_URL.</p>
          ) : null}
        </footer>
      </main>
    </div>
  );
}
