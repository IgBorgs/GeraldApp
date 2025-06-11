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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Search, Save, Plus, Trash2, AlertCircle } from "lucide-react";

interface IngredientPAR {
  id: string;
  name: string;
  category: string;
  parLevel: number;
  unit: string;
  priority: "A" | "B" | "C";
  notes: string;  
  estimated_time: number;
  menu_relevance: boolean;
}

const PARManagement = () => {
  const [ingredients, setIngredients] = useState<IngredientPAR[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [editingIngredient, setEditingIngredient] = useState<IngredientPAR | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newIngredient, setNewIngredient] = useState<Partial<IngredientPAR>>({
    name: "",
    category: "Protein",
    parLevel: 0,
    unit: "lbs",
    priority: "B",
    notes: "",
    estimated_time: 15,
    menu_relevance: false,
  });

  useEffect(() => {
    const fetchIngredients = async () => {
      const { data, error } = await supabase.from("items").select("*");
      if (error) {
        console.error("❌ Failed to fetch ingredients:", error.message);
        return;
      }
      const formatted = data.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        parLevel: item.par_level,
        unit: item.unit,
        priority: item.priority,
        notes: item.notes,
        estimated_time: item.estimated_time,
        menu_relevance: item.menu_relevance,
      }));
      setIngredients(formatted);
    };
    fetchIngredients();
  }, []);
   

  const categories = [
    "All",
    "Protein",
    "Produce",
    "Dairy",
    "Dry Goods",
    "Spices",
    "Sauces",
    "Vegetables",
    "Other",
  ];

  const filteredIngredients = ingredients.filter((ingredient) => {
    const matchesSearch = ingredient.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || ingredient.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleEditIngredient = (ingredient) => {
    setEditingIngredient({
      id: ingredient.id,
      name: ingredient.name || "",
      category: ingredient.category || "",
      parLevel: ingredient.parLevel || 0,
      unit: ingredient.unit || "",
      priority: ingredient.priority || "B",
      notes: ingredient.notes || "",
      estimated_time: ingredient.estimated_time || 0,
      menu_relevance: ingredient.menu_relevance ?? false,
    });
  };
  

  const handleSaveEdit = async () => {
    if (!editingIngredient) return;
  
    const {
      id,
      name,
      category,
      parLevel,
      unit,
      priority,
      notes,
      estimated_time,
      menu_relevance,
    } = editingIngredient;
  
    const { error } = await supabase
      .from("items")
      .update({
        name,
        category,
        par_level: parLevel, // assumes your Supabase column is named 'par_level'
        unit,
        priority,
        notes,
        estimated_time,
        menu_relevance,
      })
      .eq("id", id);
  
    if (error) {
      console.error("❌ Failed to update ingredient:", error.message);
      alert("Failed to update the ingredient. Please try again.");
      return;
    }
  
    // Optional: log or toast success message
    console.log("✅ Ingredient updated successfully");
  
    // Update local state
    setIngredients((prev) =>
      prev.map((ing) => (ing.id === id ? { ...ing, ...editingIngredient } : ing))
    );
  
    // Exit edit mode
    setEditingIngredient(null);
  };
  
  

  const handleCancelEdit = () => {
    setEditingIngredient(null);
  };

  const handleAddIngredient = async () => {
    const ingredientToAdd = {
      name: newIngredient.name || "",
      category: newIngredient.category || "Protein",
      par_level: newIngredient.parLevel || 0,
      unit: newIngredient.unit || "",
      priority: newIngredient.priority || "B",
      notes: newIngredient.notes || "",
      estimated_time: newIngredient.estimated_time || 15,
      menu_relevance: newIngredient.menu_relevance || false,
      created_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from("items").insert([ingredientToAdd]).select();
    if (error) {
      console.error("❌ Supabase insert failed:", error.message);
      return;
    }
    setIngredients([
      ...ingredients,
      {
        id: data[0].id,
        ...ingredientToAdd,
        parLevel: ingredientToAdd.par_level,
      },
    ]);
    setShowAddDialog(false);
    setNewIngredient({
      name: "",
      category: "Protein",
      parLevel: 0,
      unit: "lbs",
      priority: "B",
      notes: "",
      estimated_time: 15,
      menu_relevance: false,
    });
  };
  

  const handleDeleteIngredient = async (id: string) => {
    const { error } = await supabase
      .from("items")
      .delete()
      .eq("id", id);
  
    if (error) {
      console.error("❌ Failed to delete ingredient:", error.message);
      return;
    }
  
    setIngredients(ingredients.filter((ing) => ing.id !== id));
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

  return (
    <div className="bg-background p-6 rounded-lg shadow-sm w-full">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">PAR Level Management</CardTitle>
          <CardDescription>
            Set and adjust target inventory levels for all ingredients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search ingredients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <AlertDialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <AlertDialogTrigger asChild>
                    <Button className="flex items-center gap-1">
                      <Plus size={16} />
                      Add Ingredient
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Add New Ingredient</AlertDialogTitle>
                      <AlertDialogDescription>
                        Enter the details for the new ingredient and its PAR level.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid gap-4 py-4">
                      {['name', 'category', 'parLevel', 'unit', 'priority', 'notes'].map((field) => (
                        <div
                          key={field}
                          className="grid grid-cols-4 items-center gap-4"
                        >
                          <label className="text-right text-sm capitalize">
                            {field === 'parLevel' ? 'PAR Level' : field}
                          </label>
                          {field === 'category' || field === 'priority' ? (
                            <Select
                              value={newIngredient[field] || (field === 'category' ? 'Protein' : 'B')}
                              onValueChange={(value) =>
                                setNewIngredient({ ...newIngredient, [field]: value })
                              }
                            >
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder={`Select ${field}`} />
                              </SelectTrigger>
                              <SelectContent>
                                {(field === 'category'
                                  ? categories.filter((c) => c !== 'All')
                                  : ['A', 'B', 'C']
                                ).map((opt) => (
                                  <SelectItem value={opt} key={opt}>
                                    {field === 'priority'
                                      ? `${opt} - ${opt === 'A' ? 'High' : opt === 'B' ? 'Medium' : 'Low'}`
                                      : opt}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              className="col-span-3"
                              type={field === 'parLevel' ? 'number' : 'text'}
                              value={newIngredient[field]?.toString() || ''}
                              onChange={(e) =>
                                setNewIngredient({
                                  ...newIngredient,
                                  [field]: field === 'parLevel' ? parseInt(e.target.value) : e.target.value,
                                })
                              }
                            />
                          )}
                        </div>
                      ))}
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label className="text-right text-sm">Estimated Time (min)</label>
                        <Input
                          className="col-span-3"
                          type="number"
                          value={newIngredient.estimated_time?.toString() || '0'}
                          onChange={(e) =>
                            setNewIngredient({
                              ...newIngredient,
                              estimated_time: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label className="text-right text-sm">Menu Relevant</label>
                        <Select
                          value={newIngredient.menu_relevance ? 'true' : 'false'}
                          onValueChange={(value) =>
                            setNewIngredient({
                              ...newIngredient,
                              menu_relevance: value === 'true',
                            })
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleAddIngredient}>Add Ingredient</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
  
            <Tabs defaultValue="table" className="w-full">
    <TabsList className="grid w-[200px] grid-cols-2">
      <TabsTrigger value="table">Table</TabsTrigger>
      <TabsTrigger value="cards">Cards</TabsTrigger>
    </TabsList>
  
              {/* Table View */}
              <TabsContent value="table" className="mt-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>PAR Level</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Estimated Time</TableHead>
                        <TableHead>Menu Relevant</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredIngredients.map((ingredient) => (
                        <TableRow key={ingredient.id}>
                          <TableCell>
                            {editingIngredient?.id === ingredient.id ? (
                              <Input
                                value={editingIngredient.name}
                                onChange={(e) =>
                                  setEditingIngredient({
                                    ...editingIngredient,
                                    name: e.target.value,
                                  })
                                }
                              />
                            ) : (
                              ingredient.name
                            )}
                          </TableCell>
                          <TableCell>
                            {editingIngredient?.id === ingredient.id ? (
                              <Select
                                value={editingIngredient.category}
                                onValueChange={(value) =>
                                  setEditingIngredient({
                                    ...editingIngredient,
                                    category: value,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.filter(c => c !== "All").map(category => (
                                    <SelectItem key={category} value={category}>
                                      {category}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              ingredient.category
                            )}
                          </TableCell>
                          <TableCell>
                            {editingIngredient?.id === ingredient.id ? (
                              <Input
                                type="number"
                                value={editingIngredient.parLevel.toString()}
                                onChange={(e) =>
                                  setEditingIngredient({
                                    ...editingIngredient,
                                    parLevel: parseInt(e.target.value) || 0,
                                  })
                                }
                              />
                            ) : (
                              ingredient.parLevel
                            )}
                          </TableCell>
                          <TableCell>
                            {editingIngredient?.id === ingredient.id ? (
                              <Input
                                value={editingIngredient.unit}
                                onChange={(e) =>
                                  setEditingIngredient({
                                    ...editingIngredient,
                                    unit: e.target.value,
                                  })
                                }
                              />
                            ) : (
                              ingredient.unit
                            )}
                          </TableCell>
                          <TableCell>
                            {editingIngredient?.id === ingredient.id ? (
                              <Select
                                value={editingIngredient.priority}
                                onValueChange={(value: "A" | "B" | "C") =>
                                  setEditingIngredient({
                                    ...editingIngredient,
                                    priority: value,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="A">A - High</SelectItem>
                                  <SelectItem value="B">B - Medium</SelectItem>
                                  <SelectItem value="C">C - Low</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge className={getPriorityColor(ingredient.priority)}>
                                {ingredient.priority}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {editingIngredient?.id === ingredient.id ? (
                              <Input
                                value={editingIngredient.notes}
                                onChange={(e) =>
                                  setEditingIngredient({
                                    ...editingIngredient,
                                    notes: e.target.value,
                                  })
                                }
                              />
                            ) : (
                              ingredient.notes
                            )}
                          </TableCell>
                          <TableCell>
                            {editingIngredient?.id === ingredient.id ? (
                              <Input
                                type="number"
                                value={editingIngredient.estimated_time.toString()}
                                onChange={(e) =>
                                  setEditingIngredient({
                                    ...editingIngredient,
                                    estimated_time: parseInt(e.target.value) || 0,
                                  })
                                }
                              />
                            ) : (
                              `${ingredient.estimated_time} min`
                            )}
                          </TableCell>
                          <TableCell>
                            {editingIngredient?.id === ingredient.id ? (
                              <Select
                                value={editingIngredient.menu_relevance ? "true" : "false"}
                                onValueChange={(value) =>
                                  setEditingIngredient({
                                    ...editingIngredient,
                                    menu_relevance: value === "true",
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="true">Yes</SelectItem>
                                  <SelectItem value="false">No</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              ingredient.menu_relevance ? "Yes" : "No"
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {editingIngredient?.id === ingredient.id ? (
                              <div className="flex justify-end gap-2">
                                <Button size="sm" onClick={handleSaveEdit}>
                                  Save
                                </Button>
                                <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditIngredient(ingredient)}
                                >
                                  Edit
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="destructive">
                                      <Trash2 size={16} />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete {ingredient.name}.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteIngredient(ingredient.id)}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
  
              {/* Cards View */}
              <TabsContent value="cards" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredIngredients.map((ingredient) => (
                    <Card key={ingredient.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle>{ingredient.name}</CardTitle>
                          <Badge className={getPriorityColor(ingredient.priority)}>
                            Priority {ingredient.priority}
                          </Badge>
                        </div>
                        <CardDescription>{ingredient.category}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">PAR Level:</span>
                            <span>{ingredient.parLevel} {ingredient.unit}</span>
                          </div>
                          {ingredient.notes && (
                            <div className="text-sm text-gray-500">
                              <span className="font-medium">Notes:</span> {ingredient.notes}
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Est. Time:</span>
                            <span>{ingredient.estimated_time} min</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Menu Relevant:</span>
                            <span>{ingredient.menu_relevance ? "Yes" : "No"}</span>
                          </div>
                          <div className="flex justify-end gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditIngredient(ingredient)}
                            >
                              Edit
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <Trash2 size={16} />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete {ingredient.name}.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteIngredient(ingredient.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
};

export default PARManagement;