# ManuCost ERP

Full manufacturing ERP system — single HTML file, runs entirely in the browser.
Hosted on GitHub Pages. Data stored in browser localStorage, optionally synced to Google Sheets.

## Live App

👉 **[Open ManuCost ERP](https://YOUR-USERNAME.github.io/manucost-erp/)**

*(Replace with your actual GitHub Pages URL after deployment)*

---

## Modules

| Category | Modules |
|---|---|
| Accounts | Chart of Accounts · Journal Entry · General Ledger · Trial Balance |
| Buying | Suppliers · Payment Terms · Purchase Orders · GRN · AP Aging |
| Stock | Item Master · Warehouses & Bins · Stock Ledger · Stock Transfers |
| Manufacturing | BOM · Work Orders · Job Cost Sheet · Overhead Rates · ABC Costing |
| Selling | Customers · Quotations · Sales Orders · Sales Invoices · AR Aging |
| HR & Payroll | Employees · Timesheets · Payroll Run |
| Reports | Income Statement · Balance Sheet · Cash Flow · Inventory Reports · Ad-Hoc |
| Settings | Fiscal Year · Period Closing · Company Setup · Google Sheets Sync |

---

## Setup

### 1. Run locally
Just open `index.html` in a browser. No server needed for basic use.
Data is stored in `localStorage` — it persists across sessions in the same browser.

### 2. Enable Google Sheets sync (recommended)

Sync your data to Google Sheets so it survives cache clears and works across devices.

**Step 1 — Deploy the Apps Script:**
1. Open Google Sheets → create a new blank spreadsheet
2. **Extensions → Apps Script**
3. Delete existing code, paste the contents of `ManuCost_AppsScript.js`
4. **Deploy → New Deployment** → Type: Web App · Execute as: Me · Access: Anyone
5. Copy the Web App URL

**Step 2 — Connect the ERP:**
1. Open the ERP → **Settings → Company Setup**
2. Scroll to **Google Sheets Integration**
3. Paste the URL → **Connect**
4. Click **⬆ Push All Data to Sheets**

**Using from another device:**
Same steps — paste the URL → **Connect** → **⬇ Pull All Data from Sheets**

---

## GitHub Pages Deployment

1. Fork or upload this repo
2. Go to **Settings → Pages**
3. Source: **Deploy from a branch** → branch: `main` → folder: `/ (root)`
4. Save — your URL will be `https://YOUR-USERNAME.github.io/REPO-NAME/`

---

## Tech Stack

- Pure HTML + CSS + JavaScript — no frameworks, no build step
- localStorage for instant reads (cache layer)
- Google Apps Script REST API for cloud persistence
- D365-inspired light theme

## License

MIT — free to use, modify, and distribute.
