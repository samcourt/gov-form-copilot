console.log('Gov Form Copilot content script loaded', window.location.href);

const BLOCKED_TYPES = new Set(['hidden', 'password', 'submit', 'button', 'file', 'checkbox', 'radio']);

function textFrom(el) {
  return (el?.innerText || el?.textContent || '').replace(/\s+/g, ' ').trim();
}

function findLabel(el) {
  const labels = [];

  if (el.id) {
    const explicitLabel = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    if (explicitLabel) labels.push(textFrom(explicitLabel));
  }

  const wrappingLabel = el.closest('label');
  if (wrappingLabel) labels.push(textFrom(wrappingLabel));

  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel) labels.push(ariaLabel);

  const ariaLabelledBy = el.getAttribute('aria-labelledby');
  if (ariaLabelledBy) {
    const labelledByText = ariaLabelledBy
      .split(/\s+/)
      .map(id => textFrom(document.getElementById(id)))
      .filter(Boolean)
      .join(' ');
    if (labelledByText) labels.push(labelledByText);
  }

  if (el.placeholder) labels.push(el.placeholder);
  if (el.name) labels.push(el.name);

  return [...new Set(labels.filter(Boolean))].join(' | ');
}

function nearestSectionHeading(el) {
  const container = el.closest('section, fieldset, form, main, div');
  if (!container) return '';
  const heading = container.querySelector('h1, h2, h3, legend, [role="heading"]');
  return textFrom(heading);
}

function scanFields() {
  const controls = [...document.querySelectorAll('input, select, textarea')];

  const fields = controls.map((el, index) => {
    const type = (el.type || el.tagName || '').toLowerCase();
    const fieldId = el.id || el.name || `field_${index}`;
    el.dataset.govCopilotId = fieldId;

    return {
      fieldId,
      label: findLabel(el),
      section: nearestSectionHeading(el),
      tag: el.tagName.toLowerCase(),
      type,
      name: el.name || '',
      value: el.value || '',
      required: Boolean(el.required || el.getAttribute('aria-required') === 'true'),
      disabled: Boolean(el.disabled),
      readonly: Boolean(el.readOnly),
      safeToFill: !BLOCKED_TYPES.has(type) && !el.disabled && !el.readOnly,
      options: el.tagName.toLowerCase() === 'select'
        ? [...el.options].map(opt => ({ value: opt.value, text: opt.text }))
        : []
    };
  });

  const visibleFields = fields.filter(field => field.type !== 'hidden');

  return {
    url: window.location.href,
    title: document.title,
    headings: [...document.querySelectorAll('h1, h2, h3')].map(textFrom).filter(Boolean),
    fields: visibleFields
  };
}

function setNativeValue(el, value) {
  const prototype = Object.getPrototypeOf(el);
  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');

  if (descriptor?.set) {
    descriptor.set.call(el, value);
  } else {
    el.value = value;
  }
}

function applyValue(fieldId, value) {
  const el = document.querySelector(`[data-gov-copilot-id="${CSS.escape(fieldId)}"]`);

  if (!el) return { ok: false, error: 'Field not found on page. Try scanning again.' };

  const type = (el.type || '').toLowerCase();
  if (BLOCKED_TYPES.has(type)) return { ok: false, error: `Blocked field type: ${type}` };
  if (el.disabled || el.readOnly) return { ok: false, error: 'Field is disabled or read-only.' };

  el.focus();

  if (el.tagName.toLowerCase() === 'select') {
    const option = [...el.options].find(opt => opt.value === value || opt.text === value);
    if (!option) return { ok: false, error: 'No matching select option found.' };
    el.value = option.value;
  } else {
    setNativeValue(el, value);
  }

  el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: String(value) }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.blur();

  return { ok: true };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    if (message.type === 'SCAN_FIELDS') {
      sendResponse(scanFields());
      return true;
    }

    if (message.type === 'APPLY_VALUE') {
      sendResponse(applyValue(message.fieldId, message.value));
      return true;
    }
  } catch (error) {
    sendResponse({ ok: false, error: error.message });
    return true;
  }
});
