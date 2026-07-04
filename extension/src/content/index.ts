import { applyValue } from "./apply";
import { scanPage } from "./scanner";

console.log("Gov Form Copilot content script loaded", window.location.href);

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "SCAN_PAGE" || message.type === "SCAN_FIELDS") {
    const pageModel = scanPage();
    const fields = pageModel.sections.flatMap((section) => section.fields);
    sendResponse({ ok: true, pageModel, fields });
    return true;
  }

  if (message.type === "APPLY_VALUE") {
    const result = applyValue(message.fieldId, message.value);
    sendResponse(result);
    return true;
  }

  return false;
});
