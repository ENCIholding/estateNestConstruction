export const REVISION_AUTHORITIES = [
  "Building",
  "Development",
  "Zoning",
  "Planning",
  "Fire",
  "Waste Management",
  "Transportation",
  "EPCOR",
  "Drainage",
  "Landscaping",
  "Environmental",
  "Engineering",
  "Appraiser",
  "CMHC",
  "Peakhill Capital",
  "ATB Financial",
  "Insurance",
  "Lawyer",
  "Realtor",
  "Buyer",
  "Other",
] as const;

export const REVISION_SEVERITIES = [
  "Critical",
  "High",
  "Moderate",
  "Minor",
  "Informational",
] as const;

export const REVISION_STATUSES = [
  "Open",
  "In Progress",
  "Submitted",
  "Awaiting Reviewer",
  "Awaiting Third Party",
  "Resolved",
  "Closed",
  "Deferred",
] as const;

export const REVISION_DISCIPLINES = [
  "Architectural",
  "Structural",
  "Mechanical",
  "Electrical",
  "Plumbing",
  "Civil / Grading",
  "Landscaping",
  "Fire / Life Safety",
  "Energy / Envelope",
  "Financial / Lending",
  "Legal",
  "Procurement",
  "Construction",
  "Other",
] as const;

export type RevisionAuthority = (typeof REVISION_AUTHORITIES)[number];
export type RevisionSeverity = (typeof REVISION_SEVERITIES)[number];
export type RevisionStatus = (typeof REVISION_STATUSES)[number];
export type RevisionDiscipline = (typeof REVISION_DISCIPLINES)[number];

export type RevisionProjectOption = {
  id: string;
  name: string;
  address: string;
};

export type RevisionComment = {
  id: string;
  projectId: string;
  projectName: string;
  projectAddress: string;
  commentId: string;
  dateReceived: string;
  authority: RevisionAuthority;
  reviewerName: string;
  discipline: RevisionDiscipline;
  severity: RevisionSeverity;
  status: RevisionStatus;
  dueDate?: string;
  assignedTo: string;
  sourceDocument?: string;
  relatedSheet?: string;
  codeReference?: string;
  commentSummary: string;
  resolutionSummary?: string;
  dateResolved?: string;
  lessonsLearned?: string;
  internalNotes?: string;
  attachmentsPlaceholder?: string;
  createdAt: string;
  updatedAt: string;
};

export type LessonLearned = {
  id: string;
  projectId: string;
  projectName: string;
  issueCategory: string;
  whatHappened: string;
  impact: string;
  resolution: string;
  futurePrevention: string;
  appliesToFutureProjects: boolean;
  createdAt: string;
  updatedAt: string;
};

export type RevisionChecklistItem = {
  id: string;
  text: string;
  source: "baseline" | "lesson";
};

export const revisionSeedProjects: RevisionProjectOption[] = [
  {
    id: "park-allen",
    name: "Park Allen",
    address: "6504-6510 109 Street NW",
  },
  {
    id: "glenora-project",
    name: "Glenora Project",
    address: "Glenora, Edmonton AB",
  },
  {
    id: "irvine-creek-lot",
    name: "Irvine Creek Lot",
    address: "Irvine Creek, AB",
  },
  {
    id: "eastwood-project",
    name: "Eastwood Project",
    address: "Eastwood, Edmonton AB",
  },
  {
    id: "futureedge-homes-project",
    name: "FutureEdge Homes Project",
    address: "Edmonton Region",
  },
];

export const revisionSeedComments: RevisionComment[] = [
  {
    id: "rev-parkallen-001",
    projectId: "park-allen",
    projectName: "Park Allen",
    projectAddress: "6504-6510 109 Street NW",
    commentId: "PA-BLDG-001",
    dateReceived: "2026-04-15",
    authority: "Building",
    reviewerName: "M. Jensen",
    discipline: "Architectural",
    severity: "High",
    status: "Open",
    dueDate: "2026-05-10",
    assignedTo: "Drafting Team",
    sourceDocument: "Building Permit Review Round 1",
    relatedSheet: "A1.01 / A2.03",
    codeReference: "N/A",
    commentSummary:
      "Drawing scale annotation on A1.01 does not match plotted scale used on A2.03 details.",
    resolutionSummary: "Scale verification package in progress with re-plotted sheets.",
    lessonsLearned:
      "Mandatory scale audit must be completed before submission package issue.",
    internalNotes:
      "Cross-check print setup against consultant plotting profile before upload.",
    attachmentsPlaceholder: "Placeholder: revised plot set and reviewer response letter",
    createdAt: "2026-04-15T16:30:00.000Z",
    updatedAt: "2026-04-18T19:12:00.000Z",
  },
  {
    id: "rev-parkallen-002",
    projectId: "park-allen",
    projectName: "Park Allen",
    projectAddress: "6504-6510 109 Street NW",
    commentId: "PA-BLDG-002",
    dateReceived: "2026-04-15",
    authority: "Building",
    reviewerName: "M. Jensen",
    discipline: "Architectural",
    severity: "Critical",
    status: "In Progress",
    dueDate: "2026-05-08",
    assignedTo: "Design Lead",
    sourceDocument: "Building Permit Review Round 1",
    relatedSheet: "A6.02",
    codeReference: "NBC 9.10.17",
    commentSummary:
      "Window supplier quote quantities and sizes do not match architectural window schedule.",
    resolutionSummary:
      "Architect and supplier reconciliation meeting completed; updated schedule pending issue.",
    lessonsLearned:
      "Schedule lock must be tied to supplier quote freeze before issue for permit.",
    internalNotes: "Track quote revision in procurement log for lender draw transparency.",
    attachmentsPlaceholder: "Placeholder: supplier quote revision and marked-up schedule",
    createdAt: "2026-04-15T16:35:00.000Z",
    updatedAt: "2026-04-19T15:45:00.000Z",
  },
  {
    id: "rev-parkallen-003",
    projectId: "park-allen",
    projectName: "Park Allen",
    projectAddress: "6504-6510 109 Street NW",
    commentId: "PA-BLDG-003",
    dateReceived: "2026-04-16",
    authority: "Building",
    reviewerName: "A. Ridley",
    discipline: "Fire / Life Safety",
    severity: "High",
    status: "Submitted",
    dueDate: "2026-05-12",
    assignedTo: "Code Consultant",
    sourceDocument: "Building Permit Review Round 1",
    relatedSheet: "A4.01",
    codeReference: "ABC 9.10.14",
    commentSummary:
      "West elevation spatial separation rationale is unclear relative to opening percentages.",
    resolutionSummary:
      "Spatial separation worksheet and annotated elevation issued in response package.",
    internalNotes: "Await reviewer confirmation of worksheet assumptions.",
    attachmentsPlaceholder: "Placeholder: spatial separation worksheet",
    createdAt: "2026-04-16T11:05:00.000Z",
    updatedAt: "2026-04-21T14:26:00.000Z",
  },
  {
    id: "rev-parkallen-004",
    projectId: "park-allen",
    projectName: "Park Allen",
    projectAddress: "6504-6510 109 Street NW",
    commentId: "PA-BLDG-004",
    dateReceived: "2026-04-16",
    authority: "Building",
    reviewerName: "A. Ridley",
    discipline: "Energy / Envelope",
    severity: "Moderate",
    status: "Awaiting Third Party",
    dueDate: "2026-05-20",
    assignedTo: "Envelope Consultant",
    sourceDocument: "Building Permit Review Round 1",
    relatedSheet: "A8.01",
    codeReference: "CCMC",
    commentSummary:
      "NovikStone CCMC report must be submitted as a standalone supporting document.",
    resolutionSummary:
      "Manufacturer request sent for current CCMC report package.",
    lessonsLearned:
      "Exterior cladding compliance documents should be pre-collected before first submission.",
    internalNotes: "Consultant to verify report expiry date before upload.",
    attachmentsPlaceholder: "Placeholder: CCMC report PDF",
    createdAt: "2026-04-16T11:22:00.000Z",
    updatedAt: "2026-04-22T10:08:00.000Z",
  },
  {
    id: "rev-parkallen-005",
    projectId: "park-allen",
    projectName: "Park Allen",
    projectAddress: "6504-6510 109 Street NW",
    commentId: "PA-BLDG-005",
    dateReceived: "2026-04-17",
    authority: "Building",
    reviewerName: "S. Hargreaves",
    discipline: "Construction",
    severity: "High",
    status: "Awaiting Reviewer",
    dueDate: "2026-05-14",
    assignedTo: "Site Superintendent",
    sourceDocument: "Building Permit Review Round 1",
    relatedSheet: "A5.02 / S2.01",
    codeReference: "NBC 9.9.10",
    commentSummary:
      "Egress window and deck post placement coordination appears to obstruct emergency egress path.",
    resolutionSummary:
      "Deck post layout revised and re-coordinated with window well detail.",
    lessonsLearned:
      "Always run combined egress and deck framing overlay before submission.",
    internalNotes: "Confirm with structural designer before issuing IFC.",
    attachmentsPlaceholder: "Placeholder: revised deck framing overlay",
    createdAt: "2026-04-17T09:40:00.000Z",
    updatedAt: "2026-04-23T17:20:00.000Z",
  },
  {
    id: "rev-parkallen-006",
    projectId: "park-allen",
    projectName: "Park Allen",
    projectAddress: "6504-6510 109 Street NW",
    commentId: "PA-EPCOR-001",
    dateReceived: "2026-04-22",
    authority: "EPCOR",
    reviewerName: "Pending Assignment",
    discipline: "Civil / Grading",
    severity: "Informational",
    status: "Open",
    dueDate: "2026-05-25",
    assignedTo: "Civil Consultant",
    sourceDocument: "Utility Coordination Placeholder",
    relatedSheet: "C1.01",
    commentSummary: "EPCOR utility servicing comment placeholder for incoming review round.",
    internalNotes: "Update once formal EPCOR response is received.",
    attachmentsPlaceholder: "Placeholder: EPCOR review letter",
    createdAt: "2026-04-22T13:15:00.000Z",
    updatedAt: "2026-04-22T13:15:00.000Z",
  },
  {
    id: "rev-parkallen-007",
    projectId: "park-allen",
    projectName: "Park Allen",
    projectAddress: "6504-6510 109 Street NW",
    commentId: "PA-FIRE-001",
    dateReceived: "2026-04-24",
    authority: "Fire",
    reviewerName: "Pending Assignment",
    discipline: "Fire / Life Safety",
    severity: "Moderate",
    status: "Deferred",
    dueDate: "2026-05-30",
    assignedTo: "Code Consultant",
    sourceDocument: "Fire Review Placeholder",
    relatedSheet: "FP1.01",
    commentSummary: "Fire and life safety review placeholder awaiting department intake.",
    internalNotes: "Track once file is opened by fire prevention reviewer.",
    attachmentsPlaceholder: "Placeholder: fire review memo",
    createdAt: "2026-04-24T12:10:00.000Z",
    updatedAt: "2026-04-24T12:10:00.000Z",
  },
  {
    id: "rev-parkallen-008",
    projectId: "park-allen",
    projectName: "Park Allen",
    projectAddress: "6504-6510 109 Street NW",
    commentId: "PA-WASTE-001",
    dateReceived: "2026-04-25",
    authority: "Waste Management",
    reviewerName: "M. Paulsen",
    discipline: "Architectural",
    severity: "Minor",
    status: "Resolved",
    dueDate: "2026-05-05",
    assignedTo: "Design Coordinator",
    sourceDocument: "Waste Access Review",
    relatedSheet: "A0.03",
    commentSummary:
      "Clarify waste staging location dimensions to ensure truck access and turning radius notes are readable.",
    resolutionSummary:
      "Waste staging zone dimensions added with enlarged callout and legend update.",
    dateResolved: "2026-04-30",
    lessonsLearned:
      "Site logistics overlays should always include enlarged waste access callouts.",
    internalNotes: "Close after city confirms revised legend acceptance.",
    attachmentsPlaceholder: "Placeholder: updated site logistics sheet",
    createdAt: "2026-04-25T15:05:00.000Z",
    updatedAt: "2026-04-30T18:44:00.000Z",
  },
];

export const revisionSeedLessons: LessonLearned[] = [
  {
    id: "lesson-001",
    projectId: "park-allen",
    projectName: "Park Allen",
    issueCategory: "Drawing Control",
    whatHappened:
      "Permit reviewer identified inconsistent plotted scale references across sheet set.",
    impact:
      "Reviewer confidence dropped and permit review cycle extended.",
    resolution:
      "Issued corrected sheet set and documented scale verification sheet-by-sheet.",
    futurePrevention:
      "Run pre-issue plotting QA against title-block scale notes for every sheet in package.",
    appliesToFutureProjects: true,
    createdAt: "2026-04-18T19:20:00.000Z",
    updatedAt: "2026-04-18T19:20:00.000Z",
  },
  {
    id: "lesson-002",
    projectId: "park-allen",
    projectName: "Park Allen",
    issueCategory: "Procurement Coordination",
    whatHappened:
      "Window schedule and supplier quote drifted before permit submission.",
    impact:
      "Critical reviewer comment and risk of redesign during review.",
    resolution:
      "Reconciled quote and schedule with locked version control checkpoint.",
    futurePrevention:
      "Freeze supplier quote and architecture schedule in one approval gate before submission.",
    appliesToFutureProjects: true,
    createdAt: "2026-04-19T16:00:00.000Z",
    updatedAt: "2026-04-19T16:00:00.000Z",
  },
  {
    id: "lesson-003",
    projectId: "park-allen",
    projectName: "Park Allen",
    issueCategory: "Code & Egress",
    whatHappened:
      "Egress path became unclear because deck post coordination was not overlaid with window wells.",
    impact:
      "High-severity review comment and additional consultant coordination effort.",
    resolution:
      "Issued coordinated deck and egress overlay with code note references.",
    futurePrevention:
      "Add mandatory egress, window well, and deck framing overlay to submission QA checklist.",
    appliesToFutureProjects: true,
    createdAt: "2026-04-23T17:30:00.000Z",
    updatedAt: "2026-04-23T17:30:00.000Z",
  },
  {
    id: "lesson-004",
    projectId: "park-allen",
    projectName: "Park Allen",
    issueCategory: "External Documentation",
    whatHappened:
      "CCMC envelope documentation was requested separately after initial review.",
    impact:
      "Delayed response package while third-party documentation was gathered.",
    resolution:
      "Created a supplier document request tracker and stored evidence in source package.",
    futurePrevention:
      "Collect CCMC and product compliance reports as a submission prerequisite.",
    appliesToFutureProjects: true,
    createdAt: "2026-04-22T10:15:00.000Z",
    updatedAt: "2026-04-22T10:15:00.000Z",
  },
];

export const baselinePreSubmissionChecklist = [
  "Verify all drawing sheets are plotted to stated scale",
  "Verify window schedule matches supplier quote",
  "Verify window tags match elevations",
  "Verify spatial separation calculations match elevations",
  "Verify CCMC reports are current and submitted separately",
  "Verify egress windows and window wells are coordinated",
  "Verify deck/stair posts do not obstruct egress",
  "Verify grading/plot plan/site plan are submitted as separate required documents",
  "Verify all municipal reviewer comments have a response attached",
] as const;

export function buildChecklistFromLessons(
  lessons: LessonLearned[]
): RevisionChecklistItem[] {
  const baselineItems = baselinePreSubmissionChecklist.map((text, index) => ({
    id: `baseline-${index + 1}`,
    source: "baseline" as const,
    text,
  }));

  const lessonItems = lessons
    .filter((lesson) => lesson.appliesToFutureProjects)
    .map((lesson, index) => ({
      id: `lesson-${lesson.id}-${index + 1}`,
      source: "lesson" as const,
      text: lesson.futurePrevention,
    }));

  const deduped = new Map<string, RevisionChecklistItem>();

  [...baselineItems, ...lessonItems].forEach((item) => {
    const key = item.text.trim().toLowerCase();
    if (!key || deduped.has(key)) {
      return;
    }

    deduped.set(key, item);
  });

  return Array.from(deduped.values());
}

export function isResolvedStatus(status: RevisionStatus) {
  return status === "Resolved" || status === "Closed";
}
