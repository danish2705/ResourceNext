"use client";
import { usePathname, useRouter } from "next/navigation";

import {
  LogOut,
  User as UserIcon,
  ListChecks,
  RefreshCw,
  Moon,
  Sun,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { SidebarProvider } from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/AppSidebar";

import { useAuth } from "@/auth/useAuth";

import { ROLE_LABELS } from "@/auth/rbac";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Badge } from "@/components/ui/badge";

import { toast } from "sonner";

import { useState, useEffect } from "react";

const resolvePageTitle = (pathname: string) => {
  if (pathname === "/" || pathname === "/dashboard") return "Dashboard";
  if (pathname.startsWith("/my-dashboard")) return "Dashboard";
  if (pathname.startsWith("/resource-information"))
    return "Resource Information";
  if (
    pathname.startsWith("/demand-summary") ||
    pathname.startsWith("/resource-review")
  )
    return "Demand & Allocation";
  if (pathname.startsWith("/demand-status")) return "Demand Status";
  if (pathname.startsWith("/projects") || pathname.startsWith("/task-review"))
    return "Projects";
  if (
    pathname.startsWith("/project-portfolio") ||
    pathname.startsWith("/scenario-planning")
  )
    return "Portfolio Planning";
  if (pathname.startsWith("/reporting-dashboard"))
    return "Reporting & Analytics";
  if (pathname.startsWith("/resource-allocation")) return "Allocation Details";
  if (pathname.startsWith("/user-management")) return "User Management";
  if (
    pathname.startsWith("/master-data") ||
    pathname.startsWith("/configuration")
  )
    return "Admin";
  if (pathname.startsWith("/audit-log")) return "Audit Log";
  if (pathname.startsWith("/training")) return "Training";
  if (pathname.startsWith("/profile")) return "My Profile";
  if (pathname.startsWith("/my-allocations")) return "My Allocations";
  return "Enterprise Resource Management";
};

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const title = resolvePageTitle(pathname);

  const { user, logout } = useAuth();

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleRefresh = () => {
    setLastUpdated(new Date());
    window.location.reload();
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.replace("/login");
  };

  const formatLastUpdated = (date: Date) => {
    return date.toLocaleString("en-AU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const displayName = user ? ROLE_LABELS[user.role] : "";

  const avatarText = user ? user.username.charAt(0).toUpperCase() : "??";

  return (
    <div
      className="
        flex
        h-screen
        w-full
        overflow-hidden
        bg-background
      "
    >
      {/* SIDEBAR */}

      <AppSidebar />

      {/* MAIN AREA */}

      <div
        className="
          flex
          flex-1
          min-w-0
          flex-col
          overflow-hidden
          transition-all
          duration-200
          ease-out
        "
      >
        {/* TOP HEADER */}

        <header
          className="
            flex
            h-14
            shrink-0
            items-center
            justify-between
            border-b
            bg-card
            px-4
            shadow-sm
          "
        >
          {/* PAGE TITLE */}

          <div
            className="
              flex
              items-center
              min-w-0
            "
          >
            <h1
              className="
                truncate
                text-base
                font-semibold
                text-foreground
              "
            >
              {title}
            </h1>
          </div>

          {/* RIGHT ACTIONS */}

          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            {/* REFRESH */}

            <button
              onClick={handleRefresh}
              className="
                flex items-center gap-2
                h-10 px-4
                rounded-lg
                border border-border
                bg-background
                hover:bg-muted
                transition-colors
              "
              aria-label="Refresh"
            >
              <RefreshCw className="h-4 w-4 text-muted-foreground" />

              <div className="flex flex-col items-start leading-tight">
                <span className="text-[10px] text-muted-foreground">
                  Last Synced
                </span>
                <span className="text-xs font-medium text-foreground">
                  {formatLastUpdated(lastUpdated)}
                </span>
              </div>
            </button>

            {/* USER MENU */}

            <DropdownMenu>
              <DropdownMenuTrigger
                className="
                  rounded-full
                  transition-all
                  duration-150
                  ease-out
                  focus:outline-none
                  focus:ring-2
                  focus:ring-ring
                "
              >
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarFallback
                    className="
                      bg-primary
                      text-xs
                      text-primary-foreground
                    "
                  >
                    {avatarText}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="flex flex-col gap-1 py-2">
                  <span className="font-semibold">{displayName}</span>

                  <span
                    className="
                      text-xs
                      font-normal
                      text-muted-foreground
                    "
                  >
                    @{user?.username}
                  </span>

                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {displayName}
                    </Badge>

                    <Badge variant="outline" className="text-xs">
                      Portfolio: {user?.portfolio}
                    </Badge>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {/* THEME */}

                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    setDarkMode((prev) => !prev);
                  }}
                  className="cursor-pointer"
                >
                  {darkMode ? (
                    <Sun className="mr-2 h-4 w-4" />
                  ) : (
                    <Moon className="mr-2 h-4 w-4" />
                  )}

                  {darkMode ? "Light Mode" : "Dark Mode"}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* PROFILE */}

                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  My Profile
                </DropdownMenuItem>

                {/* ALLOCATIONS */}

                <DropdownMenuItem
                  onClick={() => router.push("/my-allocations")}
                >
                  <ListChecks className="mr-2 h-4 w-4" />
                  My Allocations
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* LOGOUT */}

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="
                    cursor-pointer
                    font-medium
                    text-red-500
                    hover:bg-red-500/10
                    hover:text-red-500
                    focus:bg-red-500/10
                    focus:text-red-500
                  "
                >
                  <LogOut className="mr-2 h-4 w-4 text-red-500" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* PAGE CONTENT */}

        <main
          className="
            flex-1
            overflow-x-hidden
            overflow-y-auto
            p-6
            transition-all
            duration-200
            ease-out
          "
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}
