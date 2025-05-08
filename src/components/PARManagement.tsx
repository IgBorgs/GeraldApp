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
}

const PARManagement = () => {
  const [ingredients, setIngredients] = useState<IngredientPAR[]>([
    {
      id: "1",
      name: "Chicken Breast",
      category: "Protein",
      parLevel: 20,
      unit: "lbs",
      priority: "A",
      notes: "Main dinner protein",
    },
    {
      id: "2",
      name: "Romaine Lettuce",
      category: "Produce",
      parLevel: 15,
      unit: "heads",
      priority: "B",
      notes: "For salads and wraps",
    },
    {
      id: "3",
      name: "Tomatoes",
      category: "Produce",
      parLevel: 25,
      unit: "lbs",
      priority: "B",
      notes: "For salads and sandwiches",
    },
    {
      id: "4",
      name: "Flour",
      category: "Dry Goods",
      parLevel: 50,
      unit: "lbs",
      priority: "C",
      notes: "For baking and sauces",
    },
    {
      id: "5",
      name: "Heavy Cream",
      category: "Dairy",
      parLevel: 8,
      unit: "qts",
      priority: "A",
      notes: "For sauces and desserts",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [editingIngredient, setEditingIngredient] =
    useState<IngredientPAR | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newIngredient, setNewIngredient] = useState<Partial<IngredientPAR>>({
    name: "",
    category: "Protein",
    parLevel: 0,
    unit: "lbs",
    priority: "B",
    notes: "",
  });

  const categories = [
    "All",
    "Protein",
    "Produce",
    "Dairy",
    "Dry Goods",
    "Spices",
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

  const handleEditIngredient = (ingredient: IngredientPAR) => {
    setEditingIngredient({ ...ingredient });
  };

  const handleSaveEdit = () => {
    if (editingIngredient) {
      setIngredients(
        ingredients.map((ing) =>
          ing.id === editingIngredient.id ? editingIngredient : ing,
        ),
      );
      setEditingIngredient(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingIngredient(null);
  };

  const handleAddIngredient = () => {
    const newId = (ingredients.length + 1).toString();
    const ingredientToAdd = {
      ...newIngredient,
      id: newId,
      priority: (newIngredient.priority || "B") as "A" | "B" | "C",
      parLevel: Number(newIngredient.parLevel) || 0,
    } as IngredientPAR;

    setIngredients([...ingredients, ingredientToAdd]);
    setShowAddDialog(false);
    setNewIngredient({
      name: "",
      category: "Protein",
      parLevel: 0,
      unit: "lbs",
      priority: "B",
      notes: "",
    });
  };

  const handleDeleteIngredient = (id: string) => {
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
    <div className="bg-white p-6 rounded-lg shadow-sm w-full">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            PAR Level Management
          </CardTitle>
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
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
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
                <AlertDialog
                  open={showAddDialog}
                  onOpenChange={setShowAddDialog}
                >
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
                        Enter the details for the new ingredient and its PAR
                        level.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label className="text-right text-sm">Name</label>
                        <Input
                          className="col-span-3"
                          value={newIngredient.name}
                          onChange={(e) =>
                            setNewIngredient({
                              ...newIngredient,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label className="text-right text-sm">Category</label>
                        <Select
                          value={newIngredient.category}
                          onValueChange={(value) =>
                            setNewIngredient({
                              ...newIngredient,
                              category: value,
                            })
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories
                              .filter((c) => c !== "All")
                              .map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label className="text-right text-sm">PAR Level</label>
                        <Input
                          className="col-span-3"
                          type="number"
                          value={newIngredient.parLevel?.toString() || "0"}
                          onChange={(e) =>
                            setNewIngredient({
                              ...newIngredient,
                              parLevel: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label className="text-right text-sm">Unit</label>
                        <Input
                          className="col-span-3"
                          value={newIngredient.unit}
                          onChange={(e) =>
                            setNewIngredient({
                              ...newIngredient,
                              unit: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label className="text-right text-sm">Priority</label>
                        <Select
                          value={newIngredient.priority}
                          onValueChange={(value: "A" | "B" | "C") =>
                            setNewIngredient({
                              ...newIngredient,
                              priority: value,
                            })
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">A - High</SelectItem>
                            <SelectItem value="B">B - Medium</SelectItem>
                            <SelectItem value="C">C - Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label className="text-right text-sm">Notes</label>
                        <Input
                          className="col-span-3"
                          value={newIngredient.notes}
                          onChange={(e) =>
                            setNewIngredient({
                              ...newIngredient,
                              notes: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleAddIngredient}>
                        Add Ingredient
                      </AlertDialogAction>
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
                                  {categories
                                    .filter((c) => c !== "All")
                                    .map((category) => (
                                      <SelectItem
                                        key={category}
                                        value={category}
                                      >
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
                              <Badge
                                className={getPriorityColor(
                                  ingredient.priority,
                                )}
                              >
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
                          <TableCell className="text-right">
                            {editingIngredient?.id === ingredient.id ? (
                              <div className="flex justify-end gap-2">
                                <Button size="sm" onClick={handleSaveEdit}>
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelEdit}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleEditIngredient(ingredient)
                                  }
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
                                      <AlertDialogTitle>
                                        Are you sure?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete{" "}
                                        {ingredient.name} from your PAR levels.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDeleteIngredient(ingredient.id)
                                        }
                                      >
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
              <TabsContent value="cards" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredIngredients.map((ingredient) => (
                    <Card key={ingredient.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle>{ingredient.name}</CardTitle>
                          <Badge
                            className={getPriorityColor(ingredient.priority)}
                          >
                            Priority {ingredient.priority}
                          </Badge>
                        </div>
                        <CardDescription>{ingredient.category}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">
                              PAR Level:
                            </span>
                            <span>
                              {ingredient.parLevel} {ingredient.unit}
                            </span>
                          </div>
                          {ingredient.notes && (
                            <div className="text-sm text-gray-500">
                              <span className="font-medium">Notes:</span>{" "}
                              {ingredient.notes}
                            </div>
                          )}
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
                                  <AlertDialogTitle>
                                    Are you sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete{" "}
                                    {ingredient.name} from your PAR levels.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteIngredient(ingredient.id)
                                    }
                                  >
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

            <div className="flex justify-end mt-4">
              <Button className="flex items-center gap-2">
                <Save size={16} />
                Save All Changes
              </Button>
            </div>

            <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-md mt-4">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              <p className="text-sm text-blue-700">
                PAR levels determine what appears on prep lists. Priority A
                items will be prepared first, followed by B and C.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PARManagement;
