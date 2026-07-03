# Gov Form Copilot

A supervised Chrome extension and local Node API for evidence-backed assistance with complex government web forms.

## Architecture

- `extension/` - Chrome extension with React side panel and content script.
- `server/` - Local Express API that creates field suggestions.
- `shared/` - Shared TypeScript types used by both extension and server.

## Development

```powershell
npm install
npm run dev:server
```

In another terminal:

```powershell
npm run build:extension
```

Then load `extension/dist` in Chrome via `chrome://extensions` → Developer mode → Load unpacked.
