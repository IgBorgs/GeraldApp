import React, { useEffect, useState } from "react";
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
import { supabase } from "@/lib/supabaseClient";
import { usePrepList } from "@/components/PrepListContext";
import BackToHomeButton from "./BackToHomeButton";
import { useLocation } from "react-router-dom";

const getRestaurantId = () => localStorage.getItem("restaurant_id");



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
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const { refreshPrepList } = usePrepList();
  const location = useLocation();
  const isFullPage = location.pathname === "/inventory";

  useEffect(() => {
    const fetchInventory = async () => {
      const { data: itemsData, error: itemsError } = await supabase
        .from("items")
        .select("*")
        .eq("is_deleted", false)
        .eq("restaurant_id", getRestaurantId());

      if (itemsError) {
        console.error("❌ Error fetching items:", itemsError.message);
        return;
      }

      const { data: stockData, error: stockError } = await supabase
        .from("stock")
        .select("*")
        .eq("restaurant_id", getRestaurantId());

      if (stockError) {
        console.error("❌ Error fetching stock:", stockError.message);
        return;
      }

      const inventoryItems: InventoryItem[] = itemsData.map((item) => {
        const stock = stockData.find((s) => s.item_id === item.id);
        return {
          id: item.id,
          name: item.name,
          category: item.category || "Uncategorized",
          unit: item.unit || "",
          parLevel: item.par_level || 0,
          currentStock: stock?.quantity || 0,
        };
      });

      setInventory(inventoryItems);
    };

    fetchInventory();
  }, []);

  const categories = [
    "all",
    ...Array.from(new Set(inventory.map((item) => item.category))),
  ];

  const handleStockChange = (id: string, value: string) => {
    const normalized = value.replace(",", ".");
  
    setInputValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  
    const parsed = parseFloat(normalized);
    if (!isNaN(parsed)) {
      setInventory(
        inventory.map((item) =>
          item.id === id ? { ...item, currentStock: parsed } : item
        )
      );
    }
  };
  

  

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(false);

    const formattedStock = inventory.map((item) => ({
      item_id: item.id,
      quantity: item.currentStock,
      restaurant_id: getRestaurantId(),
    }));

    const { data, error } = await supabase
      .from("stock")
      .upsert(formattedStock, {
        onConflict: ["item_id"],
      });

    if (error) {
      console.error("❌ Error saving stock to Supabase:", error.message);
      setSaveError(true);
    } else {
      console.log("✅ Stock saved successfully:", data);
      setSaveSuccess(true);
      await refreshPrepList(true);
    }

    setIsSaving(false);
    setTimeout(() => {
      setSaveSuccess(false);
      setSaveError(false);
    }, 3000);
  };

  const getStatusBadge = (current: number, par: number) => {
    const ratio = current / par;
    if (ratio <= 0.25) return <Badge variant="destructive">Critical</Badge>;
    if (ratio <= 0.5) return <Badge variant="default">Low</Badge>;
    if (ratio < 1) return <Badge variant="secondary">Moderate</Badge>;
    return <Badge variant="outline">Good</Badge>;
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
    <div className="p-6 w-full">
      <BackToHomeButton />
      <div className={isFullPage ? "pt-16" : ""}>
        <Card className="w-full bg-background">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Current Inventory</CardTitle>
            <CardDescription>
              Enter the current stock levels for each ingredient. The system will
              automatically generate the prep list for items below PAR.
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
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
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
                onClick={handleSave}
                disabled={isSaving}
                className="relative"
                title="Save Inventory"
              >
                <RefreshCw
                  className={`h-4 w-4 transition-transform duration-500 ${
                    isSaving ? "animate-spin" : ""
                  }`}
                />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-2">
              Showing <strong>{filteredInventory.length}</strong> ingredient
              {filteredInventory.length === 1 ? "" : "s"} in the system.
            </div>

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
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                        <Input
  type="text"
  value={inputValues[item.id] ?? item.currentStock.toString()}
  onChange={(e) => handleStockChange(item.id, e.target.value)}
  className="w-20"
/>


                        </TableCell>
                        <TableCell>{item.parLevel}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>
                          {getStatusBadge(item.currentStock, item.parLevel)}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const needed = Math.max(0, item.parLevel - item.currentStock);
                            return `${Number.isInteger(needed) ? needed : needed.toFixed(2)} ${item.unit}`;
                          })()}
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
              <Button
                onClick={handleSave}
                className="flex items-center gap-2"
                disabled={isSaving}
              >
                <Save className="h-4 w-4" />
                {isSaving
                  ? "Saving..."
                  : saveSuccess
                  ? "Saved ✔️"
                  : saveError
                  ? "Error ❌"
                  : "Save Inventory"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventoryForm;



