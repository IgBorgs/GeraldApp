import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Search, Plus, Pencil } from "lucide-react";

interface IngredientPAR {
  id: string;
  name: string;
  category: string;
  parLevel: number;
  unit: string;
  notes: string;
  estimated_time: number;
  menu_relevance: boolean;
  currentQty: number;
  isLunchItem: boolean;
  needsFryer: boolean;
}

const getAutoPriority = ({
  currentQty,
  parLevel,
  menu_relevance,
  estimated_time,
  needsFryer,
  name,
  isLunchItem,
}: Omit<IngredientPAR, "id" | "category" | "unit" | "notes">): "A" | "B" | "C" => {
  const percent = (currentQty / parLevel) * 100;
  if (name.toLowerCase().includes("prime rib seasoning")) return "A";
  if (percent <= 30) return "A";
  if (needsFryer) return "A";
  if (estimated_time >= 90) return "A";
  if (isLunchItem) return "A";
  if (menu_relevance && percent <= 75) return "B";
  return "C";
};

const getPriorityColor = (priority: "A" | "B" | "C") => {
  switch (priority) {
    case "A":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    case "B":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "C":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    default:
      return "";
  }
};

const PARManagement = () => {
  const [ingredients, setIngredients] = useState<IngredientPAR[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedIngredient, setEditedIngredient] = useState<Partial<IngredientPAR>>({});
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newIngredient, setNewIngredient] = useState<Partial<IngredientPAR>>({
    name: "",
    category: "Protein",
    parLevel: 0,
    unit: "lbs",
    notes: "",
    estimated_time: 15,
    menu_relevance: false,
    isLunchItem: false,
    needsFryer: false,
  });

  const fetchIngredients = async () => {
    const { data: items, error: itemsError } = await supabase
      .from("items")
      .select("*");
    const { data: stock, error: stockError } = await supabase
      .from("stock")
      .select("*");

    if (itemsError || stockError) {
      console.error(
        "❌ Failed to fetch ingredients or stock:",
        itemsError?.message || stockError?.message
      );
      return;
    }

    const formatted = items.map((item) => {
      const stockEntry = stock.find((s) => s.item_id === item.id);
      return {
        id: item.id,
        name: item.name,
        category: item.category,
        parLevel: item.par_level,
        unit: item.unit,
        notes: item.notes,
        estimated_time: item.estimated_time,
        menu_relevance: item.menu_relevance,
        currentQty: stockEntry?.quantity ?? 0,
        isLunchItem: item.is_lunch_item ?? false,
        needsFryer: item.needs_fryer ?? false,
      };
    });

    setIngredients(formatted);
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const handleAddIngredient = async () => {
    const { error } = await supabase.from("items").insert([
      {
        name: newIngredient.name,
        category: newIngredient.category,
        par_level: newIngredient.parLevel,
        unit: newIngredient.unit,
        notes: newIngredient.notes,
        estimated_time: newIngredient.estimated_time,
        menu_relevance: newIngredient.menu_relevance,
        is_lunch_item: newIngredient.isLunchItem,
        needs_fryer: newIngredient.needsFryer,
      },
    ]);

    if (!error) {
      setShowAddDialog(false);
      setNewIngredient({
        name: "",
        category: "Protein",
        parLevel: 0,
        unit: "lbs",
        notes: "",
        estimated_time: 15,
        menu_relevance: false,
        isLunchItem: false,
        needsFryer: false,
      });
      fetchIngredients();
    }
  };

  const openEditDialog = (ing: IngredientPAR) => {
    setEditingId(ing.id);
    setEditedIngredient({ ...ing });
    setShowEditDialog(true);
  };

  const handleEditIngredient = async () => {
    if (!editingId) return;

    const { error } = await supabase
      .from("items")
      .update({
        name: editedIngredient.name,
        category: editedIngredient.category,
        par_level: editedIngredient.parLevel,
        unit: editedIngredient.unit,
        notes: editedIngredient.notes,
        estimated_time: editedIngredient.estimated_time,
        menu_relevance: editedIngredient.menu_relevance,
        is_lunch_item: editedIngredient.isLunchItem,
        needs_fryer: editedIngredient.needsFryer,
      })
      .eq("id", editingId);

    if (!error) {
      setShowEditDialog(false);
      setEditingId(null);
      setEditedIngredient({});
      fetchIngredients();
    }
  };

  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 w-full">
      <Card>
        <CardHeader>
          <CardTitle>PAR Level Management</CardTitle>
          <CardDescription>Set and adjust target inventory levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <AlertDialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <AlertDialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Ingredient
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Add New Ingredient</AlertDialogTitle>
                </AlertDialogHeader>
                <div className="grid grid-cols-4 gap-4 py-4">
                  {[
                    { label: "Name", field: "name", type: "text" },
                    { label: "Category", field: "category", type: "text" },
                    { label: "PAR Level", field: "parLevel", type: "number" },
                    { label: "Unit", field: "unit", type: "text" },
                    { label: "Notes", field: "notes", type: "text" },
                    { label: "Estimated Time", field: "estimated_time", type: "number" },
                    { label: "Menu Relevance", field: "menu_relevance", type: "checkbox" },
                    { label: "Lunch Item", field: "isLunchItem", type: "checkbox" },
                    { label: "Needs Fryer", field: "needsFryer", type: "checkbox" },
                  ].map(({ label, field, type }) => (
                    <div key={field} className="col-span-4 sm:col-span-2 flex items-center gap-2">
                      <label className="text-sm font-medium w-32">{label}</label>
                      {type === "checkbox" ? (
                        <Input
                          type="checkbox"
                          checked={!!newIngredient[field]}
                          onChange={(e) =>
                            setNewIngredient({
                              ...newIngredient,
                              [field]: e.target.checked,
                            })
                          }
                          className="h-4 w-4"
                        />
                      ) : (
                        <Input
                          type={type}
                          value={newIngredient[field]?.toString() || ""}
                          onChange={(e) =>
                            setNewIngredient({
                              ...newIngredient,
                              [field]: type === "number"
                                ? parseInt(e.target.value)
                                : e.target.value,
                            })
                          }
                          className="w-full"
                        />
                      )}
                    </div>
                  ))}
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleAddIngredient}>
                    Add
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>PAR</TableHead>
                  <TableHead>Current Qty</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIngredients.map((ing) => {
                  const priority = getAutoPriority(ing);
                  return (
                    <TableRow key={ing.id}>
                      <TableCell>{ing.name}</TableCell>
                      <TableCell>{ing.category}</TableCell>
                      <TableCell>{ing.parLevel}</TableCell>
                      <TableCell>{ing.currentQty}</TableCell>
                      <TableCell>{ing.unit}</TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(priority)}>
                          {priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => openEditDialog(ing)}
                        >
                          <Pencil size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <AlertDialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Edit Ingredient</AlertDialogTitle>
              </AlertDialogHeader>
              <div className="grid grid-cols-4 gap-4 py-4">
                {[
                  { label: "Name", field: "name", type: "text" },
                  { label: "Category", field: "category", type: "text" },
                  { label: "PAR Level", field: "parLevel", type: "number" },
                  { label: "Unit", field: "unit", type: "text" },
                  { label: "Notes", field: "notes", type: "text" },
                  { label: "Estimated Time", field: "estimated_time", type: "number" },
                  { label: "Menu Relevance", field: "menu_relevance", type: "checkbox" },
                  { label: "Lunch Item", field: "isLunchItem", type: "checkbox" },
                  { label: "Needs Fryer", field: "needsFryer", type: "checkbox" },
                ].map(({ label, field, type }) => (
                  <div key={field} className="col-span-4 sm:col-span-2 flex items-center gap-2">
                    <label className="text-sm font-medium w-32">{label}</label>
                    {type === "checkbox" ? (
                      <Input
                        type="checkbox"
                        checked={!!editedIngredient[field]}
                        onChange={(e) =>
                          setEditedIngredient({
                            ...editedIngredient,
                            [field]: e.target.checked,
                          })
                        }
                        className="h-4 w-4"
                      />
                    ) : (
                      <Input
                        type={type}
                        value={editedIngredient[field]?.toString() || ""}
                        onChange={(e) =>
                          setEditedIngredient({
                            ...editedIngredient,
                            [field]:
                              type === "number"
                                ? parseInt(e.target.value)
                                : e.target.value,
                          })
                        }
                        className="w-full"
                      />
                    )}
                  </div>
                ))}
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => {
                    setShowEditDialog(false);
                    setEditingId(null);
                  }}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleEditIngredient}>
                  Save
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default PARManagement;
