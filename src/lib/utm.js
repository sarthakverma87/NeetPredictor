const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign"];
const STORAGE_KEY = "neet_predictor_utm";

export function captureUtms() {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = {};
  let found = false;

  UTM_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value) {
      fromUrl[key] = value;
      found = true;
    }
  });

  if (found) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fromUrl));
    return fromUrl;
  }

  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    /* ignore */
  }

  return { utm_source: "", utm_medium: "", utm_campaign: "" };
}

export function getDevice() {
  return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? "mobile" : "desktop";
}

export function isTestTraffic() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("test") === "1") return true;
  return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
}

export function withReferralUtms(baseUrl) {
  const url = new URL(baseUrl, window.location.origin);
  url.searchParams.set("utm_source", "whatsapp_share");
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set("utm_campaign", "predictor_v1");
  return url.toString();
}
