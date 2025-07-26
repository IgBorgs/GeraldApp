import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { supabase } from "@/lib/supabaseClient";
import { usePrepList } from "./PrepListContext";

const COLORS = ["#ef4444", "#f59e0b", "#10b981"];

const Charts = () => {
  const { prepList } = usePrepList();
  const [todayItems, setTodayItems] = useState<any[]>([]);

  useEffect(() => {
    fetchPrepListData();
  }, [prepList]);

  const fetchPrepListData = async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("prep_list")
      .select("*")
      .eq("date", today);
    if (error || !data) {
      console.error("❌ Failed to fetch prep list", error);
      return;
    }
    setTodayItems(data);
  };

  const pieData = [
    { name: "Priority A", value: todayItems.filter((i) => i.priority === "A").length },
    { name: "Priority B", value: todayItems.filter((i) => i.priority === "B").length },
    { name: "Priority C", value: todayItems.filter((i) => i.priority === "C").length },
  ];

  const barData = [
    {
      name: "Today",
      Completed: todayItems.filter((i) => i.completed).length,
      Incomplete: todayItems.filter((i) => !i.completed).length,
    },
  ];

  const lineData = [
    { day: "Monday", total: 22, completed: 18, avgTime: 4.2 },
    { day: "Tuesday", total: 19, completed: 16, avgTime: 3.8 },
    { day: "Wednesday", total: 25, completed: 22, avgTime: 4.5 },
    { day: "Thursday", total: 21, completed: 19, avgTime: 4.1 },
    { day: "Friday", total: 24, completed: 21, avgTime: 4.3 },
    { day: "Saturday", total: 18, completed: 15, avgTime: 3.5 },
    { day: "Sunday", total: 20, completed: 17, avgTime: 3.9 },
  ];

  return (
    <div className="w-full bg-gerald-light p-4 md:p-6 lg:p-8">
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Prep Items by Priority</CardTitle>
              <CardDescription>
                Distribution of today's prep list by priority level
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Prep Completion</CardTitle>
              <CardDescription>
                Completed vs incomplete items for today
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Completed" fill="#10b981" />
                  <Bar dataKey="Incomplete" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Prep Item Trends</CardTitle>
            <CardDescription>
              Historical prep data over the past week (sample data)
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="total" stroke="#F28C28" fill="#F28C28" />
                <Line yAxisId="left" type="monotone" dataKey="completed" stroke="#10b981" />
                <Line yAxisId="right" type="monotone" dataKey="avgTime" stroke="#8B5A2B" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Charts;


