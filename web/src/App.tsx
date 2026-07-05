import { useEffect, useState } from "react";
import { AppShell } from "./components/AppShell";
import { Dashboard } from "./pages/Dashboard";
import { EvidencePage } from "./pages/EvidencePage";
import { ProfilePage } from "./pages/ProfilePage";
import { UploadPage } from "./pages/UploadPage";
import { getEvidence, getProfile, type EvidenceDocument, type ProfileResponse } from "./api/client";

export type Page = "dashboard" | "upload" | "evidence" | "profile";

export function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [status, setStatus] = useState("Ready");
  const [evidenceDocuments, setEvidenceDocuments] = useState<EvidenceDocument[]>([]);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);

  async function refreshData() {
    try {
      setStatus("Loading profile and evidence...");
      const [evidenceResult, profileResult] = await Promise.all([getEvidence(), getProfile()]);
      setEvidenceDocuments(evidenceResult.evidenceDocuments ?? []);
      setProfile(profileResult);
      setStatus("Ready");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to load data.");
    }
  }

  useEffect(() => {
    void refreshData();
  }, []);

  return (
    <AppShell page={page} setPage={setPage} status={status} onRefresh={refreshData}>
      {page === "dashboard" && (
        <Dashboard evidenceDocuments={evidenceDocuments} profile={profile} />
      )}

      {page === "upload" && (
        <UploadPage
          onUploaded={async (message) => {
            setStatus(message);
            await refreshData();
            setPage("evidence");
          }}
        />
      )}

      {page === "evidence" && (
        <EvidencePage evidenceDocuments={evidenceDocuments} />
      )}

      {page === "profile" && (
        <ProfilePage profile={profile} />
      )}
    </AppShell>
  );
}
