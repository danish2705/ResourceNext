// src/mocks/resources.ts

export interface Resource {
  id: string;

  resourceId: string;
  email: string;
  name: string;
  initials: string;

  role: string;
  level: "Junior" | "Mid" | "Senior";

  pillar: "Hi-tech" | "Retail" | "Banking" | "Healthcare" | "Life Sciences";

  team: string;

  reportingManager: string;

  employeeType: "Full Time" | "Contractor";

  availableAfter: string;

  skills: string[];

  ratePerHr: number;

  capacity: string;

  location: string;

  status: "Allocated" | "Available" | "Overallocated";

  systemRole: "PMO" | "Resource Manager" | "Resource";
  utilization: number;

  unavailability?: {
    state: "out-of-office" | "unavailable";
    from: string;
    to: string;
  };
}

export const resources: Resource[] = [
  {
    id: "res-0",

    resourceId: "RID-1001",

    name: "Rachel Morgan",
    initials: "RM",
    systemRole: "Resource Manager",
    role: "Cloud Architect",
    level: "Senior",
    email: "rachel.morgan@acmecorp.com",
    pillar: "Hi-tech",
    team: "Cloud Platform",

    reportingManager: "Emma Wilson",

    employeeType: "Full Time",

    availableAfter: "2026-06-04",

    skills: ["AWS", "Terraform", "Kubernetes"],

    ratePerHr: 95,

    capacity: "40 hrs",

    location: "Sydney",

    status: "Allocated",

    utilization: 80,
  },

  {
    id: "res-1",

    resourceId: "RID-1002",

    name: "Daniel Foster",
    initials: "DF",
    email: "daniel.foster@acmecorp.com",
    role: "Data Engineer",
    level: "Mid",
    systemRole: "Resource",

    pillar: "Banking",
    team: "Data Platform",

    reportingManager: "Anna Hughes",

    employeeType: "Contractor",

    availableAfter: "2027-05-06",

    skills: ["Python", "Spark", "SQL"],

    ratePerHr: 75,

    capacity: "40 hrs",

    location: "Melbourne",

    status: "Allocated",

    utilization: 100,
  },

  {
    id: "res-2",

    resourceId: "RID-1003",

    name: "Claire Simmons",
    initials: "CS",
    email: "claire.simmons@acmecorp.com",
    role: "DevSecOps Engineer",
    level: "Senior",
    systemRole: "Resource Manager",
    pillar: "Healthcare",
    team: "Security & Ops",

    reportingManager: "Daniel Carter",

    employeeType: "Full Time",

    availableAfter: "2027-12-08",

    skills: ["Docker", "CI/CD", "Security"],

    ratePerHr: 85,

    capacity: "40 hrs",

    location: "Brisbane",

    status: "Allocated",

    utilization: 80,
  },

  {
    id: "res-3",

    resourceId: "RID-1004",
    systemRole: "Resource",

    name: "Nathan Brooks",
    email: "nathan.brooks@acmecorp.com",
    initials: "NB",

    role: "Full Stack Developer",
    level: "Mid",

    pillar: "Retail",
    team: "Digital Commerce",

    reportingManager: "Rachel Morgan",

    employeeType: "Contractor",

    availableAfter: "2026-07-12",

    skills: ["React", "Node.js", "APIs"],

    ratePerHr: 70,

    capacity: "40 hrs",

    location: "Sydney",

    status: "Overallocated",

    utilization: 120,
  },

  {
    id: "res-4",

    resourceId: "RID-1005",
    email: "laura.mitchell@acmecorp.com",
    name: "Laura Mitchell",
    initials: "LM",
    systemRole: "PMO",

    role: "Delivery Manager",
    level: "Senior",

    pillar: "Life Sciences",
    team: "Program Delivery",

    reportingManager: "Executive Board",

    employeeType: "Full Time",

    availableAfter: "2026-07-01",

    skills: ["Agile", "PMO", "Stakeholder Mgmt"],

    ratePerHr: 90,

    capacity: "40 hrs",

    location: "Sydney",

    status: "Available",

    utilization: 60,
  },

  {
    id: "res-5",

    resourceId: "RID-1006",

    name: "Tyler Harrison",
    initials: "TH",
    email: "tyler.harrison@acmecorp.com",
    role: "Data Scientist",
    level: "Mid",

    pillar: "Healthcare",
    team: "Clinical Analytics",

    reportingManager: "Laura Mitchell",

    employeeType: "Full Time",

    availableAfter: "2026-07-10",

    skills: ["ML", "Python", "TensorFlow"],

    ratePerHr: 80,

    capacity: "40 hrs",

    location: "Melbourne",
    systemRole: "Resource",

    status: "Available",

    utilization: 80,

    unavailability: {
      state: "out-of-office",
      from: "2026-05-15",
      to: "2026-05-30",
    },
  },

  {
    id: "res-6",

    resourceId: "RID-1007",

    name: "Emily Clarke",
    initials: "EC",
    email: "emily.clarke@acmecorp.com",
    role: "Cloud Engineer",
    level: "Junior",
    systemRole: "Resource",
    pillar: "Hi-tech",
    team: "Cloud Platform",

    reportingManager: "Rachel Morgan",

    employeeType: "Full Time",

    availableAfter: "2026-06-10",

    skills: ["Azure", "ARM Templates", "Networking"],

    ratePerHr: 55,

    capacity: "40 hrs",

    location: "Perth",

    status: "Allocated",

    utilization: 100,
  },

  {
    id: "res-7",

    resourceId: "RID-1008",

    name: "Adam Fletcher",
    initials: "AF",
    email: "adam.fletcher@acmecorp.com",
    systemRole: "Resource",
    role: "Security Engineer",
    level: "Senior",

    pillar: "Banking",
    team: "Cyber Security",

    reportingManager: "Emma Wilson",

    employeeType: "Full Time",

    availableAfter: "2027-05-30",

    skills: ["Pen Testing", "SIEM", "IAM"],

    ratePerHr: 90,

    capacity: "40 hrs",

    location: "Sydney",

    status: "Allocated",

    utilization: 100,
  },

  {
    id: "res-8",

    resourceId: "RID-1009",

    name: "Jessica Palmer",
    email: "jessica.palmer@acmecorp.com",
    initials: "JP",
    systemRole: "Resource",
    role: "Cloud Engineer",
    level: "Mid",

    pillar: "Retail",
    team: "Infrastructure",

    reportingManager: "Rachel Morgan",

    employeeType: "Contractor",

    availableAfter: "2026-06-21",

    skills: ["AWS", "CloudFormation", "Lambda"],

    ratePerHr: 75,

    capacity: "40 hrs",

    location: "Sydney",

    status: "Allocated",

    utilization: 100,
  },

  {
    id: "res-9",

    resourceId: "RID-1010",

    name: "Owen Taylor",
    email: "owen.taylor@acmecorp.com",
    initials: "OT",
    systemRole: "Resource",
    role: "ML Engineer",
    level: "Mid",

    pillar: "Life Sciences",
    team: "Research & AI",

    reportingManager: "Tyler Harrison",

    employeeType: "Full Time",

    availableAfter: "2026-09-14",

    skills: ["ML", "Python", "Spark"],

    ratePerHr: 80,

    capacity: "40 hrs",

    location: "Melbourne",

    status: "Available",

    utilization: 80,

    unavailability: {
      state: "out-of-office",
      from: "2026-05-15",
      to: "2026-05-30",
    },
  },

  {
    id: "res-10",

    resourceId: "RID-1011",

    name: "Hannah Scott",
    initials: "HS",
    email: "hannah.scott@acmecorp.com",
    role: "Business Analyst",
    level: "Senior",
    systemRole: "PMO",
    pillar: "Banking",
    team: "Business Transformation",

    reportingManager: "Laura Mitchell",

    employeeType: "Full Time",

    availableAfter: "2026-06-01",

    skills: ["Business Analysis", "Agile", "Requirements"],

    ratePerHr: 85,

    capacity: "40 hrs",

    location: "Sydney",

    status: "Available",

    utilization: 55,
  },

  {
    id: "res-11",

    resourceId: "RID-1012",

    name: "George Lawson",
    email: "george.lawson@acmecorp.com",
    initials: "GL",
    systemRole: "Resource Manager",
    role: "Technical Lead",
    level: "Senior",

    pillar: "Hi-tech",
    team: "Engineering Excellence",

    reportingManager: "Rachel Morgan",

    employeeType: "Full Time",

    availableAfter: "2026-07-01",

    skills: ["Architecture", "Java", "Microservices"],

    ratePerHr: 110,

    capacity: "40 hrs",

    location: "Melbourne",

    status: "Allocated",

    utilization: 70,
  },

  {
    id: "res-12",

    resourceId: "RID-1013",
    email: "megan.turner@acmecorp.com",
    name: "Megan Turner",
    initials: "MT",

    role: "QA Engineer",
    level: "Mid",
    systemRole: "Resource",
    pillar: "Healthcare",
    team: "Quality Assurance",

    reportingManager: "Daniel Carter",

    employeeType: "Contractor",

    availableAfter: "2026-04-15",

    skills: ["Selenium", "Test Automation", "JIRA"],

    ratePerHr: 70,

    capacity: "40 hrs",

    location: "Brisbane",

    status: "Available",

    utilization: 40,
  },

  {
    id: "res-13",

    resourceId: "RID-1014",
    name: "Christopher Ward",
    email: "christopher.ward@acmecorp.com",
    initials: "CW",
    systemRole: "PMO",
    role: "Project Manager",
    level: "Senior",

    pillar: "Life Sciences",
    team: "Program Delivery",

    reportingManager: "Laura Mitchell",

    employeeType: "Full Time",

    availableAfter: "2026-05-28",

    skills: ["PMO", "Stakeholder Mgmt", "Risk Management"],

    ratePerHr: 95,

    capacity: "40 hrs",

    location: "Sydney",

    status: "Available",

    utilization: 50,
  },

  {
    id: "res-14",

    resourceId: "RID-1015",

    name: "Natalie Hughes",
    initials: "NH",
    systemRole: "Resource",
    role: "DevOps Engineer",
    level: "Mid",
    email: "natalie.hughes@acmecorp.com",
    pillar: "Retail",
    team: "Platform Engineering",

    reportingManager: "Claire Simmons",

    employeeType: "Full Time",

    availableAfter: "2026-06-10",

    skills: ["CI/CD", "Jenkins", "Kubernetes"],

    ratePerHr: 80,

    capacity: "40 hrs",

    location: "Perth",

    status: "Available",

    utilization: 60,
  },
];
