export type ReviewStatus =
  | "Pending"
  | "Awaiting Approval"
  | "RM Approved"
  | "RM Rejected"
  | "PMO Approved"
  | "PMO Rejected"
  | "Approved"
  | "Rejected";

export interface ApprovalRecord {
  approver: string;
  role: "Resource Manager" | "PMO";
  decision: "Approved" | "Rejected";
  comment: string;
  decidedOn: string;
}

export interface ReviewRequest {
  id: string;
  demandId: string;
  requestedBy: string;
  requestedOn: string;
  project: string;
  resourceName: string;
  projectRole: string;
  portfolio: string;
  pillar: string;
  startDate: string;
  endDate: string;
  type: "Internal" | "External";
  vendorName: string;
  allocationPercent: number;
  estimatedRate: number;
  currentYearForecast: number;
  country: string;
  resourceCount: number;
  status: ReviewStatus;
  approvalHistory: ApprovalRecord[];
  mailSubject: string;
  mailBody: string;
}

export const mockReviewRequests: ReviewRequest[] = [
  // ── Fully Approved (PMO Approved / Approved) ─────────────────────────────
  {
    id: "rev-001",
    demandId: "dem-2",
    requestedBy: "Anurag Vaishy",
    requestedOn: "2027-05-12 09:15:23",
    project: "Data Modernization - ASPAC",
    resourceName: "Karthik Dontula",
    projectRole: "Technical Lead",
    portfolio: "Hi-tech",
    pillar: "Hi-tech",
    startDate: "2027-01-01",
    endDate: "2028-12-31",
    type: "Internal",
    vendorName: "",
    allocationPercent: 100,
    estimatedRate: 130,
    currentYearForecast: 270400,
    country: "Australia",
    resourceCount: 1,
    status: "PMO Approved",
    approvalHistory: [
      {
        approver: "Sarah Mitchell",
        role: "Resource Manager",
        decision: "Approved",
        comment: "Resource availability confirmed. Strong fit for the role.",
        decidedOn: "2027-05-13 14:22:33",
      },
      {
        approver: "James Thornton",
        role: "PMO",
        decision: "Approved",
        comment: "Budget cleared. Approved for project onboarding.",
        decidedOn: "2027-05-14 14:45:22",
      },
    ],
    mailSubject:
      "Resource Review Required: Technical Lead – Data Modernization ASPAC",
    mailBody:
      "Hi Manager,\n\nA resource request has been submitted for your review and approval.\n\nProject: Data Modernization - ASPAC\nRole: Technical Lead\nResource: Karthik Dontula\nAllocation: 100%\nPeriod: Jan 2027 – Dec 2028\nEstimated Rate: $130/hr\nForecast (Current Year): $270,400\n\nPlease review the details and approve or decline the request at your earliest convenience.\n\nThank you,\nResource Management System",
  },
  {
    id: "rev-002",
    demandId: "dem-5",
    requestedBy: "Karthik Dontula",
    requestedOn: "2027-05-13 10:08:41",
    project: "QE Automation",
    resourceName: "Ian Lee",
    projectRole: "QA Engineer",
    portfolio: "Retail",
    pillar: "Retail",
    startDate: "2027-03-01",
    endDate: "2027-12-31",
    type: "External",
    vendorName: "Hyqoo",
    allocationPercent: 75,
    estimatedRate: 95,
    currentYearForecast: 148200,
    country: "Germany",
    resourceCount: 1,
    status: "Approved",
    approvalHistory: [
      {
        approver: "Sarah Mitchell",
        role: "Resource Manager",
        decision: "Approved",
        comment: "Resource availability confirmed. Good fit for the role.",
        decidedOn: "2027-05-14 11:32:18",
      },
      {
        approver: "James Thornton",
        role: "PMO",
        decision: "Approved",
        comment: "Vendor rate within budget. Approved.",
        decidedOn: "2027-05-15 14:45:22",
      },
    ],
    mailSubject: "Resource Review Required: QA Engineer – QE Automation",
    mailBody:
      "Hi Manager,\n\nA resource request has been submitted for your review and approval.\n\nProject: QE Automation\nRole: QA Engineer\nResource: Ian Lee (External – Hyqoo)\nAllocation: 75%\nPeriod: Mar 2027 – Dec 2027\nEstimated Rate: $95/hr\nForecast (Current Year): $148,200\n\nPlease review and take action.\n\nThank you,\nResource Management System",
  },
  {
    id: "rev-003",
    demandId: "dem-10",
    requestedBy: "Adnan Siddiqui",
    requestedOn: "2027-05-14 08:45:12",
    project: "Cloud Enablement",
    resourceName: "Rich Bowers",
    projectRole: "DevOps Engineer",
    portfolio: "Banking",
    pillar: "Banking",
    startDate: "2027-02-01",
    endDate: "2028-06-30",
    type: "Internal",
    vendorName: "",
    allocationPercent: 50,
    estimatedRate: 110,
    currentYearForecast: 114400,
    country: "Sydney",
    resourceCount: 1,
    status: "PMO Approved",
    approvalHistory: [
      {
        approver: "Sarah Mitchell",
        role: "Resource Manager",
        decision: "Approved",
        comment: "Capacity confirmed for the allocation period.",
decidedOn: "2027-05-15 09:22:07",      },
      {
        approver: "James Thornton",
        role: "PMO",
        decision: "Approved",
        comment: "Budget cleared. Approved for project onboarding.",
decidedOn: "2027-05-16 14:48:55",      },
    ],
    mailSubject: "Resource Review Required: DevOps Engineer – Cloud Enablement",
    mailBody:
      "Hi Manager,\n\nA resource request has been submitted for your review and approval.\n\nProject: Cloud Enablement\nRole: DevOps Engineer\nResource: Rich Bowers\nAllocation: 50%\nPeriod: Feb 2027 – Jun 2028\nEstimated Rate: $110/hr\nForecast (Current Year): $114,400\n\nPlease review and take action.\n\nThank you,\nResource Management System",
  },
  {
    id: "rev-004",
    demandId: "dem-15",
    requestedBy: "Matthew Truelove",
requestedOn: "2027-05-10 13:10:34",
    project: "Application Support",
    resourceName: "Lindsey Lord",
    projectRole: "Business Analyst",
    portfolio: "Healthcare",
    pillar: "Healthcare",
    startDate: "2027-01-15",
    endDate: "2027-09-30",
    type: "External",
    vendorName: "Collabera",
    allocationPercent: 100,
    estimatedRate: 85,
    currentYearForecast: 176800,
    country: "Poland",
    resourceCount: 1,
    status: "Approved",
    approvalHistory: [
      {
        approver: "Sarah Mitchell",
        role: "Resource Manager",
        decision: "Approved",
        comment: "Resource approved. Fits project requirements well.",
decidedOn: "2027-05-11 16:05:27",      },
      {
        approver: "James Thornton",
        role: "PMO",
        decision: "Approved",
        comment: "Scope and budget aligned. Fully approved.",
        decidedOn: "2027-05-12 14:22:33",
      },
    ],
    mailSubject:
      "Resource Review Required: Business Analyst – Application Support",
    mailBody:
      "Hi Manager,\n\nA resource request has been submitted for your review.\n\nProject: Application Support\nRole: Business Analyst\nResource: Lindsey Lord (External – Collabera)\nAllocation: 100%\nPeriod: Jan 2027 – Sep 2027\n\nThank you,\nResource Management System",
  },
  {
    id: "rev-006",
    demandId: "dem-22",
    requestedBy: "Priya Nair",
    requestedOn: "2027-05-08 15:41:09",
    project: "ERP Transformation",
    resourceName: "Marcus Webb",
    projectRole: "Solution Architect",
    portfolio: "Banking",
    pillar: "Banking",
    startDate: "2027-02-01",
    endDate: "2028-01-31",
    type: "Internal",
    vendorName: "",
    allocationPercent: 80,
    estimatedRate: 145,
    currentYearForecast: 241920,
    country: "USA",
    resourceCount: 1,
    status: "PMO Approved",
    approvalHistory: [
      {
        approver: "Sarah Mitchell",
        role: "Resource Manager",
        decision: "Approved",
        comment: "Availability confirmed. Excellent technical background.",
        decidedOn: "2027-05-09 11:27:45",
      },
      {
        approver: "James Thornton",
        role: "PMO",
        decision: "Approved",
        comment: "Critical role for ERP program. Approved.",
        decidedOn: "2027-05-10 15:41:09",
      },
    ],
    mailSubject:
      "Resource Review Required: Solution Architect – ERP Transformation",
    mailBody:
      "Hi Manager,\n\nA resource request has been submitted for review.\n\nProject: ERP Transformation\nRole: Solution Architect\nResource: Marcus Webb\nAllocation: 80%\nPeriod: Feb 2027 – Jan 2028\n\nThank you,\nResource Management System",
  },
  {
    id: "rev-007",
    demandId: "dem-25",
    requestedBy: "Lena Hoffman",
    requestedOn: "2027-05-06 15:41:09",
    project: "Digital Payments Platform",
    resourceName: "Aisha Okonkwo",
    projectRole: "Frontend Developer",
    portfolio: "Retail",
    pillar: "Retail",
    startDate: "2027-03-15",
    endDate: "2027-12-31",
    type: "External",
    vendorName: "TechBridge",
    allocationPercent: 100,
    estimatedRate: 90,
    currentYearForecast: 158400,
    country: "Nigeria",
    resourceCount: 1,
    status: "Approved",
    approvalHistory: [
      {
        approver: "Sarah Mitchell",
        role: "Resource Manager",
        decision: "Approved",
        comment: "Strong portfolio. Approved for onboarding.",
        decidedOn: "2027-05-07 14:22:33",
      },
      {
        approver: "James Thornton",
        role: "PMO",
        decision: "Approved",
        comment: "Rate competitive. Cleared for the project.",
        decidedOn: "2027-05-08 14:22:33",
      },
    ],
    mailSubject:
      "Resource Review Required: Frontend Developer – Digital Payments Platform",
    mailBody:
      "Hi Manager,\n\nA resource request has been submitted for review.\n\nProject: Digital Payments Platform\nRole: Frontend Developer\nResource: Aisha Okonkwo (External – TechBridge)\nAllocation: 100%\nPeriod: Mar 2027 – Dec 2027\n\nThank you,\nResource Management System",
  },

  // ── Pending PMO Review (RM Approved) ────────────────────────────────────
  {
    id: "rev-008",
    demandId: "dem-30",
    requestedBy: "Samuel Osei",
    requestedOn: "05/28/2027 14:22:33",
    project: "Supply Chain Analytics",
    resourceName: "Fatima Al-Rashid",
    projectRole: "Data Engineer",
    portfolio: "Hi-tech",
    pillar: "Hi-tech",
    startDate: "2027-06-01",
    endDate: "2028-05-31",
    type: "External",
    vendorName: "DataPros",
    allocationPercent: 100,
    estimatedRate: 105,
    currentYearForecast: 184800,
    country: "UAE",
    resourceCount: 1,
    status: "RM Approved",
    approvalHistory: [
      {
        approver: "Sarah Mitchell",
        role: "Resource Manager",
        decision: "Approved",
        comment: "Availability confirmed. Skill set matches requirement.",
        decidedOn: "05/29/2027 15:41:09",
      },
    ],
    mailSubject:
      "Resource Review Required: Data Engineer – Supply Chain Analytics",
    mailBody:
      "Hi Manager,\n\nA resource request has been submitted for PMO review.\n\nProject: Supply Chain Analytics\nRole: Data Engineer\nResource: Fatima Al-Rashid (External – DataPros)\nAllocation: 100%\nPeriod: Jun 2027 – May 2028\n\nThank you,\nResource Management System",
  },
  {
    id: "rev-009",
    demandId: "dem-33",
    requestedBy: "Grace Oduya",
    requestedOn: "05/27/2027 12:11:45",
    project: "Cybersecurity Uplift",
    resourceName: "Dmitri Volkov",
    projectRole: "Security Analyst",
    portfolio: "Banking",
    pillar: "Banking",
    startDate: "2027-06-15",
    endDate: "2027-12-31",
    type: "Internal",
    vendorName: "",
    allocationPercent: 75,
    estimatedRate: 120,
    currentYearForecast: 118800,
    country: "Russia",
    resourceCount: 1,
    status: "RM Approved",
    approvalHistory: [
      {
        approver: "Sarah Mitchell",
        role: "Resource Manager",
        decision: "Approved",
        comment: "Security clearance verified. Capacity available.",
        decidedOn: "05/28/2027 12:11:45",
      },
    ],
    mailSubject:
      "Resource Review Required: Security Analyst – Cybersecurity Uplift",
    mailBody:
      "Hi Manager,\n\nA resource request has been submitted for PMO review.\n\nProject: Cybersecurity Uplift\nRole: Security Analyst\nResource: Dmitri Volkov\nAllocation: 75%\nPeriod: Jun 2027 – Dec 2027\n\nThank you,\nResource Management System",
  },

  // ── Pending RM Review (Pending / Awaiting Approval) ──────────────────────
  {
    id: "rev-010",
    demandId: "dem-36",
    requestedBy: "Tariq Hassan",
    requestedOn: "05/30/2027 14:22:33",
    project: "AI & ML Platform",
    resourceName: "Sophie Blanchard",
    projectRole: "ML Engineer",
    portfolio: "Life Sciences",
    pillar: "Life Sciences",
    startDate: "2027-07-01",
    endDate: "2028-06-30",
    type: "External",
    vendorName: "NeuroSoft",
    allocationPercent: 100,
    estimatedRate: 135,
    currentYearForecast: 237600,
    country: "France",
    resourceCount: 1,
    status: "Pending",
    approvalHistory: [],
    mailSubject: "Resource Review Required: ML Engineer – AI & ML Platform",
    mailBody:
      "Hi Manager,\n\nA resource request has been submitted for your review.\n\nProject: AI & ML Platform\nRole: ML Engineer\nResource: Sophie Blanchard (External – NeuroSoft)\nAllocation: 100%\nPeriod: Jul 2027 – Jun 2028\nEstimated Rate: $135/hr\n\nPlease review and take action.\n\nThank you,\nResource Management System",
  },
  {
    id: "rev-011",
    demandId: "dem-38",
    requestedBy: "Jamison Ducey",
    requestedOn: "05/31/2027 14:22:33",
    project: "Data Modernization - ASPAC",
    resourceName: "Kristie Shirkavand",
    projectRole: "Project Manager",
    portfolio: "Life Sciences",
    pillar: "Life Sciences",
    startDate: "2027-07-01",
    endDate: "2028-03-31",
    type: "Internal",
    vendorName: "",
    allocationPercent: 100,
    estimatedRate: 120,
    currentYearForecast: 249600,
    country: "Sydney",
    resourceCount: 1,
    status: "Awaiting Approval",
    approvalHistory: [],
    mailSubject:
      "Resource Review Required: Project Manager – Data Modernization ASPAC",
    mailBody:
      "Hi Manager,\n\nA resource request has been submitted for your review.\n\nProject: Data Modernization - ASPAC\nRole: Project Manager\nResource: Kristie Shirkavand\nAllocation: 100%\nPeriod: Jul 2027 – Mar 2028\n\nThank you,\nResource Management System",
  },

  // ── Rejected ─────────────────────────────────────────────────────────────
  {
    id: "rev-005",
    demandId: "dem-20",
    requestedBy: "Jamison Ducey",
requestedOn: "2027-05-09 11:27:45",
    project: "Data Modernization - ASPAC",
    resourceName: "Oliver Nguyen",
    projectRole: "Business Intelligence Dev",
    portfolio: "Life Sciences",
    pillar: "Life Sciences",
    startDate: "2027-04-01",
    endDate: "2028-03-31",
    type: "External",
    vendorName: "Insight Analytics",
    allocationPercent: 100,
    estimatedRate: 115,
    currentYearForecast: 202400,
    country: "Vietnam",
    resourceCount: 1,
    status: "RM Rejected",
    approvalHistory: [
      {
        approver: "Sarah Mitchell",
        role: "Resource Manager",
        decision: "Rejected",
        comment:
          "Budget constraints — please resubmit with reduced allocation for Q3.",
decidedOn: "2027-05-10 15:41:09",
      },
    ],
    mailSubject:
      "Resource Review Required: BI Developer – Data Modernization ASPAC",
    mailBody:
      "Hi Manager,\n\nA resource request has been submitted for your review.\n\nProject: Data Modernization - ASPAC\nRole: Business Intelligence Dev\nResource: Oliver Nguyen (External – Insight Analytics)\nAllocation: 100%\n\nThank you,\nResource Management System",
  },
];
