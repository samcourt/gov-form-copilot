import type { PageModel } from "@gov-form-copilot/shared";

interface PageSummaryProps {
  page: PageModel;
}

export function PageSummary({ page }: PageSummaryProps) {
  return (
    <section className="page-summary">
      <strong>{page.title || "Untitled page"}</strong>
      <span>{page.url}</span>
    </section>
  );
}
