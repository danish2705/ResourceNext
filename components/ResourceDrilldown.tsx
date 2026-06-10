import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useStore } from '@/store/useStore';
import { CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  resourceName: string | null;
  onClose: () => void;
}

// Mock Jira allocations keyed by resource name (deterministic, project names — not Jira keys)
const jiraMockByResource: Record<string, { issueType: string; projectName: string; startDate: string; endDate: string; hours: number }[]> = {
  default: [
    { issueType: 'Story',  projectName: 'Cloud Enablement',         startDate: '2027-01-15', endDate: '2027-02-28', hours: 80 },
    { issueType: 'Defect', projectName: 'Application Support',      startDate: '2027-02-01', endDate: '2027-02-15', hours: 24 },
    { issueType: 'Story',  projectName: 'QE Automation',            startDate: '2027-02-20', endDate: '2027-03-31', hours: 60 },
  ],
};

export default function ResourceDrilldown({ resourceName, onClose }: Props) {
  const { allocations, resources } = useStore();
  const [validated, setValidated] = useState<null | { ok: boolean; total: number }>(null);

  const projectAllocations = useMemo(
    () => allocations.filter((a) => a.resourceName === resourceName),
    [allocations, resourceName],
  );

  const profile = resources.find((r) => r.name === resourceName);
  const totalAllocPct = projectAllocations.reduce((s, a) => s + (a.allocationPercent || 0), 0);
  const availability = Math.max(0, 100 - totalAllocPct);

  const jiraRows = jiraMockByResource[resourceName || ''] || jiraMockByResource.default;
  const jiraHours = jiraRows.reduce((s, j) => s + j.hours, 0);
  // Convert hours → approx % over a quarter (520 work hours) for over-allocation check
  const jiraPctEquivalent = Math.round((jiraHours / 520) * 100);
  const combinedPct = totalAllocPct + jiraPctEquivalent;

  const validate = () => {
    const ok = combinedPct <= 100;
    setValidated({ ok, total: combinedPct });
    if (ok) toast.success(`Allocation Validated — ${combinedPct}% utilized`);
    else toast.error(`Over-allocation detected — ${combinedPct}% (cap 100%)`);
  };

  // Gauge: a simple SVG semi-circle
  const Gauge = ({ value }: { value: number }) => {
    const clamped = Math.max(0, Math.min(100, value));
    const angle = (clamped / 100) * 180;
    const r = 60;
    const cx = 80, cy = 80;
    const rad = (a: number) => (a - 180) * (Math.PI / 180);
    const x = cx + r * Math.cos(rad(angle));
    const y = cy + r * Math.sin(rad(angle));
    const largeArc = angle > 180 ? 1 : 0;
    const colorClass = clamped > 85 ? 'stroke-destructive' : clamped > 60 ? 'stroke-warning' : 'stroke-success';
    return (
      <svg width="160" height="100" viewBox="0 0 160 100">
        <path d={`M 20 80 A 60 60 0 0 1 140 80`} className="stroke-muted" strokeWidth="12" fill="none" />
        <path d={`M 20 80 A 60 60 0 ${largeArc} 1 ${x} ${y}`} className={colorClass} strokeWidth="12" fill="none" strokeLinecap="round" />
        <text x="80" y="75" textAnchor="middle" className="fill-foreground font-bold text-xl">{clamped}%</text>
        <text x="80" y="92" textAnchor="middle" className="fill-muted-foreground text-[10px]">Availability</text>
      </svg>
    );
  };

  return (
    <Dialog open={!!resourceName} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{resourceName}</span>
            {profile && <Badge variant="outline">{profile.level}</Badge>}
            {profile && <Badge variant="secondary">{profile.primarySkill}</Badge>}
          </DialogTitle>
        </DialogHeader>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xs text-muted-foreground">Total Allocation</div>
              <div className="text-2xl font-bold text-primary">{totalAllocPct}%</div>
              <div className="text-xs text-muted-foreground mt-1">{projectAllocations.length} project(s)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xs text-muted-foreground">Availability</div>
              <div className="text-2xl font-bold text-success">{availability}%</div>
              <div className="text-xs text-muted-foreground mt-1">Capacity remaining</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 flex justify-center">
              <Gauge value={availability} />
            </CardContent>
          </Card>
        </div>

        {/* Project Allocation Table */}
        <div>
          <div className="text-sm font-semibold mb-2">Project Allocations</div>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Allocation %</TableHead>
                  <TableHead>Hours / wk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectAllocations.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground text-sm">No project allocations</TableCell></TableRow>
                ) : projectAllocations.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.project}</TableCell>
                    <TableCell>{a.startDate}</TableCell>
                    <TableCell>{a.endDate}</TableCell>
                    <TableCell>{a.allocationPercent}%</TableCell>
                    <TableCell>{Math.round((a.allocationPercent / 100) * 40)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Jira Validation */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-info" /> Jira Allocations (Integration Preview)
            </div>
            <Button size="sm" onClick={validate}>
              <CheckCircle2 className="h-4 w-4 mr-1" /> Validate Allocation
            </Button>
          </div>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Issue Type</TableHead>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jiraRows.map((j, i) => (
                  <TableRow key={i}>
                    <TableCell><Badge variant="outline">{j.issueType}</Badge></TableCell>
                    <TableCell className="font-medium">{j.projectName}</TableCell>
                    <TableCell>{j.startDate}</TableCell>
                    <TableCell>{j.endDate}</TableCell>
                    <TableCell>{j.hours}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {validated && (
            <div className={`mt-3 p-3 rounded-md flex items-center gap-2 text-sm border ${validated.ok ? 'bg-success/10 border-success/30 text-success' : 'bg-destructive/10 border-destructive/30 text-destructive'}`}>
              {validated.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              <span>
                Combined utilization: <strong>{validated.total}%</strong> (Allocations {totalAllocPct}% + Jira ~{jiraPctEquivalent}%) —{' '}
                {validated.ok ? 'within capacity.' : 'exceeds 100% capacity. Reduce allocation before assigning new work.'}
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
