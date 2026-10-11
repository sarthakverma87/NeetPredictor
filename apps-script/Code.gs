/**
 * NEET College Predictor — Google Apps Script webhook
 *
 * Setup
 * 1. Create a Google Sheet.
 * 2. Extensions → Apps Script, paste this file.
 * 3. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the web app URL into VITE_SHEETS_WEBHOOK_URL
 *
 * Admin dashboard: <WEB_APP_URL>?view=admin&key=neet-admin-2026
 */
const ADMIN_KEY = "neet-admin-2026";
const LEAD_HEADERS = [
  "timestamp",
  "name",
  "phone",
  "score",
  "category",
  "state",
  "predicted_rank",
  "duplicate_phone",
  "score_band",
  "device",
  "safe_count",
  "moderate_count",
  "reach_count",
];
const EVENT_HEADERS = [
  "timestamp",
  "event",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "device",
];
const FUNNEL_EVENTS = ["page_view", "form_start", "form_submit", "result_view"];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (data.type === "event") {
      appendEvent_(ss, data);
    } else {
      appendLead_(ss, data);
    }
    refreshFunnel_(ss);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  const params = e.parameter || {};
  if (params.view === "admin") {
    if (params.key !== ADMIN_KEY) {
      return HtmlService.createHtmlOutput("Unauthorized");
    }
    return renderAdmin_(SpreadsheetApp.getActiveSpreadsheet());
  }
  return ContentService.createTextOutput("NEET predictor webhook is live");
}

function maskExistingLeadRows_(sheet) {
  var last = sheet.getLastRow();
  if (last < 2) return;
  var range = sheet.getRange(2, 2, last - 1, 2);
  var values = range.getValues();
  var changed = false;
  for (var i = 0; i < values.length; i++) {
    var name = String(values[i][0] || "");
    var phone = String(values[i][1] || "");
    if (/^\d{10}$/.test(phone) || (name && name.indexOf("*") === -1 && name.length > 2)) {
      values[i][0] = maskEnds_(name);
      values[i][1] = maskEnds_(phone);
      changed = true;
    }
  }
  if (changed) range.setValues(values);
}

function migrateLeads_(sheet) {
  var headerH = String(sheet.getRange(1, 8).getValue() || "");
  if (headerH === "utm_source") {
    sheet.deleteColumns(8, 4);
  }
}

function maskEnds_(value) {
  var text = String(value || "").trim();
  if (!text) return "";
  if (text.length === 1) return text;
  if (text.length === 2) return text.charAt(0) + "*";
  return text.charAt(0) + "*".repeat(text.length - 2) + text.charAt(text.length - 1);
}

function appendLead_(ss, data) {
  const sheet = getOrCreateSheet_(ss, "Leads", LEAD_HEADERS);
  const raw = getOrCreateSheet_(ss, "Leads_raw", LEAD_HEADERS);
  raw.hideSheet();

  const phone = String(data.phone || "");
  const name = String(data.name || "").trim();
  var phones = [];
  if (raw.getLastRow() > 1) {
    phones = raw.getRange(2, 3, raw.getLastRow() - 1, 1).getValues().flat();
  }
  const duplicate = phone && phones.map(String).indexOf(phone) !== -1;

  const row = [
    data.timestamp || new Date().toISOString(),
    name,
    phone,
    data.score || "",
    data.category || "",
    data.state || "",
    data.predicted_rank || "",
    duplicate ? "TRUE" : "FALSE",
    data.score_band || "",
    data.device || "",
    data.safe_count || 0,
    data.moderate_count || 0,
    data.reach_count || 0,
  ];
  const masked = row.slice();
  masked[1] = maskEnds_(name);
  masked[2] = maskEnds_(phone);

  sheet.appendRow(masked);
  raw.appendRow(row);
}

function appendEvent_(ss, data) {
  const sheet = getOrCreateSheet_(ss, "Events", EVENT_HEADERS);
  sheet.appendRow([
    new Date().toISOString(),
    data.event || "",
    data.utm_source || "",
    data.utm_medium || "",
    data.utm_campaign || "",
    data.device || "",
  ]);
}

function refreshFunnel_(ss) {
  const events = getOrCreateSheet_(ss, "Events", EVENT_HEADERS);
  const funnel = getOrCreateSheet_(ss, "Funnel", ["event", "count"]);
  const rows = events.getLastRow() > 1 ? events.getRange(2, 2, events.getLastRow() - 1, 1).getValues() : [];
  const counts = { page_view: 0, form_start: 0, form_submit: 0, result_view: 0 };

  rows.forEach(function (row) {
    const eventName = row[0];
    if (counts[eventName] !== undefined) counts[eventName] += 1;
  });

  funnel.clear();
  funnel.appendRow(["event", "count"]);
  FUNNEL_EVENTS.forEach(function (key) {
    funnel.appendRow([key, counts[key]]);
  });
  funnel.getRange(1, 1, 1, 2).setFontWeight("bold");
}

function renderAdmin_(ss) {
  const leadSheet = getOrCreateSheet_(ss, "Leads", LEAD_HEADERS);
  const last = leadSheet.getLastRow();
  const values = last > 1 ? leadSheet.getRange(2, 1, last - 1, LEAD_HEADERS.length).getValues() : [];
  const funnelSheet = getOrCreateSheet_(ss, "Funnel", ["event", "count"]);
  const funnelValues = funnelSheet.getDataRange().getValues();

  var rowsHtml = values
    .slice()
    .reverse()
    .slice(0, 50)
    .map(function (row) {
      return (
        "<tr><td>" +
        row[0] +
        "</td><td>" +
        maskEnds_(row[1]) +
        "</td><td>" +
        maskEnds_(row[2]) +
        "</td><td>" +
        row[3] +
        "</td><td>" +
        row[4] +
        "</td><td>" +
        row[5] +
        "</td><td>" +
        row[6] +
        "</td></tr>"
      );
    })
    .join("");

  var funnelHtml = funnelValues
    .map(function (row) {
      return "<tr>" + row.map(function (cell) { return "<td>" + cell + "</td>"; }).join("") + "</tr>";
    })
    .join("");

  var html =
    "<html><head><meta name='viewport' content='width=device-width, initial-scale=1' /><style>body{font-family:sans-serif;padding:20px;color:#12241c}table{border-collapse:collapse;width:100%;font-size:13px}td,th{border:1px solid #ddd;padding:8px;text-align:left}th{background:#0f6b4c;color:#fff}</style></head><body>" +
    "<h1>NEET predictor leads</h1><p>Name and phone show only the first and last character.</p>" +
    "<h2>Funnel</h2><table>" +
    funnelHtml +
    "</table><h2>Latest leads</h2><table><tr><th>Time</th><th>Name</th><th>Phone</th><th>Score</th><th>Category</th><th>State</th><th>AIR</th></tr>" +
    rowsHtml +
    "</table></body></html>";

  return HtmlService.createHtmlOutput(html);
}

function getOrCreateSheet_(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  if (name === "Leads") {
    migrateLeads_(sheet);
    maskExistingLeadRows_(sheet);
  }
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
  var extra = sheet.getMaxColumns() - headers.length;
  if (extra > 0) {
    sheet.deleteColumns(headers.length + 1, extra);
  }
  return sheet;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
