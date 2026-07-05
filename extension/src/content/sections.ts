import { clean } from "./labels";

export function getSectionHeading(el: HTMLElement): string {
  const fieldset = el.closest("fieldset");
  const legend = fieldset?.querySelector<HTMLElement>("legend");
  if (legend?.innerText.trim()) return clean(legend.innerText);

  let node: HTMLElement | null = el;
  while (node && node !== document.body) {
    const headingInside = findHeadingInside(node);
    if (headingInside) return clean(headingInside);

    const previousHeading = findPreviousHeading(node);
    if (previousHeading) return clean(previousHeading);

    node = node.parentElement;
  }

  return getMainHeading() || "Page fields";
}

export function getMainHeading(): string {
  const heading = document.querySelector<HTMLElement>("h1,[role='heading']");
  return heading?.innerText ? clean(heading.innerText) : "";
}

function findHeadingInside(node: HTMLElement): string {
  const heading = node.querySelector<HTMLElement>("h1,h2,h3,h4,h5,h6,[role='heading']");
  return heading?.innerText.trim() ? heading.innerText : "";
}

function findPreviousHeading(node: HTMLElement): string {
  let current: HTMLElement | null = node;

  while (current) {
    let sibling = current.previousElementSibling as HTMLElement | null;
    while (sibling) {
      if (matchesHeading(sibling) && sibling.innerText.trim()) return sibling.innerText;

      const nested = sibling.querySelector<HTMLElement>("h1,h2,h3,h4,h5,h6,legend,[role='heading']");
      if (nested?.innerText.trim()) return nested.innerText;

      sibling = sibling.previousElementSibling as HTMLElement | null;
    }
    current = current.parentElement;
  }

  return "";
}

function matchesHeading(el: HTMLElement): boolean {
  return /^(H[1-6]|LEGEND)$/i.test(el.tagName) || el.getAttribute("role") === "heading";
}
