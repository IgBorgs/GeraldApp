import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, ChevronDown, Link as LinkIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PrepItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  priority: "A" | "B" | "C";
  recipeLink?: string;
  completed: boolean;
  estimatedTime: number; // in minutes
}

interface PrepListDisplayProps {
  prepItems?: PrepItem[];
  onMarkComplete?: (id: string, completed: boolean) => void;
}

const PrepListDisplay = ({
  prepItems = [
    {
      id: "1",
      name: "Marinara Sauce",
      quantity: 4,
      unit: "qt",
      priority: "A",
      recipeLink: "#",
      completed: false,
      estimatedTime: 45,
    },
    {
      id: "2",
      name: "Diced Onions",
      quantity: 2,
      unit: "qt",
      priority: "A",
      recipeLink: "#",
      completed: false,
      estimatedTime: 20,
    },
    {
      id: "3",
      name: "Chicken Stock",
      quantity: 8,
      unit: "qt",
      priority: "A",
      recipeLink: "#",
      completed: false,
      estimatedTime: 120,
    },
    {
      id: "4",
      name: "Sliced Mushrooms",
      quantity: 1,
      unit: "qt",
      priority: "B",
      recipeLink: "#",
      completed: false,
      estimatedTime: 15,
    },
    {
      id: "5",
      name: "Chopped Herbs",
      quantity: 0.5,
      unit: "qt",
      priority: "B",
      recipeLink: "#",
      completed: false,
      estimatedTime: 10,
    },
    {
      id: "6",
      name: "Roasted Garlic",
      quantity: 1,
      unit: "cup",
      priority: "C",
      recipeLink: "#",
      completed: false,
      estimatedTime: 30,
    },
    {
      id: "7",
      name: "Lemon Vinaigrette",
      quantity: 1,
      unit: "qt",
      priority: "C",
      recipeLink: "#",
      completed: false,
      estimatedTime: 15,
    },
  ],
  onMarkComplete = () => {},
}: PrepListDisplayProps) => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("priority");

  // Filter items based on active tab and search query
  const filteredItems = prepItems.filter((item) => {
    // Filter by tab
    if (activeTab !== "all" && item.priority !== activeTab) {
      return false;
    }

    // Filter by search query
    if (
      searchQuery &&
      !item.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  // Sort items based on selected sort option
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === "priority") {
      return a.priority.localeCompare(b.priority);
    } else if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortBy === "time") {
      return a.estimatedTime - b.estimatedTime;
    }
    return 0;
  });

  // Calculate stats
  const totalItems = prepItems.length;
  const completedItems = prepItems.filter((item) => item.completed).length;
  const priorityACount = prepItems.filter(
    (item) => item.priority === "A",
  ).length;

  const handleMarkComplete = (id: string, completed: boolean) => {
    onMarkComplete(id, completed);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "A":
        return "bg-red-100 text-red-800 border-red-200";
      case "B":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "C":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "";
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Prep List</h2>
          <p className="text-gray-500 mt-1">
            {completedItems} of {totalItems} items completed • {priorityACount}{" "}
            high priority items
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
              <DropdownMenuItem onClick={() => setSortBy("priority")}>
                Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("name")}>
                Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("time")}>
                Prep Time
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="A">Priority A</TabsTrigger>
          <TabsTrigger value="B">Priority B</TabsTrigger>
          <TabsTrigger value="C">Priority C</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {activeTab === "all"
                  ? "All Prep Items"
                  : `Priority ${activeTab} Items`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sortedItems.length > 0 ? (
                <div className="space-y-4">
                  {sortedItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 border rounded-md ${item.completed ? "bg-gray-50" : "bg-white"}`}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={`item-${item.id}`}
                          checked={item.completed}
                          onCheckedChange={(checked) =>
                            handleMarkComplete(item.id, checked as boolean)
                          }
                        />
                        <div className="flex flex-col">
                          <label
                            htmlFor={`item-${item.id}`}
                            className={`font-medium ${item.completed ? "line-through text-gray-500" : "text-gray-900"}`}
                          >
                            {item.name}
                          </label>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>
                              {item.quantity} {item.unit}
                            </span>
                            <span>•</span>
                            <span>{item.estimatedTime} min</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge className={`${getPriorityColor(item.priority)}`}>
                          Priority {item.priority}
                        </Badge>
                        {item.recipeLink && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1"
                            asChild
                          >
                            <a
                              href={item.recipeLink}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <LinkIcon className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
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
  );
};

export default PrepListDisplay;
