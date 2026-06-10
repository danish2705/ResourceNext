import { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  title: string;
  children: ReactNode;
  height?: string;
}

export default function ChartCard({
  title,
  children,
  height = "h-[320px]",
}: Props) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <div className={height}>{children}</div>
      </CardContent>
    </Card>
  );
}