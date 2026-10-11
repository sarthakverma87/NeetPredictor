const webhookUrl = import.meta.env.VITE_SHEETS_WEBHOOK_URL || "";

async function postToSheet(payload) {
  if (!webhookUrl) {
    console.info("[sheets] webhook not set; payload stored locally only", payload);
    const key = payload.type === "event" ? "neet_predictor_events" : "neet_predictor_leads";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    existing.push({ ...payload, stored_at: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(existing));
    return { ok: true, offline: true };
  }

  await fetch(webhookUrl, {
    method: "POST",
    redirect: "follow",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });

  return { ok: true, offline: false };
}

export function sheetsConfigured() {
  return Boolean(webhookUrl);
}

export function saveLead(lead) {
  return postToSheet({ type: "lead", ...lead });
}

export function saveEvent(event) {
  return postToSheet({ type: "event", ...event });
}
