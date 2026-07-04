import type { ReactNode } from "react";
import type { Page } from "../App";

interface AppShellProps {
  page: Page;
  setPage: (page: Page) => void;
  status: string;
  onRefresh: () => void;
  children: ReactNode;
}

const navItems: Array<{ page: Page; label: string }> = [
  { page: "dashboard", label: "Dashboard" },
  { page: "upload", label: "Upload" },
  { page: "evidence", label: "Evidence" },
  { page: "profile", label: "Profile" }
];

export function AppShell({ page, setPage, status, onRefresh, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <h1>Gov Form Copilot</h1>
          <p>Profile & Evidence Portal</p>
        </div>

        <nav>
          {navItems.map((item) => (
            <button
              key={item.page}
              className={page === item.page ? "active" : ""}
              onClick={() => setPage(item.page)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="content">
        <header className="topbar">
          <span>{status}</span>
          <button onClick={onRefresh}>Refresh</button>
        </header>

        {children}
      </main>
    </div>
  );
}
