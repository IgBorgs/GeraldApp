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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Plus, Pencil, Trash } from "lucide-react";
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from "@/components/ui/select";
import { usePrepList } from "@/components/PrepListContext";


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
const [showCustomInputDialog, setShowCustomInputDialog] = useState(false);
const [customFieldType, setCustomFieldType] = useState<"category" | "unit" | null>(null);
const [customInputValue, setCustomInputValue] = useState("");
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


const { refreshPrepList, prepList, setPrepList } = usePrepList();


const [categories, setCategories] = useState([
"Protein", "Dry Goods", "Sauces", "Vegetables", "Spices", "Produce", "Butter", "Dairy", "Desserts", "Others",
]);


const [units, setUnits] = useState([
"lbs", "ea", "L", "bin(s)",
]);
  

  const handleCustomValueSave = () => {
    if (!customInputValue.trim()) return;
    if (customFieldType === "category" && !categories.includes(customInputValue)) {
    setCategories((prev) => [...prev, customInputValue]);
    setNewIngredient((prev) => ({ ...prev, category: customInputValue }));
    setEditedIngredient((prev) => ({ ...prev, category: customInputValue }));
    } else if (customFieldType === "unit" && !units.includes(customInputValue)) {
    setUnits((prev) => [...prev, customInputValue]);
    setNewIngredient((prev) => ({ ...prev, unit: customInputValue }));
    setEditedIngredient((prev) => ({ ...prev, unit: customInputValue }));
    }
    setCustomInputValue("");
    setCustomFieldType(null);
    setShowCustomInputDialog(false);
    };



  const fetchIngredients = async () => {
    const { data: items, error: itemsError } = await supabase.from("items").select("*").eq("is_deleted", false); // Only show items not deleted;
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

    formatted.sort((a, b) => a.name.localeCompare(b.name));

    setIngredients(formatted);
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const handleAddIngredient = async () => {
    const { error } = await supabase.from("items").insert([{
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
    }]);
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

      // 💥 Force regenerate the prep list to include the new item
    await refreshPrepList(true);
    }
  };

  const handleEditIngredient = async () => {
    if (!editingId) return;
    const { error } = await supabase.from("items").update({
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
    }).eq("id", editingId);
    if (!error) {
      setShowEditDialog(false);
      setEditingId(null);
      setEditedIngredient({});
      fetchIngredients();

      await refreshPrepList(true);
    }
  };

  const handleDeleteIngredient = async (id: string) => {
    // Delete stock entries associated with the item
    const { error: stockError } = await supabase.from("stock").delete().eq("item_id", id);
    if (stockError) {
      console.error("❌ Failed to delete from stock:", stockError.message);
      return;
    }
  
    // Soft-delete the item in the items table
    const { error: itemError } = await supabase
      .from("items")
      .update({ is_deleted: true })
      .eq("id", id);
  
    if (itemError) {
      console.error("❌ Failed to soft-delete item:", itemError.message);
      return;
    }
  
    // Immediately delete incomplete prep_list entries for this item
    const { error: prepListDeleteError } = await supabase
      .from("prep_list")
      .delete()
      .eq("item_id", id)
      .eq("completed", false);
  
    if (prepListDeleteError) {
      console.error("⚠️ Failed to delete item from prep_list:", prepListDeleteError.message);
    }
  
    // Remove from frontend state
  setPrepList((prev) => prev.filter((item) => item.item_id !== id));

    // Refresh the ingredients table
    fetchIngredients();
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
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Ingredient
            </Button>
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
                  <TableHead>Recipe Yield</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
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
                    <TableCell>{ing.recipe_yield}</TableCell>
                    <TableCell>{ing.notes}</TableCell>
                    <TableCell className="flex gap-3">
                      <Button size="icon" variant="outline" onClick={() => {
                        setEditingId(ing.id);
                        setEditedIngredient({ ...ing });
                        setShowEditDialog(true);
                      }}>
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

          {/* Edit Ingredient Dialog */}
          <AlertDialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Edit Ingredient</AlertDialogTitle>
              </AlertDialogHeader>
              <div className="grid grid-cols-4 gap-4 py-4">
                {[{ label: "Name", field: "name", type: "text" },
                  { label: "Category", field: "category", type: "select", options: categories },

                  { label: "PAR Level", field: "parLevel", type: "number" },
                  { label: "Unit", field: "unit", type: "select", options: units },

                  { label: "Qty to Prep (Recipe)", field: "default_recipe_qty", type: "text" },
                  { label: "Recipe Yield", field: "recipe_yield", type: "number" },
                  { label: "Estimated Time", field: "estimated_time", type: "number" },
                  { label: "Notes", field: "notes", type: "text" },
                  { label: "Menu Relevance", field: "menu_relevance", type: "checkbox" },
                  { label: "Lunch Item", field: "isLunchItem", type: "checkbox" },
                  { label: "Needs Fryer", field: "needsFryer", type: "checkbox" }].map(({ label, field, type, options }) => (
                  <div key={field} className="col-span-4 sm:col-span-2 flex items-center gap-2">
                    <label className="text-sm font-medium w-40">{label}</label>
                    {type === "checkbox" ? (
                      <Input type="checkbox" checked={!!editedIngredient[field]} onChange={(e) => setEditedIngredient({ ...editedIngredient, [field]: e.target.checked })} className="h-4 w-4" />
                    ) : type === "select" && options ? (
                      <Select
  value={editedIngredient[field] as string}
  onValueChange={(value) => {
    if (value === "__add_new__") {
      setCustomFieldType(field === "category" ? "category" : "unit");
      setCustomInputValue(""); // Clear input
      setShowCustomInputDialog(true); // Open custom modal
      return;
    } else {
      setEditedIngredient({ ...editedIngredient, [field]: value });
    }
    
  }}
>

                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
  {options.map((opt) => (
    <SelectItem key={opt} value={opt}>
      {opt}
    </SelectItem>
  ))}
  <SelectItem value="__add_new__" className="text-primary font-semibold">
    ➕ Add new
  </SelectItem>
</SelectContent>

                      </Select>
                    ) : (
                      <Input type={type} value={editedIngredient[field]?.toString() || ""} onChange={(e) => setEditedIngredient({ ...editedIngredient, [field]: type === "number" ? parseFloat(e.target.value) : e.target.value })} className="w-full" />
                    )}
                  </div>
                ))}
              </div>

              {/* Short inline explanation */}
<p className="text-xs text-muted-foreground italic px-1 -mt-2 mb-2">
* Qty to Prep × Recipe Yield = Total portions produced
</p>


{/* Full legend */}
<p className="text-sm text-muted-foreground mt-2 px-1">
<strong>How to fill this form:</strong><br />
- <strong>PAR Level</strong>: The minimum amount of this item you want available at all times.<br />
- <strong>Qty to Prep (Recipe)</strong>: How many times you'll prepare this recipe.<br />
- <strong>Recipe Yield</strong>: How many units (portions, items, etc.) one recipe produces.<br /><br />
<em>Example:</em> If you prep <strong>2 recipes</strong> of "5oz Marinated", and each recipe yields <strong>14 portions</strong>, you’ll produce <strong>28 total portions</strong>. This helps restock your inventory above the PAR level.
</p>

              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setShowEditDialog(false)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleEditIngredient}>Save</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Confirm Delete Dialog */}
          <AlertDialog open={!!ingredientToDelete} onOpenChange={() => setIngredientToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Ingredient</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete <strong>{ingredientToDelete?.name}</strong>? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIngredientToDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => {
                  if (ingredientToDelete?.id) {
                    handleDeleteIngredient(ingredientToDelete.id);
                  }
                  setIngredientToDelete(null);
                }}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Add New Ingredient</AlertDialogTitle>
              </AlertDialogHeader>
              <div className="grid grid-cols-4 gap-4 py-4">
                {[
                  { label: "Name", field: "name", type: "text" },
                  { label: "Category", field: "category", type: "select", options: categories },

                  { label: "PAR Level", field: "parLevel", type: "number" },
                  { label: "Unit", field: "unit", type: "select", options: units },

                  { label: "Qty to Prep (Recipe)", field: "default_recipe_qty", type: "text" },
                  { label: "Recipe Yield", field: "recipe_yield", type: "number" },
                  { label: "Estimated Time", field: "estimated_time", type: "number" },
                  { label: "Notes", field: "notes", type: "text" },
                  { label: "Menu Relevance", field: "menu_relevance", type: "checkbox" },
                  { label: "Lunch Item", field: "isLunchItem", type: "checkbox" },
                  { label: "Needs Fryer", field: "needsFryer", type: "checkbox" },
                ].map(({ label, field, type, options }) => (
                  <div key={field} className="col-span-4 sm:col-span-2 flex items-center gap-2">
                    <label className="text-sm font-medium w-40">{label}</label>
                    {type === "checkbox" ? (
                      <Input
                        type="checkbox"
                        checked={!!newIngredient[field]}
                        onChange={(e) =>
                          setNewIngredient({ ...newIngredient, [field]: e.target.checked })
                        }
                        className="h-4 w-4"
                      />
                    ) : type === "select" && options ? (
                      <Select
  value={newIngredient[field] as string}
  onValueChange={(value) => {
    if (value === "__add_new__") {
      setCustomFieldType(field === "category" ? "category" : "unit");
      setCustomInputValue(""); // Clear input
      setShowCustomInputDialog(true); // Open custom modal
      return;
    } else {
      setEditedIngredient({ ...editedIngredient, [field]: value });
    }
    
  }}
>

                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
  {options.map((opt) => (
    <SelectItem key={opt} value={opt}>
      {opt}
    </SelectItem>
  ))}
  <SelectItem value="__add_new__" className="text-primary font-semibold">
    ➕ Add new
  </SelectItem>
</SelectContent>

                      </Select>
                    ) : (
                      <Input
                        type={type}
                        value={newIngredient[field]?.toString() || ""}
                        onChange={(e) =>
                          setNewIngredient({
                            ...newIngredient,
                            [field]: type === "number" ? parseFloat(e.target.value) : e.target.value,
                          })
                        }
                        className="w-full"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Short inline explanation */}
<p className="text-xs text-muted-foreground italic px-1 -mt-2 mb-2">
* Qty to Prep × Recipe Yield = Total portions produced
</p>


{/* Full legend */}
<p className="text-sm text-muted-foreground mt-2 px-1">
<strong>How to fill this form:</strong><br />
- <strong>PAR Level</strong>: The minimum amount of this item you want available at all times.<br />
- <strong>Qty to Prep (Recipe)</strong>: How many times you'll prepare this recipe.<br />
- <strong>Recipe Yield</strong>: How many units (portions, items, etc.) one recipe produces.<br /><br />
<em>Example:</em> If you prep <strong>2 recipes</strong> of "5oz Marinated", and each recipe yields <strong>14 portions</strong>, you’ll produce <strong>28 total portions</strong>. This helps restock your inventory above the PAR level.
</p>

              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setShowAddDialog(false)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleAddIngredient}>Add</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        </CardContent>
      </Card>

      {/* Custom Value Dialog */}
<Dialog open={showCustomInputDialog} onOpenChange={setShowCustomInputDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Add New {customFieldType === "category" ? "Category" : "Unit"}</DialogTitle>
    </DialogHeader>
    <Input
      placeholder={`Enter a new ${customFieldType}`}
      value={customInputValue}
      onChange={(e) => setCustomInputValue(e.target.value)}
      className="mb-4"
    />
    <Button onClick={handleCustomValueSave}>Save</Button>
  </DialogContent>
</Dialog>
    </div>
  );
};

export default PARManagement;



