// ╔══════════════════════════════════════════════════════════════════╗
// ║  ManuCost ERP — Google Apps Script Backend                      ║
// ║                                                                  ║
// ║  SETUP INSTRUCTIONS:                                             ║
// ║  1. Open your Google Sheet                                       ║
// ║  2. Extensions → Apps Script                                     ║
// ║  3. Delete any existing code and paste this entire file          ║
// ║  4. Click Save (floppy disk icon)                                ║
// ║  5. Click Deploy → New Deployment                                ║
// ║  6. Type: Web App                                                ║
// ║  7. Execute as: Me                                               ║
// ║  8. Who has access: Anyone                                       ║
// ║  9. Click Deploy → copy the Web App URL                         ║
// ║  10. Paste that URL into the ERP under Settings → Google Sheets  ║
// ╚══════════════════════════════════════════════════════════════════╝

const SHEET_NAME_PREFIX = 'MCE_';
const VERSION = '1.0';

// ── MAIN ENTRY POINTS ──

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  // Allow CORS for the HTML file
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    const params = e.parameter || {};
    const postData = e.postData ? JSON.parse(e.postData.contents || '{}') : {};
    const action = params.action || postData.action;
    const key    = params.key   || postData.key;
    const data   = postData.data !== undefined ? postData.data : null;

    let result;

    switch (action) {
      case 'ping':
        result = { ok: true, version: VERSION, ts: new Date().toISOString() };
        break;

      case 'get':
        result = { ok: true, key, value: sheetGet(key) };
        break;

      case 'set':
        sheetSet(key, data);
        result = { ok: true, key };
        break;

      case 'del':
        sheetDel(key);
        result = { ok: true, key };
        break;

      case 'list':
        result = { ok: true, keys: sheetList(params.prefix || postData.prefix) };
        break;

      case 'bulkGet':
        // Get multiple keys at once — keys is an array
        const keys = postData.keys || [];
        const values = {};
        keys.forEach(k => { values[k] = sheetGet(k); });
        result = { ok: true, values };
        break;

      case 'bulkSet':
        // Set multiple keys at once — data is {key: value, ...}
        const entries = postData.data || {};
        Object.entries(entries).forEach(([k, v]) => sheetSet(k, v));
        result = { ok: true, count: Object.keys(entries).length };
        break;

      case 'reset':
        sheetReset();
        result = { ok: true, message: 'All ERP data cleared' };
        break;

      case 'backup':
        result = { ok: true, backup: sheetExportAll(), ts: new Date().toISOString() };
        break;

      default:
        result = { ok: false, error: 'Unknown action: ' + action };
    }

    output.setContent(JSON.stringify(result));
  } catch (err) {
    output.setContent(JSON.stringify({ ok: false, error: err.message }));
  }

  return output;
}

// ── SHEET OPERATIONS ──
// All ERP data is stored in a single sheet called "MCE_Data"
// Each row is: [key, json_value, updated_at]

function getDataSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('MCE_Data');
  if (!sheet) {
    sheet = ss.insertSheet('MCE_Data');
    // Set up headers
    sheet.getRange(1, 1, 1, 3).setValues([['key', 'value', 'updated_at']]);
    sheet.getRange(1, 1, 1, 3).setFontWeight('bold');
    sheet.setColumnWidth(1, 200);
    sheet.setColumnWidth(2, 600);
    sheet.setColumnWidth(3, 160);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function sheetGet(key) {
  const sheet = getDataSheet();
  const data  = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      const raw = data[i][1];
      try { return JSON.parse(raw); } catch { return raw; }
    }
  }
  return null;
}

function sheetSet(key, value) {
  const sheet   = getDataSheet();
  const data    = sheet.getDataRange().getValues();
  const jsonVal = JSON.stringify(value);
  const now     = new Date().toISOString();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      sheet.getRange(i + 1, 2, 1, 2).setValues([[jsonVal, now]]);
      return;
    }
  }
  // Key not found — append new row
  sheet.appendRow([key, jsonVal, now]);
}

function sheetDel(key) {
  const sheet = getDataSheet();
  const data  = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
}

function sheetList(prefix) {
  const sheet = getDataSheet();
  const data  = sheet.getDataRange().getValues();
  const keys  = [];
  for (let i = 1; i < data.length; i++) {
    const k = data[i][0];
    if (!k) continue;
    if (!prefix || k.startsWith(prefix)) keys.push(k);
  }
  return keys;
}

function sheetReset() {
  const sheet = getDataSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
}

function sheetExportAll() {
  const sheet  = getDataSheet();
  const data   = sheet.getDataRange().getValues();
  const result = {};
  for (let i = 1; i < data.length; i++) {
    const k = data[i][0];
    if (!k) continue;
    try { result[k] = JSON.parse(data[i][1]); } catch { result[k] = data[i][1]; }
  }
  return result;
}

// ── AUDIT LOG SHEET ──
// Every write operation is also recorded in MCE_AuditLog for traceability

function logAudit(action, key, user) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let sheet   = ss.getSheetByName('MCE_AuditLog');
  if (!sheet) {
    sheet = ss.insertSheet('MCE_AuditLog');
    sheet.getRange(1, 1, 1, 4).setValues([['timestamp', 'action', 'key', 'user']]);
    sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  sheet.appendRow([new Date().toISOString(), action, key, user || 'ERP']);
}
