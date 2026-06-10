import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function ForecastActual() {
  const [demandFactor, setDemandFactor] = useState(1);
  const [capacityFactor, setCapacityFactor] = useState(1);

  const [selectedVendor, setSelectedVendor] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');

  const [timeView, setTimeView] = useState<'weekly' | 'monthly'>('weekly');

  const capacityPerResource = 40 * capacityFactor;

  const vendors = ['UX Reactor', 'Moodys NWC', 'Ascendion Global', 'Hyqoo', 'Collabera'];
  const countries = ['India', 'USA', 'Germany'];

  const timeLabels =
    timeView === 'weekly'
      ? ['W1', 'W2', 'W3', 'W4']
      : ['Jan', 'Feb', 'Mar', 'Apr'];

  // 🔥 DATA (with work split internally)
  const data = timeLabels.map((label, i) => {
    const base = 20 + (i % 20) + (5 + (i % 10));

    const forecast = Math.round(base * demandFactor);

    let projectActual = forecast * 0.7;
    let operationalActual = forecast * 0.3;

    if (i === 1) projectActual += 10;
    if (i === 2) operationalActual -= 8;

    const actual = Math.round(projectActual + operationalActual);

    return {
      name: label,
      forecast,
      actual,
      projectActual: Math.round(projectActual),
      operationalActual: Math.round(operationalActual),
      vendor: vendors[i % vendors.length],
      country: countries[i % countries.length],
    };
  });

  const filteredData = data.filter((r) => {
    return (
      (selectedVendor === 'All' || r.vendor === selectedVendor) &&
      (selectedCountry === 'All' || r.country === selectedCountry)
    );
  });

  const totalCapacity = filteredData.length * capacityPerResource;
  const totalForecast = filteredData.reduce((s, r) => s + r.forecast, 0);
  const totalActual = filteredData.reduce((s, r) => s + r.actual, 0);

  const totalProjectActual = filteredData.reduce((s, r) => s + r.projectActual, 0);
  const totalOperationalActual = filteredData.reduce((s, r) => s + r.operationalActual, 0);

  const variance = totalActual - totalForecast;
  const variancePercent =
    totalForecast === 0 ? 0 : Math.round((variance / totalForecast) * 100);

  const overrun = filteredData.filter(
    (r) => r.forecast > capacityPerResource
  ).length;

  const underutilized = filteredData.filter(
    (r) => r.forecast < capacityPerResource * 0.5
  ).length;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h2 className="text-xl font-semibold">Forecast vs Actual Analysis</h2>
        <p className="text-sm text-muted-foreground">
          Scenario-based capacity and variance analysis
        </p>
      </div>

      {/* TIME TOGGLE */}
      <div className="flex gap-2">
        <button
          onClick={() => setTimeView('weekly')}
          className={`px-3 py-1 rounded text-sm ${
            timeView === 'weekly' ? 'bg-primary text-white' : 'bg-muted'
          }`}
        >
          Weekly
        </button>

        <button
          onClick={() => setTimeView('monthly')}
          className={`px-3 py-1 rounded text-sm ${
            timeView === 'monthly' ? 'bg-primary text-white' : 'bg-muted'
          }`}
        >
          Monthly
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex gap-6">
        <div>
          <p className="text-xs font-medium">Vendor</p>
          <select
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option>All</option>
            {vendors.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-xs font-medium">Country</p>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option>All</option>
            {countries.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* SCENARIO */}
      <div className="grid grid-cols-2 gap-6 bg-muted/30 p-4 rounded-lg">
        <div>
          <p className="text-sm font-medium mb-1">Demand Multiplier</p>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={demandFactor}
            onChange={(e) => setDemandFactor(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-1">{demandFactor}x</p>
        </div>

        <div>
          <p className="text-sm font-medium mb-1">Capacity Multiplier</p>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={capacityFactor}
            onChange={(e) => setCapacityFactor(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-1">{capacityFactor}x</p>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-4">

        <Card><CardHeader><CardTitle>Total Capacity</CardTitle></CardHeader><CardContent>{Math.round(totalCapacity)} hrs</CardContent></Card>
        <Card><CardHeader><CardTitle>Total Forecast</CardTitle></CardHeader><CardContent>{totalForecast} hrs</CardContent></Card>
        <Card><CardHeader><CardTitle>Total Actual</CardTitle></CardHeader><CardContent>{totalActual} hrs</CardContent></Card>

        <Card><CardHeader><CardTitle>Variance</CardTitle></CardHeader><CardContent>{variance} hrs ({variancePercent}%)</CardContent></Card>
        <Card><CardHeader><CardTitle>Overloaded</CardTitle></CardHeader><CardContent>{overrun}</CardContent></Card>
        <Card><CardHeader><CardTitle>Underutilized</CardTitle></CardHeader><CardContent>{underutilized}</CardContent></Card>

      </div>

      {/* 🔥 FINAL CLEAN CHART */}
      <Card>
        <CardHeader>
          <CardTitle>Forecast vs Actual Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="forecast" fill="#6366F1" name="Forecast" />
                <Bar dataKey="actual" fill="#10B981" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}