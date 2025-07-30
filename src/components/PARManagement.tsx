import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { Trash2, Pencil, Plus } from "lucide-react";

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
  recipe_yield?: number;
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
    recipe_yield: 1,
    isLunchItem: false,
    needsFryer: false,
  });

  const fetchIngredients = async () => {
    const { data: items, error: itemsError } = await supabase.from("items").select("*");

    if (itemsError) {
      console.error("❌ Failed to fetch ingredients:", itemsError?.message);
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
      recipe_yield: item.recipe_yield,
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
        recipe_yield: newIngredient.recipe_yield,
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
        recipe_yield: 1,
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
        recipe_yield: editedIngredient.recipe_yield,
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
    const { error: stockError } = await supabase
      .from("stock")
      .delete()
      .eq("item_id", id);

    if (stockError) {
      console.error("❌ Failed to delete from stock:", stockError.message);
      return;
    }

    const { error: itemError } = await supabase
      .from("items")
      .delete()
      .eq("id", id);

    if (itemError) {
      console.error("❌ Failed to delete from items:", itemError.message);
    } else {
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
          <div className="flex items-center justify-between mb-4">
            <Input
              type="text"
              placeholder="Search ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-sm"
            />
            <Button className="ml-4" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Ingredient
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-2 border-b">Name</th>
                  <th className="text-left p-2 border-b">Category</th>
                  <th className="text-left p-2 border-b">PAR</th>
                  <th className="text-left p-2 border-b">Unit</th>
                  <th className="text-left p-2 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIngredients.map((ing) => (
                  <tr key={ing.id}>
                    <td className="p-2 border-b">{ing.name}</td>
                    <td className="p-2 border-b">{ing.category}</td>
                    <td className="p-2 border-b">{ing.parLevel}</td>
                    <td className="p-2 border-b">{ing.unit}</td>
                    <td className="p-2 border-b flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => openEditDialog(ing)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleDeleteIngredient(ing.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ADD + EDIT DIALOG FORMS */}
          {[true, false].map((isEdit) => {
            const dialogOpen = isEdit ? showEditDialog : showAddDialog;
            const setDialogOpen = isEdit ? setShowEditDialog : setShowAddDialog;
            const state = isEdit ? editedIngredient : newIngredient;
            const setState = isEdit ? setEditedIngredient : setNewIngredient;
            const onConfirm = isEdit ? handleEditIngredient : handleAddIngredient;

            return (
              <AlertDialog key={isEdit ? "edit" : "add"} open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{isEdit ? "Edit Ingredient" : "Add New Ingredient"}</AlertDialogTitle>
                  </AlertDialogHeader>
                  <div className="grid grid-cols-4 gap-4 py-4">
                    {[
                      { label: "Name", field: "name", type: "text" },
                      { label: "Category", field: "category", type: "text" },
                      { label: "PAR Level", field: "parLevel", type: "number" },
                      { label: "Unit", field: "unit", type: "text" },
                      { label: "Qty to Prep (Recipe)", field: "default_recipe_qty", type: "text" },
                      { label: "Recipe Yield (unit per recipe)", field: "recipe_yield", type: "number" },
                      { label: "Estimated Time", field: "estimated_time", type: "number" },
                      { label: "Notes", field: "notes", type: "text" },
                      { label: "Menu Relevance", field: "menu_relevance", type: "checkbox" },
                      { label: "Lunch Item", field: "isLunchItem", type: "checkbox" },
                      { label: "Needs Fryer", field: "needsFryer", type: "checkbox" },
                    ].map(({ label, field, type }) => (
                      <div
                        key={field}
                        className="col-span-4 sm:col-span-2 flex items-center gap-2"
                      >
                        <label className="text-sm font-medium w-44">{label}</label>
                        {type === "checkbox" ? (
                          <Input
                            type="checkbox"
                            checked={!!state[field]}
                            onChange={(e) =>
                              setState({ ...state, [field]: e.target.checked })
                            }
                            className="h-4 w-4"
                          />
                        ) : (
                          <Input
                            type={type}
                            value={state[field]?.toString() || ""}
                            onChange={(e) =>
                              setState({
                                ...state,
                                [field]: type === "number" ? parseFloat(e.target.value) : e.target.value,
                              })
                            }
                            className="w-full"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDialogOpen(false)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>
                      {isEdit ? "Save" : "Add"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default PARManagement;



