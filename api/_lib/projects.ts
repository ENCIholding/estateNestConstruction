export type ManagementProject = {
  id: string;
  project_name: string;
  civic_address: string;
  status: string;
  estimated_budget: number;
  selling_price?: number;
  start_date?: string;
  estimated_end_date?: string;
  actual_end_date?: string;
  legal_land_description?: string;
  warranty_start_date?: string;
  zoning_code?: string;
  deposit_amount?: number;
  development_permit_pdf?: string;
  building_permit_pdf?: string;
  real_property_report?: string;
  project_owner?: string;
  project_manager?: string;
  primary_contact_email?: string;
  next_milestone?: string;
  status_note?: string;
};

export type ProjectRegistryState = {
  editable: boolean;
  projectCount: number;
  source: "environment" | "temporary" | "unconfigured";
};

let inMemoryProjects: ManagementProject[] = [];

function isProjectRecord(project: unknown): project is ManagementProject {
  return (
    !!project &&
    typeof project === "object" &&
    typeof (project as ManagementProject).id === "string" &&
    typeof (project as ManagementProject).project_name === "string" &&
    typeof (project as ManagementProject).civic_address === "string"
  );
}

function readProjectsFromEnv(): ManagementProject[] | null {
  const raw = process.env.MANAGEMENT_PROJECTS_JSON;

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return null;
    }

    return parsed.filter(isProjectRecord);
  } catch {
    return null;
  }
}

export function getProjectRegistryState(): ProjectRegistryState {
  const envProjects = readProjectsFromEnv();

  if (envProjects?.length) {
    return {
      editable: false,
      projectCount: envProjects.length,
      source: "environment",
    };
  }

  if (inMemoryProjects.length) {
    return {
      editable: false,
      projectCount: inMemoryProjects.length,
      source: "temporary",
    };
  }

  return {
    editable: false,
    projectCount: 0,
    source: "unconfigured",
  };
}

export async function getAllProjects(): Promise<ManagementProject[]> {
  const envProjects = readProjectsFromEnv();
  return (envProjects ?? inMemoryProjects).map((project) => ({ ...project }));
}

export async function getProjectById(
  id: string
): Promise<ManagementProject | null> {
  const projects = await getAllProjects();
  return projects.find((project) => project.id === id) ?? null;
}

export async function updateProjectById(
  id: string,
  patch: Partial<ManagementProject>
): Promise<ManagementProject | null> {
  const projectIndex = inMemoryProjects.findIndex((project) => project.id === id);

  if (projectIndex === -1) {
    return null;
  }

  const updatedProject = {
    ...inMemoryProjects[projectIndex],
    ...patch,
    id,
  };

  inMemoryProjects = inMemoryProjects.map((project, index) =>
    index === projectIndex ? updatedProject : project
  );

  return { ...updatedProject };
}
