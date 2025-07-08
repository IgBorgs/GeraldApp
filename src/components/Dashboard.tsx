import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, Clipboard, AlertCircle } from "lucide-react"; 
import Settings from "./Settings";
import InventoryForm from "./InventoryForm";
import PrepListDisplay from "./PrepListDisplay";
import PARManagement from "./PARManagement";
import { supabase } from "@/lib/supabaseClient";

interface DashboardProps {
  userName?: string;
}

const Dashboard = ({ userName = "Chef" }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  const [summaryData, setSummaryData] = useState({
    totalItemsNeeded: 0,
    priorityA: 0,
    priorityB: 0,
    priorityC: 0,
    lastUpdated: "",
  });

  const fetchPrepListSummary = async () => {
    console.log("🔍 Fetching prep list summary...");
  
    const { data, error } = await supabase.from("prep_list").select("*");
  
    if (error) {
      console.error("❌ Failed to fetch prep list:", error.message);
      return;
    }
  
    console.log("📦 Supabase data sample:", data.slice(0, 3));
    data.forEach((item, index) => {
      console.log(`🧪 Row ${index + 1}:`, {
        priority: item.priority,
        completed: item.completed,
      });
    });
  
    // ⚠️ Only include incomplete items
    const incompleteItems = data.filter((item) => item.completed === false);
  
    const summary = {
      totalItemsNeeded: incompleteItems.length,
      priorityA: incompleteItems.filter((item) => item.priority === "A").length,
      priorityB: incompleteItems.filter((item) => item.priority === "B").length,
      priorityC: incompleteItems.filter((item) => item.priority === "C").length,
      lastUpdated: new Date().toLocaleString(),
    };
  
    console.log("✅ Summary computed:", summary);
    setSummaryData(summary);
  };
  

  useEffect(() => {
    fetchPrepListSummary();
  }, []);

  return (
    <div className="w-full h-full min-h-screen bg-background p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 md:w-20 md:h-20">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Gerald&accessories=mustache&clothesColor=gray&clothesType=overall&eyes=happy&eyebrows=default&facialHair=mediumBeard&facialHairColor=auburn&hairColor=auburn&mouth=smile&skinColor=light&top=hat"
              alt="Gerald the Mouse Chef"
              className="w-full h-full"
            />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Prep List Generator</h1>
            <p className="text-muted-foreground">Welcome back, {userName}!</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Settings />
          <Button size="sm">
            <ChefHat className="h-4 w-4 mr-2" />
            Start Prep
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="preplist">Prep Lists</TabsTrigger>
          <TabsTrigger value="parlevels">PAR Levels</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Items Needed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {summaryData.totalItemsNeeded}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Priority A</CardTitle>
                <CardDescription>Urgent items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500">
                  {summaryData.priorityA}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Priority B</CardTitle>
                <CardDescription>Important items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-500">
                  {summaryData.priorityB}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Priority C</CardTitle>
                <CardDescription>Standard items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">
                  {summaryData.priorityC}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  onClick={() => setActiveTab("inventory")}
                  className="h-24 flex flex-col items-center justify-center gap-2"
                >
                  <Clipboard className="h-6 w-6" />
                  Input Today's Inventory
                </Button>
                <Button
                  onClick={() => setActiveTab("preplist")}
                  className="h-24 flex flex-col items-center justify-center gap-2"
                  variant="secondary"
                >
                  <ChefHat className="h-6 w-6" />
                  View Prep Lists
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">Live data from Supabase</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Last updated: {summaryData.lastUpdated}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={fetchPrepListSummary}
                >
                  Refresh Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Inventory */}
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Current Inventory</CardTitle>
              <CardDescription>Enter your current stock levels</CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryForm />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prep Lists */}
        <TabsContent value="preplist">
          <Card>
            <CardHeader>
              <CardTitle>Prep Lists</CardTitle>
              <CardDescription>Items that need to be prepared</CardDescription>
            </CardHeader>
            <CardContent>
              <PrepListDisplay />
            </CardContent>
          </Card>
        </TabsContent>

        {/* PAR Levels */}
        <TabsContent value="parlevels">
          <Card>
            <CardHeader>
              <CardTitle>PAR Level Management</CardTitle>
              <CardDescription>Set target inventory levels</CardDescription>
            </CardHeader>
            <CardContent>
              <PARManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;

