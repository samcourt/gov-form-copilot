import type { ProfileField, ProfileResponse } from "../api/client";
import { ProfileFieldCard } from "../components/ProfileFieldCard";

interface ProfilePageProps {
  profile: ProfileResponse | null;
}

function flattenProfile(profile: unknown): ProfileField[] {
  const fields: ProfileField[] = [];

  function walk(node: unknown) {
    if (!node || typeof node !== "object") return;

    if ("path" in node && "confidence" in node && "evidence" in node) {
      fields.push(node as ProfileField);
      return;
    }

    for (const value of Object.values(node)) walk(value);
  }

  walk(profile);
  return fields;
}

export function ProfilePage({ profile }: ProfilePageProps) {
  const fields = flattenProfile(profile?.profile);

  return (
    <section className="page-grid">
      <div className="hero">
        <h2>Canonical Profile</h2>
        <p>This profile is derived from evidence. It should not be edited directly.</p>
      </div>

      <section className="card-list">
        {fields.map((field) => (
          <ProfileFieldCard key={field.path} field={field} />
        ))}

        {fields.length === 0 && (
          <section className="card">
            <h3>No profile fields</h3>
            <p>Upload evidence first.</p>
          </section>
        )}
      </section>
    </section>
  );
}
