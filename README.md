# Gov Form Copilot v1

A supervised Chrome extension + local API prototype for navigating complex government web forms with user oversight.

This version deliberately does **not** handle passwords, MFA, declarations, payment, or final submission. The user stays in control.

## What it does

- Scans visible fields on the current NSW enrolment page
- Shows fields in a Chrome side panel
- Calls a local Node API for proposed values
- Displays suggestions with confidence and evidence source
- Lets the user apply one field at a time
- Refuses to auto-fill password, hidden, submit, file, checkbox, and radio inputs in this first version

## Folder structure

```text
extension/   Chrome extension built with Vite + React
server/      Local Node API with mock profile/evidence data
```

## Prerequisites

Install:

- Node.js LTS
- Google Chrome or Microsoft Edge

## 1. Start the local API

```bash
cd server
npm install
npm run dev
```

The API runs at:

```text
http://localhost:8787
```

## 2. Build the extension

In a second terminal:

```bash
cd extension
npm install
npm run build
```

This creates:

```text
extension/dist
```

## 3. Load the extension in Chrome

Open:

```text
chrome://extensions
```

Then:

1. Turn on **Developer mode**
2. Click **Load unpacked**
3. Select `extension/dist`

## 4. Use it

1. Open `https://ehub.enrol.education.nsw.gov.au/login`
2. Log in normally and complete MFA yourself
3. Navigate to a form page
4. Click the Gov Form Copilot extension icon
5. Click **Scan page**
6. Review suggestions
7. Click **Apply** beside individual fields only when you agree

## Development mode

For extension development:

```bash
cd extension
npm run dev
```

But for Chrome extension loading, use the built `dist` folder.

## Safety boundaries

The extension currently blocks:

- password fields
- hidden fields
- submit buttons
- file uploads
- checkboxes
- radio buttons

This is intentional. Add support slowly and explicitly.

