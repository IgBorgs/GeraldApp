import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Filter, ChevronDown } from "lucide-react";

interface PrepItem {
  id: string;
  item_id: string;
  name: string;
  quantity: number;
  unit: string;
  priority: "A" | "B" | "C";
  completed: boolean;
  estimatedTime: number;
}

const PrepListDisplay = () => {
  const [prepItems, setPrepItems] = useState<PrepItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("priority");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchPrepList = async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("prep_list")
        .select("id, item_id, name, needed_quantity, unit, priority, completed")
        .eq("date", today);

      if (error) {
        console.error("❌ Failed to fetch prep list:", error.message);
        return;
      }

      if (data.length > 0) {
        const formatted = data.map((item) => ({
          id: item.id,
          item_id: item.item_id,
          name: item.name,
          quantity: item.needed_quantity,
          unit: item.unit,
          priority: item.priority,
          completed: item.completed,
          estimatedTime: 15,
        }));
        setPrepItems(formatted);
        return;
      }

      const { data: items } = await supabase.from("items").select("*, estimated_time, menu_relevance");
      const { data: stock } = await supabase.from("stock").select("*");

      const generatedPrepItems = items
        .map((item) => {
          const stockItem = stock.find((s) => s.item_id === item.id);
          const currentStock = stockItem?.quantity ?? 0;
          const neededQty = item.par_level - currentStock;

          let score = 0;
          if (item.estimated_time > 30) score += 2;
          if (currentStock < item.par_level * 0.2) score += 3;
          if (item.menu_relevance) score += 2;

          let dynamicPriority: "A" | "B" | "C" = "C";
          if (score >= 7) dynamicPriority = "A";
          else if (score >= 4) dynamicPriority = "B";

          return {
            id: item.id,
            item_id: item.id,
            name: item.name,
            quantity: neededQty > 0 ? neededQty : 0,
            unit: item.unit,
            priority: dynamicPriority,
            completed: false,
            estimatedTime: item.estimated_time || 15,
          };
        })
        .filter((item) => item.quantity > 0);

      setPrepItems(generatedPrepItems);
    };

    fetchPrepList();
  }, []);

  const generateDailyReport = () => {
    const today = new Date().toISOString().split("T")[0];
    const todayItems = prepItems;
    const totalItems = todayItems.length;
    const completedItems = todayItems.filter(item => item.completed).length;
    const totalTime = todayItems.reduce((sum, item) => sum + item.estimatedTime, 0);
    return { date: today, totalItems, completedItems, totalTime, items: todayItems };
  };

  const savePrepListToSupabase = async () => {
    const today = new Date().toISOString().split("T")[0];
    await supabase.from("prep_list").delete().eq("date", today);
    const { data: items } = await supabase.from("items").select("*");
    const { data: stock } = await supabase.from("stock").select("*");
    const rowsToInsert = items
      .map((item) => {
        const stockItem = stock.find((s) => s.item_id === item.id);
        const currentStock = stockItem?.quantity ?? 0;
        const neededQty = item.par_level - currentStock;
        return {
          item_id: item.id,
          name: item.name,
          unit: item.unit,
          priority: item.priority,
          needed_quantity: neededQty > 0 ? neededQty : 0,
          completed: false,
          date: today,
        };
      })
      .filter((item) => item.needed_quantity > 0);
    if (rowsToInsert.length === 0) return;
    const { data: inserted } = await supabase.from("prep_list").insert(rowsToInsert).select();
    const formatted = inserted.map((item) => ({
      id: item.id,
      item_id: item.item_id,
      name: item.name,
      quantity: item.needed_quantity,
      unit: item.unit,
      priority: item.priority,
      completed: item.completed,
      estimatedTime: 15,
    }));
    setPrepItems(formatted);
  };

  const handleMarkComplete = async (id: string, completed: boolean) => {
    setPrepItems((prev) => prev.map((item) => item.id === id ? { ...item, completed } : item));
    await supabase.from("prep_list").update({ completed }).eq("id", id);
    if (completed) {
      const prepItem = prepItems.find((item) => item.id === id);
      if (!prepItem) return;
      const { data: existingStock } = await supabase
        .from("stock")
        .select("id, quantity")
        .eq("item_id", prepItem.item_id)
        .single();
      const newQuantity = (existingStock?.quantity ?? 0) + prepItem.quantity;
      await supabase.from("stock").update({ quantity: newQuantity }).eq("id", existingStock.id);
    }
  };

  const filteredItems = prepItems.filter((item) => {
    if (activeTab !== "all" && item.priority !== activeTab) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === "priority") return a.priority.localeCompare(b.priority);
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "time") return a.estimatedTime - b.estimatedTime;
    return 0;
  });

  const report = generateDailyReport();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "A": return "bg-red-100 text-red-800 border-red-200";
      case "B": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "C": return "bg-green-100 text-green-800 border-green-200";
      default: return "";
    }
  };

  return (
    <div className="bg-background p-6 rounded-lg shadow-sm w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Prep List</h2>
          <p className="text-gray-500 mt-1">
            {report.completedItems} of {report.totalItems} items completed • {prepItems.filter(i => i.priority === "A").length} high priority
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
          <CardHeader>
            <CardTitle className="text-base">Daily Summary</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-2">
            <div>Total Items: {report.totalItems}</div>
            <div>Completed Items: {report.completedItems}</div>
            <div>Estimated Total Time: {report.totalTime} min</div>
          </CardContent>
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
              <Button size="sm" onClick={savePrepListToSupabase}>Save Prep List to Supabase</Button>
            </CardHeader>
            <CardContent>
              {sortedItems.length > 0 ? (
                <div className="space-y-4">
                  {sortedItems.map((item) => (
                    <div key={item.id} className={`flex justify-between p-3 border rounded-md ${item.completed ? "bg-muted" : "bg-card"}`}>
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={`item-${item.id}`}
                          checked={item.completed}
                          onCheckedChange={(checked) => handleMarkComplete(item.id, checked as boolean)}
                        />
                        <div>
                          <label htmlFor={`item-${item.id}`} className={`font-medium ${item.completed ? "line-through text-gray-500" : "text-gray-900"}`}>
                            {item.name}
                          </label>
                          <div className="text-sm text-gray-500">
                            {item.quantity} {item.unit} • {item.estimatedTime} min
                          </div>
                        </div>
                      </div>
                      <Badge className={getPriorityColor(item.priority)}>Priority {item.priority}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No prep items found matching your criteria.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PrepListDisplay;








