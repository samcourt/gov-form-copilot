console.log("Gov Form Copilot content script loaded", window.location.href);

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "SCAN_PAGE" || message.type === "SCAN_FIELDS") {
    const fields = [...document.querySelectorAll("input, select, textarea")]
      .filter((el: any) => !["hidden", "password", "submit", "button"].includes((el.type || "").toLowerCase()))
      .map((el: any, index) => {
        const label =
          document.querySelector(`label[for="${el.id}"]`)?.textContent ||
          el.closest("label")?.textContent ||
          el.getAttribute("aria-label") ||
          el.placeholder ||
          el.name ||
          "";

        const fieldId = el.id || el.name || `field_${index}`;
        el.setAttribute("data-gov-copilot-id", fieldId);

        return {
          fieldId,
          label: label.trim(),
          name: el.name || "",
          fieldType: el.tagName.toLowerCase() === "select" ? "select" : el.type || "text",
          type: el.type || el.tagName.toLowerCase(),
          required: !!el.required,
          visible: true,
          currentValue: el.value || "",
          options: [],
          safeToFill: !["checkbox", "radio", "file"].includes((el.type || "").toLowerCase())
        };
      });

    sendResponse({
      ok: true,
      fields,
      pageModel: {
        url: window.location.href,
        title: document.title,
        scannedAt: new Date().toISOString(),
        sections: [{ title: "Page fields", fields }]
      }
    });

    return true;
  }

  if (message.type === "APPLY_VALUE") {
    const el = document.querySelector(`[data-gov-copilot-id="${CSS.escape(message.fieldId)}"]`) as HTMLInputElement | null;
    if (!el) {
      sendResponse({ ok: false, error: "Field not found" });
      return true;
    }

    el.focus();
    el.value = message.value;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    sendResponse({ ok: true });
    return true;
  }

  return false;
});console.log("Gov Form Copilot content script loaded", window.location.href);

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "SCAN_PAGE" || message.type === "SCAN_FIELDS") {
    const fields = [...document.querySelectorAll("input, select, textarea")]
      .filter((el: any) => !["hidden", "password", "submit", "button"].includes((el.type || "").toLowerCase()))
      .map((el: any, index) => {
        const label =
          document.querySelector(`label[for="${el.id}"]`)?.textContent ||
          el.closest("label")?.textContent ||
          el.getAttribute("aria-label") ||
          el.placeholder ||
          el.name ||
          "";

        const fieldId = el.id || el.name || `field_${index}`;
        el.setAttribute("data-gov-copilot-id", fieldId);

        return {
          fieldId,
          label: label.trim(),
          name: el.name || "",
          fieldType: el.tagName.toLowerCase() === "select" ? "select" : el.type || "text",
          type: el.type || el.tagName.toLowerCase(),
          required: !!el.required,
          visible: true,
          currentValue: el.value || "",
          options: [],
          safeToFill: !["checkbox", "radio", "file"].includes((el.type || "").toLowerCase())
        };
      });

    sendResponse({
      ok: true,
      fields,
      pageModel: {
        url: window.location.href,
        title: document.title,
        scannedAt: new Date().toISOString(),
        sections: [{ title: "Page fields", fields }]
      }
    });

    return true;
  }

  if (message.type === "APPLY_VALUE") {
    const el = document.querySelector(`[data-gov-copilot-id="${CSS.escape(message.fieldId)}"]`) as HTMLInputElement | null;
    if (!el) {
      sendResponse({ ok: false, error: "Field not found" });
      return true;
    }

    el.focus();
    el.value = message.value;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    sendResponse({ ok: true });
    return true;
  }

  return false;
});