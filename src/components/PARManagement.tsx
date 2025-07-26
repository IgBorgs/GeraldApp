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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Search, Plus, Pencil, Trash } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface IngredientPAR {
  id: string;
  name: string;
  category: string;
  parLevel: number;
  unit: string;
  notes: string;
  estimated_time: number;
  menu_relevance: boolean;
  default_recipe_qty?: string | number;
  isLunchItem: boolean;
  needsFryer: boolean;
}


const PARManagement = () => {
  const [ingredients, setIngredients] = useState<IngredientPAR[]>([]);
  const [ingredientToDelete, setIngredientToDelete] = useState<IngredientPAR | null>(null);
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
    default_recipe_qty: "",
    isLunchItem: false,
    needsFryer: false,
  });

  const fetchIngredients = async () => {
    const { data: items, error: itemsError } = await supabase
      .from("items")
      .select("*");

    if (itemsError) {
      console.error(
        "❌ Failed to fetch ingredients:",
        itemsError?.message
      );
      return;
    }

    const formatted = items.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      parLevel: item.par_level,
      unit: item.unit,
      notes: item.notes,
      estimated_time: item.estimated_time,
      menu_relevance: item.menu_relevance,
      default_recipe_qty: item.default_recipe_qty,
      isLunchItem: item.is_lunch_item ?? false,
      needsFryer: item.needs_fryer ?? false,
    }));

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
        default_recipe_qty: newIngredient.default_recipe_qty,
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
        default_recipe_qty: "",
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
        default_recipe_qty: editedIngredient.default_recipe_qty,
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

  const handleDeleteIngredient = async (id: string) => {
    console.log("🔁 Trying to delete stock entries for:", id);
  
    const { error: stockError } = await supabase
      .from("stock")
      .delete()
      .eq("item_id", id);
  
    if (stockError) {
      console.error("❌ Failed to delete from stock:", stockError.message);
      return;
    }
  
    console.log("🧹 Stock entries deleted. Deleting ingredient...");
  
    const { error: itemError } = await supabase
      .from("items")
      .delete()
      .eq("id", id);
  
    if (itemError) {
      console.error("❌ Failed to delete from items:", itemError.message);
    } else {
      console.log("✅ Ingredient deleted successfully");
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
          <CardTitle className="text-2xl font-bold">PAR Level Management</CardTitle>
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
                  { label: "Qty to Prep (Recipe)", field: "default_recipe_qty", type: "text" },
                  { label: "Lunch Item", field: "isLunchItem", type: "checkbox" },
                  { label: "Needs Fryer", field: "needsFryer", type: "checkbox" },
                ].map(({ label, field, type }) => {
                  const isEdit = !!editingId;
                  const state = isEdit ? editedIngredient : newIngredient;
                  const setState = isEdit ? setEditedIngredient : setNewIngredient;

                  return (
                    <div
                      key={field}
                      className="col-span-4 sm:col-span-2 flex items-center gap-2"
                    >
                      <label className="text-sm font-medium w-40">{label}</label>

                      {type === "checkbox" ? (
                        <Input
                          type="checkbox"
                          checked={!!state[field]}
                          onChange={(e) =>
                            setState({
                              ...state,
                              [field]: e.target.checked,
                            })
                          }
                          className="h-4 w-4"
                        />
                      ) : field === "category" ? (
                        <Select
                          value={state.category || ""}
                          onValueChange={(value) =>
                            setState({
                              ...state,
                              category: value,
                            })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              "Protein",
                              "Dry Goods",
                              "Sauces",
                              "Vegetables",
                              "Spices",
                              "Produce",
                              "Butter",
                              "Dairy",
                              "Desserts",
                              "Others",
                            ].map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : field === "unit" ? (
                        <Select
                          value={state.unit || ""}
                          onValueChange={(value) =>
                            setState({
                              ...state,
                              unit: value,
                            })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {["lbs", "ea", "L", "bin(s)"].map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          type={type}
                          value={state[field]?.toString() || ""}
                          onChange={(e) =>
                            setState({
                              ...state,
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
                  );
                })}

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
                  <TableHead>Unit</TableHead>
                  <TableHead>Qty to Prep</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIngredients.map((ing) => (
                  <TableRow key={ing.id}>
                    <TableCell>{ing.name}</TableCell>
                    <TableCell>{ing.category}</TableCell>
                    <TableCell>{ing.parLevel}</TableCell>
                    <TableCell>{ing.unit}</TableCell>
                    <TableCell>{ing.default_recipe_qty}</TableCell>
                    <TableCell className="flex gap-3">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => openEditDialog(ing)}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => setIngredientToDelete(ing)}
                      >
                        <Trash size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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
                { label: "Qty to Prep (Recipe)", field: "default_recipe_qty", type: "text" },
                { label: "Lunch Item", field: "isLunchItem", type: "checkbox" },
                { label: "Needs Fryer", field: "needsFryer", type: "checkbox" },
              ].map(({ label, field, type }) => {
                const isEdit = !!editingId;
                const state = isEdit ? editedIngredient : newIngredient;
                const setState = isEdit ? setEditedIngredient : setNewIngredient;

                return (
                  <div
                    key={field}
                    className="col-span-4 sm:col-span-2 flex items-center gap-2"
                  >
                    <label className="text-sm font-medium w-40">{label}</label>

                    {type === "checkbox" ? (
                      <Input
                        type="checkbox"
                        checked={!!state[field]}
                        onChange={(e) =>
                          setState({
                            ...state,
                            [field]: e.target.checked,
                          })
                        }
                        className="h-4 w-4"
                      />
                    ) : field === "category" ? (
                      <Select
                        value={state.category || ""}
                        onValueChange={(value) =>
                          setState({
                            ...state,
                            category: value,
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "Protein",
                            "Dry Goods",
                            "Sauces",
                            "Vegetables",
                            "Spices",
                            "Produce",
                            "Butter",
                            "Dairy",
                            "Desserts",
                            "Others",
                          ].map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field === "unit" ? (
                      <Select
                        value={state.unit || ""}
                        onValueChange={(value) =>
                          setState({
                            ...state,
                            unit: value,
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {["lbs", "ea", "L", "bin(s)"].map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type={type}
                        value={state[field]?.toString() || ""}
                        onChange={(e) =>
                          setState({
                            ...state,
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
                );
              })}

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

          <AlertDialog open={!!ingredientToDelete} onOpenChange={() => setIngredientToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Ingredient</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete{" "}
                  <strong>{ingredientToDelete?.name}</strong>? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIngredientToDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    if (ingredientToDelete?.id) {
                      console.log("🧪 Calling handleDeleteIngredient for:", ingredientToDelete.id);
                      handleDeleteIngredient(ingredientToDelete.id);
                    } else {
                      console.warn("⚠️ No ingredient ID to delete");
                    }
                    setIngredientToDelete(null);
                  }}
                >
                  Delete
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
