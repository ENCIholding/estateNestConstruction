export type ManagementProject = {
  id: string;
  project_name: string;
  civic_address: string;
  status: string;
  estimated_budget: number;
  selling_price?: number;
  start_date?: string;
  estimated_end_date?: string;
  legal_land_description?: string;
  warranty_start_date?: string;
};

const fallbackProjects: ManagementProject[] = [
  {
    id: "p1",
    project_name: "Parkallen Fourplex",
    civic_address: "109 Street NW, Edmonton",
    status: "Active",
    estimated_budget: 2300000,
    selling_price: 2650000,
    start_date: "2026-03-01",
    estimated_end_date: "2026-10-30",
    legal_land_description: "Plan 1221KS, Block 12, Lot 4",
    warranty_start_date: "2026-11-01",
  },
  {
    id: "p2",
    project_name: "Corner Daycare Concept",
    civic_address: "80 Ave NW, Edmonton",
    status: "Pre-Construction",
    estimated_budget: 1200000,
    selling_price: 1480000,
    start_date: "2026-05-15",
    estimated_end_date: "2027-01-31",
    legal_land_description: "Plan 7621981, Block 8, Lot 16",
  },
];

let inMemoryProjects = fallbackProjects.map((project) => ({ ...project }));

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

    return parsed.filter(
      (project): project is ManagementProject =>
        !!project &&
        typeof project.id === "string" &&
        typeof project.project_name === "string" &&
        typeof project.civic_address === "string"
    );
  } catch {
    return null;
  }
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
