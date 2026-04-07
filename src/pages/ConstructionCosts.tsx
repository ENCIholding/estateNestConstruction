import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { DollarSign, TrendingUp } from "lucide-react";

type CostData = {
  category: string;
  estimated: number;
  actual: number;
  year?: number;
};

const mockData: CostData[] = [
  { category: "Foundation", estimated: 50000, actual: 48000, year: 2024 },
  { category: "Framing", estimated: 120000, actual: 125000, year: 2024 },
  { category: "Electrical", estimated: 80000, actual: 82000, year: 2024 },
  { category: "Plumbing", estimated: 70000, actual: 69000, year: 2024 },
  { category: "HVAC", estimated: 90000, actual: 95000, year: 2024 },
];

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

export default function ConstructionCosts() {
  const [selectedYear, setSelectedYear] = useState("all");

  const years = useMemo(() => {
    const uniqueYears = [...new Set(mockData.map((d) => d.year))].sort(
      (a, b) => (b || 0) - (a || 0)
    );
    return uniqueYears;
  }, []);

  const filteredData = useMemo(() => {
    if (selectedYear === "all") return mockData;
    return mockData.filter((d) => d.year === parseInt(selectedYear));
  }, [selectedYear]);

  const totalEstimated = filteredData.reduce(
    (sum, d) => sum + d.estimated,
    0
  );
  const totalActual = filteredData.reduce((sum, d) => sum + d.actual, 0);
  const variance = totalActual - totalEstimated;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Construction Costs</h1>
        <p className="text-slate-600">
          Track and compare estimated vs actual construction costs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Estimated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              ${totalEstimated.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              ${totalActual.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Variance</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${
                variance > 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              {variance > 0 ? "+" : ""}${variance.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <label className="text-sm font-medium mb-2 block">Filter by Year</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-md text-sm"
        >
          <option value="all">All Years</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Cost Comparison by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip
                formatter={(value) => `$${value.toLocaleString()}`}
              />
              <Legend />
              <Bar dataKey="estimated" fill="#3b82f6" name="Estimated" />
              <Bar dataKey="actual" fill="#10b981" name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cost Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={filteredData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, actual }) =>
                  `${category}: $${actual.toLocaleString()}`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="actual"
              >
                {filteredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `$${value.toLocaleString()}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
