import { saveEvent } from "./leads";
import { captureUtms, getDevice } from "./utm";

const started = { form: false, page: false };
const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID || "";

function bootGa() {
  if (!gaId || window.gtag) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", gaId);
}

export function track(event, properties = {}) {
  const utms = captureUtms();
  const payload = {
    event,
    device: getDevice(),
    ...utms,
    ...properties,
  };

  bootGa();
  if (window.gtag) {
    window.gtag("event", event, payload);
  }

  saveEvent(payload).catch(() => {});
}

export function trackPageView() {
  if (started.page) return;
  started.page = true;
  track("page_view");
}

export function trackFormStart() {
  if (started.form) return;
  started.form = true;
  const utms = captureUtms();
  track("form_start", { utm_source: utms.utm_source });
}
