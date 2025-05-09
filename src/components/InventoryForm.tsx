import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Save, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  parLevel: number;
  unit: string;
}

const InventoryForm = ({ onSave = () => {} }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: "1",
      name: "Chicken Breast",
      category: "Protein",
      currentStock: 8,
      parLevel: 20,
      unit: "lbs",
    },
    {
      id: "2",
      name: "Romaine Lettuce",
      category: "Produce",
      currentStock: 5,
      parLevel: 10,
      unit: "heads",
    },
    {
      id: "3",
      name: "Tomatoes",
      category: "Produce",
      currentStock: 12,
      parLevel: 15,
      unit: "lbs",
    },
    {
      id: "4",
      name: "Heavy Cream",
      category: "Dairy",
      currentStock: 2,
      parLevel: 6,
      unit: "qts",
    },
    {
      id: "5",
      name: "Bacon",
      category: "Protein",
      currentStock: 4,
      parLevel: 8,
      unit: "lbs",
    },
    {
      id: "6",
      name: "Onions",
      category: "Produce",
      currentStock: 15,
      parLevel: 20,
      unit: "lbs",
    },
    {
      id: "7",
      name: "Flour",
      category: "Dry Goods",
      currentStock: 25,
      parLevel: 50,
      unit: "lbs",
    },
    {
      id: "8",
      name: "Eggs",
      category: "Dairy",
      currentStock: 24,
      parLevel: 60,
      unit: "ea",
    },
  ]);

  const categories = [
    "all",
    ...Array.from(new Set(inventory.map((item) => item.category))),
  ];

  const handleStockChange = (id: string, value: string) => {
    const numValue = value === "" ? 0 : Number(value);
    setInventory(
      inventory.map((item) =>
        item.id === id ? { ...item, currentStock: numValue } : item,
      ),
    );
  };

  const handleSave = () => {
    // In a real implementation, this would save to a database
    onSave(inventory);
  };

  const getStatusBadge = (current: number, par: number) => {
    const ratio = current / par;
    if (ratio <= 0.25) {
      return <Badge variant="destructive">Critical</Badge>;
    } else if (ratio <= 0.5) {
      return <Badge variant="default">Low</Badge>;
    } else if (ratio < 1) {
      return <Badge variant="secondary">Moderate</Badge>;
    } else {
      return <Badge variant="outline">Good</Badge>;
    }
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Card className="w-full bg-background">
      <CardHeader>
        <CardTitle className="text-2xl">Current Inventory</CardTitle>
        <CardDescription>
          Enter the current stock levels for each ingredient. The system will
          automatically calculate what needs to be prepped.
        </CardDescription>
        <div className="flex flex-col gap-4 mt-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
            }}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Ingredient</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>PAR Level</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Needed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.currentStock}
                        onChange={(e) =>
                          handleStockChange(item.id, e.target.value)
                        }
                        className="w-20"
                        min="0"
                      />
                    </TableCell>
                    <TableCell>{item.parLevel}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>
                      {getStatusBadge(item.currentStock, item.parLevel)}
                    </TableCell>
                    <TableCell>
                      {Math.max(0, item.parLevel - item.currentStock)}{" "}
                      {item.unit}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No ingredients found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end mt-6">
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Inventory
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryForm;
