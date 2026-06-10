import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { HistoryEntry } from '@/store/useStore';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: HistoryEntry[];
}

export default function HistoryModal({ open, onOpenChange, history }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>History</DialogTitle>
        </DialogHeader>
        {history.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4">No history available.</p>
        ) : (
          <div className="border rounded-md overflow-auto max-h-80">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field Name</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Updated On</TableHead>
                  <TableHead>Updated By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((h, i) => (
                  <TableRow key={i}>
                    <TableCell>{h.fieldName}</TableCell>
                    <TableCell>{h.from}</TableCell>
                    <TableCell>{h.to}</TableCell>
                    <TableCell>{h.updatedOn}</TableCell>
                    <TableCell>{h.updatedBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
