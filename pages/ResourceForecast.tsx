import { useState } from 'react';
import { useStore, type Forecast } from '@/store/useStore';
import { useActiveValues } from '@/store/useMasterData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DataTable, { type Column } from '@/components/DataTable';
import { Plus, ArrowRightCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const statusVariant = (s: Forecast['status']) =>
  s === 'Approved' ? 'default' : s === 'Flagged' ? 'destructive' : s === 'Converted' ? 'secondary' : 'outline';

export default function ResourceForecast() {
  const { forecasts, addForecast, deleteForecast, convertForecastToDemand, updateForecast } = useStore();
  const portfolios = useActiveValues('portfolios');
  const programs = useActiveValues('programs');
  const projects = useActiveValues('projects');
  const roles = useActiveValues('roles');
  const pillars = useActiveValues('pillars');

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    portfolio: '', program: '', projectName: '', requiredRole: '',
    headcount: 1, startDate: '2027-04-01', endDate: '2028-03-31', estimatedCost: 100000, pillar: '',
  });

  const reset = () => setForm({ portfolio: '', program: '', projectName: '', requiredRole: '', headcount: 1, startDate: '2027-04-01', endDate: '2028-03-31', estimatedCost: 100000, pillar: '' });

  const submit = () => {
    if (!form.portfolio || !form.projectName || !form.requiredRole) {
      toast.error('Portfolio, Project and Role are required');
      return;
    }
    addForecast(form);
    toast.success('Forecast Created');
    setOpen(false);
    reset();
  };

  const columns: Column<Forecast>[] = [
    { key: 'portfolio', header: 'Portfolio' },
    { key: 'program', header: 'Program' },
    { key: 'projectName', header: 'Project' },
    { key: 'requiredRole', header: 'Required Role' },
    { key: 'headcount', header: 'HC' },
    { key: 'startDate', header: 'Start' },
    { key: 'endDate', header: 'End' },
    { key: 'estimatedCost', header: 'Est. Cost', render: (r) => `$${r.estimatedCost.toLocaleString()}` },
    { key: 'status', header: 'Status', render: (r) => <Badge variant={statusVariant(r.status)}>{r.status}</Badge> },
    {
      key: 'actions', header: 'Actions', sortable: false,
      render: (r) => (
        <div className="flex gap-1">
          {r.status !== 'Converted' && (
            <>
              {r.status !== 'Approved' && (
                <Button size="sm" variant="outline" className="h-7" onClick={() => { updateForecast(r.id, { status: 'Approved' }); toast.success('Forecast Approved'); }}>
                  Approve
                </Button>
              )}
              <Button size="sm" className="h-7" onClick={() => { convertForecastToDemand(r.id); toast.success('Converted to Demand'); }}>
                <ArrowRightCircle className="h-3.5 w-3.5 mr-1" />Convert
              </Button>
            </>
          )}
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => { deleteForecast(r.id); toast.success('Forecast Deleted'); }}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Resource Forecast</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Plan future demand &middot; Forecast → Approve → Convert to Demand → Allocation</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />New Forecast</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Create Resource Forecast</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3 py-2">
                <div>
                  <Label>Portfolio *</Label>
                  <Select value={form.portfolio} onValueChange={(v) => setForm({ ...form, portfolio: v })}>
                    <SelectTrigger><SelectValue placeholder="Select portfolio" /></SelectTrigger>
                    <SelectContent>{portfolios.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Program</Label>
                  <Select value={form.program} onValueChange={(v) => setForm({ ...form, program: v })}>
                    <SelectTrigger><SelectValue placeholder="Select program" /></SelectTrigger>
                    <SelectContent>{programs.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Project *</Label>
                  <Select value={form.projectName} onValueChange={(v) => setForm({ ...form, projectName: v })}>
                    <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                    <SelectContent>{projects.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Required Role *</Label>
                  <Select value={form.requiredRole} onValueChange={(v) => setForm({ ...form, requiredRole: v })}>
                    <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent>{roles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Pillar</Label>
                  <Select value={form.pillar} onValueChange={(v) => setForm({ ...form, pillar: v })}>
                    <SelectTrigger><SelectValue placeholder="Select pillar" /></SelectTrigger>
                    <SelectContent>{pillars.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Headcount</Label>
                  <Input type="number" min={1} value={form.headcount} onChange={(e) => setForm({ ...form, headcount: parseInt(e.target.value) || 1 })} />
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <Label>Estimated Cost ($)</Label>
                  <Input type="number" value={form.estimatedCost} onChange={(e) => setForm({ ...form, estimatedCost: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setOpen(false); reset(); }}>Cancel</Button>
                <Button onClick={submit}>Create Forecast</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <DataTable data={forecasts} columns={columns} pageSize={10} />
        </CardContent>
      </Card>
    </div>
  );
}
