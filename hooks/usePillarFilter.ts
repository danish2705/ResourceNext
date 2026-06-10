import { useAuth } from "@/auth/useAuth";
import { useStore } from "@/store/useStore";

export function usePillarFilter() {
  const { user } = useAuth();

  const userPillar = user?.pillar ?? null;

  // For all pages with a pillar field
  function filterByPillar<T extends { pillar: string }>(items: T[]): T[] {
    if (!userPillar) return items; // null = super_admin, sees all
    return items.filter((item) => item.pillar === userPillar);
  }

  // Only for Resources page — derived from demands
  function filterResourcesByPillar<R extends { name: string }>(
    resources: R[],
    demands: { pillar: string; resourceName: string }[],
  ): R[] {
    if (!userPillar) return resources;
    const pillarResourceNames = new Set(
      demands.filter((d) => d.pillar === userPillar).map((d) => d.resourceName),
    );
    return resources.filter((r) => pillarResourceNames.has(r.name));
  }

  return { userPillar, filterByPillar, filterResourcesByPillar };
}
