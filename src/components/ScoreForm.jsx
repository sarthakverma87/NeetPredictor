import { CATEGORIES, INDIAN_STATES } from "../lib/states";

export default function ScoreForm({ values, errors, onChange, onStart, onSubmit }) {
  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <h3 className="text-xl font-bold text-ink">Check your college possibilities</h3>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white/70">NEET score out of 720</span>
        <input
          className="field"
          type="number"
          inputMode="numeric"
          min="0"
          max="720"
          placeholder="e.g. 560"
          value={values.score}
          onFocus={onStart}
          onChange={(e) => onChange("score", e.target.value)}
        />
        {errors.score ? <p className="mt-1.5 text-sm text-red-400">{errors.score}</p> : null}
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white/70">Category</span>
        <select
          className="field appearance-none"
          value={values.category}
          onFocus={onStart}
          onChange={(e) => onChange("category", e.target.value)}
        >
          <option value="">Select category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        {errors.category ? <p className="mt-1.5 text-sm text-red-400">{errors.category}</p> : null}
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white/70">Home state</span>
        <select
          className="field appearance-none"
          value={values.state}
          onFocus={onStart}
          onChange={(e) => onChange("state", e.target.value)}
        >
          <option value="">Select state</option>
          {INDIAN_STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
        {errors.state ? <p className="mt-1.5 text-sm text-red-400">{errors.state}</p> : null}
      </label>

      <button className="btn-primary" type="submit">
        Predict My Colleges →
      </button>
    </form>
  );
}
