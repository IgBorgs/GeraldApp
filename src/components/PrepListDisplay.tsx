import React, { useState } from "react";
import { usePrepList } from "@/components/PrepListContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Filter, ChevronDown, Clipboard } from "lucide-react";
import { getPriorityColor } from "@/lib/priority";
import PrepListPDF from "./PrepListPDF";
import { pdf } from "@react-pdf/renderer";
import { PrepItem } from "@/components/PrepListContext";
import BackToHomeButton from "./BackToHomeButton";
import { useLocation } from "react-router-dom";

const PrepListDisplay = () => {
  const {
    prepList: prepItems,
    isLoading,
    error,
    markItemCompleted,
    prepStartTime,
    prepEndTime,
    saveCompletedPrepItems,
  } = usePrepList();

  const location = useLocation();
  const isFullPage = location.pathname === "/prep";

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("priority");
  const [activeTab, setActiveTab] = useState("all");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success">("idle");

  if (isLoading) return <div className="p-6 text-gray-500">Loading prep list...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  const generateDailyReport = () => {
    const totalItems = prepItems.length;
    const completedItems = prepItems.filter((item) => item.completed).length;
    const totalTime = prepItems.reduce((sum, item) => sum + item.estimated_time, 0);
    return { totalItems, completedItems, totalTime, items: prepItems };
  };

  const filteredItems = prepItems.filter((item) => {
    if (activeTab !== "all" && item.priority !== activeTab) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === "priority") return a.priority.localeCompare(b.priority);
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "time") return a.estimated_time - b.estimated_time;
    return 0;
  });

  const report = generateDailyReport();

  const handleExportPDF = async () => {
    const today = new Date().toISOString().split("T")[0];
    const blob = await pdf(
      <PrepListPDF
        items={sortedItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          priority: item.priority,
          completed: item.completed,
          estimatedTime: item.estimated_time,
        }))}
        prepStartTime={prepStartTime}
        prepEndTime={prepEndTime}
      />
    ).toBlob();

    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `PrepList-${today}.pdf`;
    link.click();
  };

  const renderQuantityDisplay = (item: PrepItem) => {
    const recipes = item.quantity;
    const yieldPerRecipe = item.recipe_yield || 1;
    const totalQty = recipes * yieldPerRecipe;

    return (
      <span className="font-bold text-primary">
        {recipes}R ({totalQty} {item.unit})
      </span>
    );
  };

  return (
    <div className="bg-background p-6 rounded-lg shadow-sm w-full">
      <BackToHomeButton />
      <div className={isFullPage ? "pt-16" : ""}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Prep List</h2>
            <p className="text-gray-500 mt-1">
              {report.completedItems} of {report.totalItems} items completed •{" "}
              {prepItems.filter((i) => i.priority === "A").length} high priority
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search items..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Sort by
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy("priority")}>Priority</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("name")}>Name</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("time")}>Prep Time</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mb-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="w-full flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-base">Daily Summary</CardTitle>
                  <div className="text-sm text-gray-600">
                    <div>Total Items: {report.totalItems}</div>
                    <div>Completed Items: {report.completedItems}</div>
                    <div>
                      Estimated Total Time: {report.totalTime} min (
                      {Math.floor(report.totalTime / 60)}h {report.totalTime % 60}min)
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Button
                    onClick={async () => {
                      setSaveStatus("saving");
                      try {
                        await saveCompletedPrepItems();
                        setSaveStatus("success");
                        setTimeout(() => setSaveStatus("idle"), 4000);
                      } catch (err) {
                        console.error("Error saving completed prep items:", err);
                        setSaveStatus("idle");
                      }
                    }}
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    {saveStatus === "saving"
                      ? "Saving..."
                      : saveStatus === "success"
                      ? "Saved Successfully!"
                      : "Save Completed Prep Items"}
                  </Button>

                  <Button
                    onClick={handleExportPDF}
                    variant="outline"
                    className="flex items-center gap-2"
                    title="Export as PDF"
                  >
                    <Clipboard className="h-4 w-4" />
                    Export as PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="A">Priority A</TabsTrigger>
            <TabsTrigger value="B">Priority B</TabsTrigger>
            <TabsTrigger value="C">Priority C</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab}>
            <Card>
              <CardHeader className="pb-2 flex justify-between">
                <CardTitle className="text-lg">Prep Items</CardTitle>
              </CardHeader>
              <CardContent>
                {sortedItems.length > 0 ? (
                  <div className="space-y-4">
                    {sortedItems.map((item) => (
                      <div
                        key={item.id}
                        className={`flex justify-between p-3 border rounded-md ${
                          item.completed ? "bg-muted" : "bg-card"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id={`item-${item.id}`}
                            checked={item.completed}
                            onCheckedChange={(checked) =>
                              markItemCompleted(item.id!, checked as boolean)
                            }
                          />
                          <div>
                            <label
                              htmlFor={`item-${item.id}`}
                              className={`font-medium ${
                                item.completed
                                  ? "line-through text-gray-500"
                                  : "text-gray-900"
                              }`}
                            >
                              {item.name}
                            </label>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                              {renderQuantityDisplay(item)}
                              <span>• {item.estimated_time} min</span>
                            </div>
                          </div>
                        </div>
                        <Badge className={getPriorityColor(item.priority as "A" | "B" | "C")}>
                          Priority {item.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No prep items found matching your criteria.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PrepListDisplay;




