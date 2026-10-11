export default function LeadGate({ values, errors, counts, submitting, onChange, onStart, onSubmit, onBack }) {
  const total = counts.Safe + counts.Moderate + counts.Reach;

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="rounded-xl border border-gold-500/30 bg-gold-500/10 px-4 py-3 text-sm text-gold-300">
        {total > 0
          ? `We found ${total} government MBBS options for your score. Enter your number to unlock the list.`
          : "Unlock your result and next-step advice. We will show what this score means for AIQ counselling."}
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white/70">Your name</span>
        <input
          className="field"
          type="text"
          autoComplete="name"
          placeholder="Student or parent name"
          value={values.name}
          onFocus={onStart}
          onChange={(e) => onChange("name", e.target.value)}
        />
        {errors.name ? <p className="mt-1.5 text-sm text-red-400">{errors.name}</p> : null}
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white/70">WhatsApp / mobile number</span>
        <div className="flex gap-2">
          <span className="flex items-center rounded-xl border border-white/10 bg-night-600 px-3 text-sm font-semibold text-white/60">
            +91
          </span>
          <input
            className="field"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            maxLength="10"
            placeholder="10-digit mobile"
            value={values.phone}
            onFocus={onStart}
            onChange={(e) => onChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
          />
        </div>
        {errors.phone ? <p className="mt-1.5 text-sm text-red-400">{errors.phone}</p> : null}
        <p className="mt-1.5 text-xs leading-5 text-white/45">
          We'll use this number to share your result and NEET counselling updates.
        </p>
      </label>

      <button className="btn-primary" type="submit" disabled={submitting}>
        {submitting ? "Unlocking your list..." : "Unlock my college list"}
      </button>
      <button className="btn-secondary" type="button" onClick={onBack}>
        Edit score
      </button>
    </form>
  );
}
