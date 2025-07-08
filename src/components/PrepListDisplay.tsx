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
import { getAutoPriority, getPriorityColor } from "@/lib/priority";

interface PrepItem {
  id: string;
  item_id: string;
  name: string;
  // quantity: number; // não vamos mais mostrar quantity
  unit: string;
  priority: "A" | "B" | "C";
  completed: boolean;
  estimatedTime: number;
  recipeQty?: string | number;
}

const PrepListDisplay = () => {
  const [prepItems, setPrepItems] = useState<PrepItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("priority");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchPrepList = async () => {
      const { data: items, error: itemsError } = await supabase.from("items").select("*");
      const { data: stock, error: stockError } = await supabase.from("stock").select("*");

      if (itemsError || stockError) {
        console.error("❌ Error fetching items/stock:", itemsError?.message || stockError?.message);
        return;
      }

      const generatedPrepItems = items
        .map((item) => {
          const stockItem = stock.find((s) => s.item_id === item.id);
          const currentStock = stockItem?.quantity ?? 0;
          const neededQty = Math.max(0, item.par_level - currentStock);

          const priority = getAutoPriority({
            currentQty: currentStock,
            parLevel: item.par_level,
            menu_relevance: item.menu_relevance,
            estimated_time: item.estimated_time,
            needsFryer: item.needs_fryer,
            name: item.name,
            isLunchItem: item.is_lunch_item,
          });

          return {
            id: item.id,
            item_id: item.id,
            name: item.name,
            // quantity: neededQty,
            unit: item.unit,
            priority,
            completed: false,
            estimatedTime: item.estimated_time || 15,
            recipeQty: item.default_recipe_qty, // <-- só mostra recipes!
          };
        })
        .filter((item) => {
          // Só mostra se tiver que produzir algo e tiver receita definida
          // Se quiser mostrar todos os que precisa fazer, mesmo sem recipeQty, só filtre por neededQty > 0 (ajuste conforme preferir)
          return item.recipeQty && item.recipeQty.toString().trim() !== "";
        });

      setPrepItems(generatedPrepItems);
    };

    fetchPrepList();
  }, []);

  const generateDailyReport = () => {
    const todayItems = prepItems;
    const totalItems = todayItems.length;
    const completedItems = todayItems.filter(item => item.completed).length;
    const totalTime = todayItems.reduce((sum, item) => sum + item.estimatedTime, 0);
    return { totalItems, completedItems, totalTime, items: todayItems };
  };

  const handleMarkComplete = async (id: string, completed: boolean) => {
    setPrepItems((prev) => prev.map((item) => item.id === id ? { ...item, completed } : item));
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
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            {item.recipeQty
                              ? <span className="font-bold text-primary">{item.recipeQty} {typeof item.recipeQty === "string" && item.recipeQty.toUpperCase().includes('R') ? '' : 'R'}</span>
                              : <span className="text-gray-400 italic">Qtd. não definida</span>
                            }
                            <span>• {item.estimatedTime} min</span>
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
