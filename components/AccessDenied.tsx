"use client";
import { useRouter } from "next/navigation";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AccessDenied() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-24">
      <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
        <ShieldX className="h-8 w-8 text-destructive" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
        <p className="text-sm text-muted-foreground mt-1">
          You don't have permission to view this page.
        </p>
      </div>
      <Button variant="outline" onClick={() => router.push("/")}>
        Go to Dashboard
      </Button>
    </div>
  );
}
