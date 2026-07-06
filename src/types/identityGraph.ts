// Placeholder generated from ChatGPT
// Replace with the full implementation from the chat if desired.

export type IdentityGraph = {
  people: PersonProfile[];
  relationships: Relationship[];
  households: Household[];
  applicationContexts: ApplicationContext[];
};

export type PersonProfile = {
  id: string;
  displayName: string;
};

export type Relationship = {
  id: string;
  fromPersonId: string;
  toPersonId: string;
  relationshipType: string;
};

export type Household = {
  id: string;
  members: { personId: string }[];
};

export type ApplicationContext = {
  id: string;
  applicationType: string;
  roleMappings: FormRoleMapping[];
};

export type FormRoleMapping = {
  formRole: string;
  personId: string;
};
