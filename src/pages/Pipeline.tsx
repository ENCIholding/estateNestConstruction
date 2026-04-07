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
} from "recharts";
import { TrendingUp, DollarSign } from "lucide-react";

type PipelineStage = {
  stage: string;
  count: number;
  value: number;
};

const mockData: PipelineStage[] = [
  { stage: "Lead", count: 15, value: 750000 },
  { stage: "Proposal", count: 8, value: 520000 },
  { stage: "Negotiation", count: 5, value: 450000 },
  { stage: "Won", count: 3, value: 380000 },
];

export default function Pipeline() {
  const [selectedStage, setSelectedStage] = useState("all");

  const stages = useMemo(() => {
    return mockData.map((d) => d.stage);
  }, []);

  const filteredData = useMemo(() => {
    if (selectedStage === "all") return mockData;
    return mockData.filter((d) => d.stage === selectedStage);
  }, [selectedStage]);

  const totalValue = filteredData.reduce((sum, d) => sum + d.value, 0);
  const totalCount = filteredData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Sales Pipeline</h1>
        <p className="text-slate-600">Track opportunities through sales stages</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Pipeline Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              ${totalValue.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {totalCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <label className="text-sm font-medium mb-2 block">Filter by Stage</label>
        <select
          value={selectedStage}
          onChange={(e) => setSelectedStage(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-md text-sm"
        >
          <option value="all">All Stages</option>
          {stages.map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </select>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Pipeline by Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(value: number) => `$${value.toLocaleString()}`}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="count" fill="#3b82f6" name="Count" />
              <Bar
                yAxisId="right"
                dataKey="value"
                fill="#10b981"
                name="Value"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stage Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockData.map((stage) => (
              <div
                key={stage.stage}
                className="flex items-center justify-between p-4 bg-slate-50 rounded"
              >
                <div>
                  <p className="font-semibold">{stage.stage}</p>
                  <p className="text-sm text-slate-600">
                    {stage.count} opportunities
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">
                    ${stage.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-600">
                    Avg: ${Math.round(stage.value / stage.count).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
