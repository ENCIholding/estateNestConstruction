import { getVendorRiskStatus, type VendorRiskStatus } from "./buildosIntelligence";
import type { BuildOsMasterRecord } from "./buildosWorkspace";

export type VendorMemoryInsight = {
  averageResponseDays: number | null;
  averageScore: number | null;
  deficiencyCount: number;
  id: string;
  label: string;
  linkedProjectCount: number;
  recommended: boolean;
  riskStatus: VendorRiskStatus;
  status: BuildOsMasterRecord["status"];
  tradeCategory: string;
  workAgain: string;
};

export type VendorMemorySnapshot = {
  blockedVendors: VendorMemoryInsight[];
  cautionVendors: VendorMemoryInsight[];
  repeatIssueVendors: VendorMemoryInsight[];
  topVendors: VendorMemoryInsight[];
  vendors: VendorMemoryInsight[];
};

export type VendorMemoryShortlist = {
  blockedVendors: VendorMemoryInsight[];
  cautionVendors: VendorMemoryInsight[];
  topVendors: VendorMemoryInsight[];
};

function averageVendorScore(record: BuildOsMasterRecord) {
  const scores = [
    record.qualityScore,
    record.pricingScore,
    record.reliabilityScore,
    record.communicationScore,
    record.timelinessScore,
    record.professionalismScore,
  ].filter((value): value is number => typeof value === "number" && Number.isFinite(value));

  if (!scores.length) {
    return null;
  }

  return scores.reduce((total, value) => total + value, 0) / scores.length;
}

function buildVendorInsight(record: BuildOsMasterRecord): VendorMemoryInsight {
  return {
    averageResponseDays:
      typeof record.averageResponseDays === "number" && Number.isFinite(record.averageResponseDays)
        ? record.averageResponseDays
        : null,
    averageScore: averageVendorScore(record),
    deficiencyCount: record.deficiencyCount || 0,
    id: record.id,
    label: record.companyName || record.personName,
    linkedProjectCount: record.linkedProjectIds.length,
    recommended: record.recommended ?? true,
    riskStatus: getVendorRiskStatus(record),
    status: record.status,
    tradeCategory: record.tradeCategory || "Trade not set",
    workAgain: record.workAgain || "Yes",
  };
}

function sortByOperationalValue(left: VendorMemoryInsight, right: VendorMemoryInsight) {
  if ((right.averageScore || 0) !== (left.averageScore || 0)) {
    return (right.averageScore || 0) - (left.averageScore || 0);
  }

  if (right.linkedProjectCount !== left.linkedProjectCount) {
    return right.linkedProjectCount - left.linkedProjectCount;
  }

  return left.label.localeCompare(right.label);
}

export function buildVendorMemorySnapshot(records: BuildOsMasterRecord[]): VendorMemorySnapshot {
  const vendors = records
    .filter((record) => record.type === "Vendor (Trade)")
    .map(buildVendorInsight);

  const blockedVendors = vendors
    .filter(
      (vendor) =>
        vendor.status === "Do Not Use" ||
        vendor.riskStatus === "High Risk Vendor" ||
        vendor.workAgain === "No" ||
        vendor.recommended === false
    )
    .sort((left, right) => {
      if (right.deficiencyCount !== left.deficiencyCount) {
        return right.deficiencyCount - left.deficiencyCount;
      }

      if ((right.averageResponseDays || 0) !== (left.averageResponseDays || 0)) {
        return (right.averageResponseDays || 0) - (left.averageResponseDays || 0);
      }

      return left.label.localeCompare(right.label);
    });

  const cautionVendors = vendors
    .filter(
      (vendor) =>
        !blockedVendors.some((blockedVendor) => blockedVendor.id === vendor.id) &&
        (vendor.riskStatus === "Use with Caution" ||
          vendor.workAgain === "Caution" ||
          vendor.deficiencyCount >= 2)
    )
    .sort((left, right) => {
      if (right.deficiencyCount !== left.deficiencyCount) {
        return right.deficiencyCount - left.deficiencyCount;
      }

      return sortByOperationalValue(left, right);
    });

  const repeatIssueVendors = vendors
    .filter(
      (vendor) =>
        vendor.deficiencyCount > 0 ||
        (vendor.averageResponseDays !== null && vendor.averageResponseDays > 3)
    )
    .sort((left, right) => {
      if (right.deficiencyCount !== left.deficiencyCount) {
        return right.deficiencyCount - left.deficiencyCount;
      }

      return (right.averageResponseDays || 0) - (left.averageResponseDays || 0);
    })
    .slice(0, 5);

  const topVendors = vendors
    .filter(
      (vendor) =>
        vendor.status === "Active" &&
        vendor.recommended &&
        vendor.workAgain !== "No" &&
        vendor.riskStatus === "Preferred"
    )
    .sort(sortByOperationalValue)
    .slice(0, 5);

  return {
    blockedVendors,
    cautionVendors,
    repeatIssueVendors,
    topVendors,
    vendors,
  };
}

export function getVendorInsightByRecordId(
  records: BuildOsMasterRecord[],
  recordId?: string
) {
  if (!recordId) {
    return null;
  }

  return buildVendorMemorySnapshot(records).vendors.find((vendor) => vendor.id === recordId) || null;
}

export function getVendorMemoryShortlist(
  records: BuildOsMasterRecord[],
  projectId?: string
): VendorMemoryShortlist {
  const snapshot = buildVendorMemorySnapshot(records);

  if (!projectId) {
    return {
      blockedVendors: snapshot.blockedVendors.slice(0, 4),
      cautionVendors: snapshot.cautionVendors.slice(0, 4),
      topVendors: snapshot.topVendors.slice(0, 4),
    };
  }

  const projectScoped = snapshot.vendors.filter((vendor) =>
    records.find((record) => record.id === vendor.id)?.linkedProjectIds.includes(projectId)
  );
  const sourceVendors = projectScoped.length ? projectScoped : snapshot.vendors;
  const blockedIds = new Set(snapshot.blockedVendors.map((vendor) => vendor.id));
  const cautionIds = new Set(snapshot.cautionVendors.map((vendor) => vendor.id));
  const topIds = new Set(snapshot.topVendors.map((vendor) => vendor.id));

  return {
    blockedVendors: sourceVendors.filter((vendor) => blockedIds.has(vendor.id)).slice(0, 4),
    cautionVendors: sourceVendors.filter((vendor) => cautionIds.has(vendor.id)).slice(0, 4),
    topVendors: sourceVendors.filter((vendor) => topIds.has(vendor.id)).slice(0, 4),
  };
}
