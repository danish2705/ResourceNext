import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  LineChart,
  Line,
} from "recharts";

import {
  Briefcase,
  Clock3,
  AlertTriangle,
  TrendingUp,
  Users,
  DollarSign,
} from "lucide-react";

import KpiCard from "./KpiCard";
import ChartCard from "./ChartCard";
import InsightCard from "./InsightCard";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const COLORS = {
  blue: "hsl(var(--kpi-blue))",
  green: "hsl(var(--kpi-green))",
  orange: "hsl(var(--kpi-orange))",
  purple: "hsl(var(--kpi-purple))",
  red: "hsl(var(--destructive))",
};

const demandStatusData = [
  { name: "Approved", value: 42, color: COLORS.green },
  { name: "Pending", value: 28, color: COLORS.orange },
  { name: "Draft", value: 18, color: COLORS.blue },
  { name: "Rejected", value: 12, color: COLORS.red },
];

const monthlyTrend = [
  { month: "Jan", demand: 42, fulfilled: 30 },
  { month: "Feb", demand: 48, fulfilled: 36 },
  { month: "Mar", demand: 60, fulfilled: 44 },
  { month: "Apr", demand: 72, fulfilled: 55 },
  { month: "May", demand: 84, fulfilled: 68 },
  { month: "Jun", demand: 95, fulfilled: 74 },
];

const pillarDistribution = [
  { pillar: "Banking", value: 28 },
  { pillar: "Healthcare", value: 18 },
  { pillar: "Retail", value: 22 },
  { pillar: "Hi-Tech", value: 25 },
  { pillar: "Life Sciences", value: 15 },
];

const forecastData = [
  { month: "Jan", forecast: 180, actual: 160 },
  { month: "Feb", forecast: 220, actual: 200 },
  { month: "Mar", forecast: 260, actual: 245 },
  { month: "Apr", forecast: 320, actual: 300 },
  { month: "May", forecast: 360, actual: 335 },
  { month: "Jun", forecast: 420, actual: 390 },
];

const staffingHeatmap = [
  {
    skill: "Cloud",
    fulfillment: 92,
  },
  {
    skill: "Data Engineering",
    fulfillment: 78,
  },
  {
    skill: "DevOps",
    fulfillment: 64,
  },
  {
    skill: "QA Automation",
    fulfillment: 83,
  },
  {
    skill: "AI/ML",
    fulfillment: 58,
  },
];

export default function DemandAnalytics() {
  return (
    <div className="space-y-6">

      {/* KPI SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">

        <KpiCard
          title="Total Demands"
          value="248"
          change="+12%"
          icon={Briefcase}
        />

        <KpiCard
          title="Pending Approval"
          value="28"
          change="+4%"
          icon={Clock3}
          iconColor={COLORS.orange}
          iconBg="hsl(var(--kpi-orange-bg))"
        />

        <KpiCard
          title="Critical Gaps"
          value="12"
          change="-2%"
          icon={AlertTriangle}
          iconColor={COLORS.red}
          iconBg="#fee2e2"
        />

        <KpiCard
          title="Fulfillment Rate"
          value="78%"
          change="+6%"
          icon={Users}
          iconColor={COLORS.green}
          iconBg="hsl(var(--kpi-green-bg))"
        />

        <KpiCard
          title="Forecasted Demand"
          value="420"
          change="+18%"
          icon={TrendingUp}
          iconColor={COLORS.purple}
          iconBg="hsl(var(--kpi-purple-bg))"
        />

        <KpiCard
          title="Projected Spend"
          value="$4.2M"
          change="+9%"
          icon={DollarSign}
          iconColor={COLORS.blue}
          iconBg="hsl(var(--kpi-blue-bg))"
        />
      </div>

      {/* ROW 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* STATUS DISTRIBUTION */}
        <ChartCard title="Demand Status Distribution">

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>

              <Pie
                data={demandStatusData}
                dataKey="value"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={2}
              >
                {demandStatusData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>

              <Tooltip />

            </PieChart>
          </ResponsiveContainer>

        </ChartCard>

        {/* MONTHLY TREND */}
        <ChartCard
          title="Demand vs Fulfillment Trend"
          height="h-[320px]"
        >

          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrend}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="month" />

              <YAxis />

              <Tooltip />

              <Legend />

              <Line
                type="monotone"
                dataKey="demand"
                stroke={COLORS.blue}
                strokeWidth={3}
              />

              <Line
                type="monotone"
                dataKey="fulfilled"
                stroke={COLORS.green}
                strokeWidth={3}
              />

            </LineChart>
          </ResponsiveContainer>

        </ChartCard>

        {/* INSIGHTS */}
        <InsightCard title="Executive Insights">

          <div className="space-y-4">

            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-sm">
                  AI/ML skill shortage
                </p>

                <p className="text-xs text-muted-foreground mt-1">
                  Demand increased 22% this month
                </p>
              </div>

              <Badge variant="destructive">
                High
              </Badge>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-sm">
                  Banking demand surge
                </p>

                <p className="text-xs text-muted-foreground mt-1">
                  14 new requests in pipeline
                </p>
              </div>

              <Badge className="bg-orange-500 hover:bg-orange-500">
                Medium
              </Badge>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-sm">
                  Vendor dependency reduced
                </p>

                <p className="text-xs text-muted-foreground mt-1">
                  Internal staffing improved 9%
                </p>
              </div>

              <Badge className="bg-green-600 hover:bg-green-600">
                Good
              </Badge>
            </div>

          </div>

        </InsightCard>
      </div>

      {/* ROW 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* PILLAR DISTRIBUTION */}
        <ChartCard title="Demand by Domain / Pillar">

          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pillarDistribution}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="pillar" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="value"
                fill={COLORS.purple}
                radius={[4, 4, 0, 0]}
              />

            </BarChart>
          </ResponsiveContainer>

        </ChartCard>

        {/* FORECAST */}
        <ChartCard title="Forecast vs Actual Allocation">

          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecastData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="month" />

              <YAxis />

              <Tooltip />

              <Legend />

              <Line
                type="monotone"
                dataKey="forecast"
                stroke={COLORS.orange}
                strokeWidth={3}
              />

              <Line
                type="monotone"
                dataKey="actual"
                stroke={COLORS.green}
                strokeWidth={3}
              />

            </LineChart>
          </ResponsiveContainer>

        </ChartCard>

        {/* STAFFING */}
        <InsightCard title="Staffing Fulfillment Heatmap">

          <div className="space-y-4">

            {staffingHeatmap.map((item) => (
              <div key={item.skill}>

                <div className="flex items-center justify-between mb-1">

                  <span className="text-sm">
                    {item.skill}
                  </span>

                  <span className="text-xs font-medium">
                    {item.fulfillment}%
                  </span>

                </div>

                <Progress
                  value={item.fulfillment}
                  className="h-3"
                />

              </div>
            ))}

          </div>

        </InsightCard>

      </div>
    </div>
  );
}