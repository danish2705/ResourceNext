import { useState } from "react";
import { useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  ClipboardList,
  UserCircle,
  BarChart3,
  ChevronDown,
  ListChecks,
  PlusCircle,
  TrendingUp,
  ShieldCheck,
  ScrollText,
  Lock,
  PanelLeft,
  UserCog,
  DollarSign,
  FolderKanban,
  Database,
  ShieldAlert,
  Settings,
  GraduationCap,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { NavLink } from "@/components/NavLink";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useAuth } from "@/auth/useAuth";
import { hasPermission, type Permission } from "@/auth/rbac";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  end?: boolean;
  permission?: Permission;
  excludeRoles?: string[];
}

const dashboardSubItems: NavItem[] = [
  {
    title: "Default Dashboard",
    url: "/",
    icon: LayoutDashboard,
    end: true,
    permission: "view_dashboard",
  },
  {
    title: "My Dashboards",
    url: "/my-dashboard",
    icon: LayoutDashboard,
    end: true,
    permission: "view_dashboard",
  },
];

const mainItems: NavItem[] = [
  {
    title: "Resource Information",
    url: "/resources",
    icon: UserCircle,
    permission: "view_resource_info",
  },
];

const demandSubItems: NavItem[] = [
  {
    title: "Demand Summary & Allocation",
    url: "/demand",
    icon: ListChecks,
    end: true,
    permission: "view_dashboard",
  },
  {
    title: "Allocation Status",
    url: "/demand-status",
    icon: TrendingUp,
    permission: "view_dashboard",
  },
  {
    title: "Allocation Review & Approval",
    url: "/resource-review",
    icon: ShieldCheck,
    permission: "approve_demand",
  },
];

const allocationItems: NavItem[] = [
  {
    title: "Allocation Details",
    url: "/allocation",
    icon: Users,
    permission: "view_allocation",
  },
];

const projectSubItems: NavItem[] = [
  {
    title: "Projects & Assign Task",
    url: "/projects",
    icon: ClipboardList,
    permission: "view_projects",
  },
  {
    title: "Task Review & Approval",
    url: "/task-review-approval",
    icon: ShieldCheck,
    permission: "approve_demand",
  },
];

const portfolioSubItems: NavItem[] = [
  {
    title: "Project Portfolio",
    url: "/project-portfolio",
    icon: DollarSign,
    permission: "view_reporting",
    excludeRoles: ["resource"],
  },
  {
    title: "Scenario Planning",
    url: "/scenario-planning",
    icon: TrendingUp,
    permission: "view_reporting",
    excludeRoles: ["resource"],
  },
];

const adminSubItems: NavItem[] = [
  {
    title: "User Management",
    url: "/user-management",
    icon: UserCog,
    permission: "manage_users",
  },
  {
    title: "Master Data Management",
    url: "/admin/master-data",
    icon: Database,
    permission: "manage_master_data",
  },
  {
    title: "Configuration",
    url: "/admin/configuration",
    icon: Settings,
    permission: "manage_master_data",
  },
];

const lowerItems: NavItem[] = [
  {
    title: "Reporting & Analytics",
    url: "/reports",
    icon: BarChart3,
    permission: "view_reporting",
  },
  {
    title: "Audit Log",
    url: "/audit-log",
    icon: ScrollText,
    permission: "view_audit_logs",
  },
  {
    title: "Training",
    url: "/training",
    icon: GraduationCap,
    permission: "view_dashboard",
  },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();

  const collapsed = state === "collapsed";

  const location = useLocation();

  const { user } = useAuth();

  const can = (permission?: Permission, excludeRoles?: string[]) => {
    if (!permission) return true;

    if (!user) return false;

    if (excludeRoles && excludeRoles.includes(user.role)) return false;

    return hasPermission(user.role, permission);
  };

  const canSeeDemand = can("view_demand");

  const demandActive =
    location.pathname.startsWith("/demand") ||
    location.pathname.startsWith("/demand-status");

  const [demandOpen, setDemandOpen] = useState(demandActive);

  const projectActive =
    location.pathname.startsWith("/projects") ||
    location.pathname.startsWith("/task-review-approval");

  const [projectOpen, setProjectOpen] = useState(projectActive);

  const portfolioActive =
    location.pathname.startsWith("/project-portfolio") ||
    location.pathname.startsWith("/scenario-planning");

  const [portfolioOpen, setPortfolioOpen] = useState(portfolioActive);

  const dashboardActive =
    location.pathname === "/" || location.pathname.startsWith("/my-dashboard");

  const [dashboardOpen, setDashboardOpen] = useState(dashboardActive);

  const adminActive =
    location.pathname.startsWith("/user-management") ||
    location.pathname.startsWith("/admin/");

  const [adminOpen, setAdminOpen] = useState(adminActive);

  const linkBase =
    "flex items-center gap-2 w-full transition-colors rounded-md";

  const linkInactive =
    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

  const linkActive =
    "bg-sidebar-accent text-sidebar-accent-foreground font-medium";

  const linkDisabled =
    "opacity-60 cursor-not-allowed pointer-events-none select-none";

  const renderNavItem = (item: NavItem) => {
    const allowed = can(item.permission, item.excludeRoles);

    if (allowed) {
      return (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild tooltip={item.title}>
            <NavLink
              to={item.url}
              end={item.end}
              className={`${linkBase} ${linkInactive}`}
              activeClassName={linkActive}
            >
              <item.icon className="h-4 w-4 shrink-0" />

              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuItem key={item.title}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`${linkBase} ${linkDisabled} px-2 py-1.5 text-sm text-sidebar-foreground/60`}
            >
              <item.icon className="h-4 w-4 shrink-0" />

              {!collapsed && (
                <>
                  <span className="flex-1">{item.title}</span>

                  <Lock className="h-3 w-3 ml-auto opacity-60" />
                </>
              )}
            </div>
          </TooltipTrigger>

          <TooltipContent side="right" className="text-xs">
            You don't have access to {item.title}
          </TooltipContent>
        </Tooltip>
      </SidebarMenuItem>
    );
  };

  const renderSubItem = (sub: NavItem) => {
    const allowed = can(sub.permission);

    if (allowed) {
      return (
        <SidebarMenuSubItem key={sub.title}>
          <SidebarMenuSubButton asChild>
            <NavLink
              to={sub.url}
              end={sub.end}
              className={`${linkBase} ${linkInactive}`}
              activeClassName={linkActive}
            >
              <sub.icon className="h-3.5 w-3.5 shrink-0" />

              <span>{sub.title}</span>
            </NavLink>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
      );
    }

    return (
      <SidebarMenuSubItem key={sub.title}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`${linkBase} ${linkDisabled} px-2 py-1 text-xs text-sidebar-foreground/60`}
            >
              <sub.icon className="h-3.5 w-3.5 shrink-0" />

              <span className="flex-1">{sub.title}</span>

              <Lock className="h-3 w-3 ml-auto opacity-60" />
            </div>
          </TooltipTrigger>

          <TooltipContent side="right" className="text-xs">
            You don't have access to {sub.title}
          </TooltipContent>
        </Tooltip>
      </SidebarMenuSubItem>
    );
  };

  const renderProjectSubItem = (sub: NavItem) => {
    const allowed = can(sub.permission);

    if (allowed) {
      return (
        <SidebarMenuSubItem key={sub.title}>
          <SidebarMenuSubButton asChild>
            <NavLink
              to={sub.url}
              end={sub.end}
              className={`${linkBase} ${linkInactive}`}
              activeClassName={linkActive}
            >
              <sub.icon className="h-3.5 w-3.5 shrink-0" />
              <span>{sub.title}</span>
            </NavLink>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
      );
    }

    return (
      <SidebarMenuSubItem key={sub.title}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`${linkBase} ${linkDisabled} px-2 py-1 text-xs text-sidebar-foreground/60`}
            >
              <sub.icon className="h-3.5 w-3.5 shrink-0" />

              <span className="flex-1">{sub.title}</span>

              <Lock className="h-3 w-3 ml-auto opacity-60" />
            </div>
          </TooltipTrigger>

          <TooltipContent side="right" className="text-xs">
            You don't have access to {sub.title}
          </TooltipContent>
        </Tooltip>
      </SidebarMenuSubItem>
    );
  };

  return (
    <Sidebar
      collapsible="icon"
      className="
        transition-all
        duration-200
        ease-out
        border-r
      "
    >
      {/* HEADER */}

      <SidebarHeader className="h-14 border-b border-sidebar-border px-2">
        <div className="flex items-center justify-between h-full">
          {/* SIDEBAR TOGGLE */}

          <button
            onClick={toggleSidebar}
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-md
              transition-all
              duration-200
              hover:bg-sidebar-accent
              hover:text-sidebar-accent-foreground
            "
            aria-label="Toggle Sidebar"
          >
            <PanelLeft className="h-5 w-5" />
          </button>

          {/* TITLE */}

          {!collapsed && (
            <div
              className="
                flex
                flex-1
                items-center
                pl-2
                overflow-hidden
              "
            >
              <span className="truncate text-sm font-semibold text-sidebar-foreground">
                Enterprise Resource Management
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* CONTENT */}

      <SidebarContent
        className="
          transition-all
          duration-200
          ease-out
        "
      >
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Dashboard */}

              {can("view_dashboard") ? (
                <Collapsible
                  open={collapsed ? false : dashboardOpen}
                  onOpenChange={setDashboardOpen}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip="Dashboard"
                        className={dashboardActive ? linkActive : linkInactive}
                      >
                        <LayoutDashboard className="h-4 w-4 shrink-0" />

                        {!collapsed && (
                          <>
                            <span>Dashboard</span>

                            <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                          </>
                        )}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    {!collapsed && (
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {dashboardSubItems.map(renderSubItem)}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    )}
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`${linkBase} ${linkDisabled} px-2 py-1.5 text-sm text-sidebar-foreground/60`}
                      >
                        <LayoutDashboard className="h-4 w-4 shrink-0" />

                        {!collapsed && (
                          <>
                            <span className="flex-1">Dashboard</span>

                            <Lock className="h-3 w-3 ml-auto opacity-60" />
                          </>
                        )}
                      </div>
                    </TooltipTrigger>

                    <TooltipContent side="right" className="text-xs">
                      You don't have access to Dashboard
                    </TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              )}

              {/* Main Items */}
              {mainItems.map(renderNavItem)}

              {/* Demand Management */}

              {canSeeDemand ? (
                <Collapsible
                  open={collapsed ? false : demandOpen}
                  onOpenChange={setDemandOpen}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip="Demand Management"
                        className={demandActive ? linkActive : linkInactive}
                      >
                        <ClipboardList className="h-4 w-4 shrink-0" />

                        {!collapsed && (
                          <>
                            <span>Demand & Allocation</span>

                            <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                          </>
                        )}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    {!collapsed && (
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {demandSubItems.map(renderSubItem)}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    )}
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`${linkBase} ${linkDisabled} px-2 py-1.5 text-sm text-sidebar-foreground/60`}
                      >
                        <ClipboardList className="h-4 w-4 shrink-0" />

                        {!collapsed && (
                          <>
                            <span className="flex-1">Demand Management</span>

                            <Lock className="h-3 w-3 ml-auto opacity-60" />
                          </>
                        )}
                      </div>
                    </TooltipTrigger>

                    <TooltipContent side="right" className="text-xs">
                      You don't have access to Demand Management
                    </TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              )}

              {/* Allocation Details */}

              {allocationItems.map(renderNavItem)}

              {/* Projects */}

              {can("view_projects") ? (
                <Collapsible
                  open={collapsed ? false : projectOpen}
                  onOpenChange={setProjectOpen}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip="Projects"
                        className={projectActive ? linkActive : linkInactive}
                      >
                        <ClipboardList className="h-4 w-4 shrink-0" />

                        {!collapsed && (
                          <>
                            <span>Projects</span>

                            <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                          </>
                        )}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    {!collapsed && (
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {projectSubItems.map(renderProjectSubItem)}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    )}
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`${linkBase} ${linkDisabled} px-2 py-1.5 text-sm text-sidebar-foreground/60`}
                      >
                        <ClipboardList className="h-4 w-4 shrink-0" />

                        {!collapsed && (
                          <>
                            <span className="flex-1">Projects</span>

                            <Lock className="h-3 w-3 ml-auto opacity-60" />
                          </>
                        )}
                      </div>
                    </TooltipTrigger>

                    <TooltipContent side="right" className="text-xs">
                      You don't have access to Projects
                    </TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              )}

              {/* Portfolio Planning */}

              {can("view_reporting") ? (
                <Collapsible
                  open={collapsed ? false : portfolioOpen}
                  onOpenChange={setPortfolioOpen}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip="Portfolio Planning"
                        className={portfolioActive ? linkActive : linkInactive}
                      >
                        <FolderKanban className="h-4 w-4 shrink-0" />

                        {!collapsed && (
                          <>
                            <span>Portfolio Planning</span>

                            <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                          </>
                        )}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    {!collapsed && (
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {portfolioSubItems.map(renderProjectSubItem)}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    )}
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`${linkBase} ${linkDisabled} px-2 py-1.5 text-sm text-sidebar-foreground/60`}
                      >
                        <FolderKanban className="h-4 w-4 shrink-0" />

                        {!collapsed && (
                          <>
                            <span className="flex-1">Portfolio Planning</span>

                            <Lock className="h-3 w-3 ml-auto opacity-60" />
                          </>
                        )}
                      </div>
                    </TooltipTrigger>

                    <TooltipContent side="right" className="text-xs">
                      You don't have access to Portfolio Planning
                    </TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              )}

              {lowerItems.map(renderNavItem)}

              {/* Admin */}
              {can("manage_users") ? (
                <Collapsible
                  open={collapsed ? false : adminOpen}
                  onOpenChange={setAdminOpen}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip="Admin"
                        className={adminActive ? linkActive : linkInactive}
                      >
                        <ShieldAlert className="h-4 w-4 shrink-0" />

                        {!collapsed && (
                          <>
                            <span>Admin</span>

                            <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                          </>
                        )}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    {!collapsed && (
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {adminSubItems.map(renderSubItem)}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    )}
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`${linkBase} ${linkDisabled} px-2 py-1.5 text-sm text-sidebar-foreground/60`}
                      >
                        <ShieldAlert className="h-4 w-4 shrink-0" />

                        {!collapsed && (
                          <>
                            <span className="flex-1">Admin</span>

                            <Lock className="h-3 w-3 ml-auto opacity-60" />
                          </>
                        )}
                      </div>
                    </TooltipTrigger>

                    <TooltipContent side="right" className="text-xs">
                      You don't have access to Admin
                    </TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
