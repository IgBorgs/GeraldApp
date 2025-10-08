import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Upload,
  Plus,
  Download,
  FileText,
  ChefHat,
  Camera,
  X,
  Search,
  Eye,
  Clock,
  Users,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
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
  


interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  instructions: string;
  servings: number;
  prepTime: string;
  cookTime: string;
  category: string;
  image?: string; // Base64 encoded image or URL
  createdAt: Date;
}

const Recipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([
    {
      id: "1",
      name: "Classic Marinara Sauce",
      ingredients: [
        "2 cans crushed tomatoes",
        "4 cloves garlic, minced",
        "1 medium onion, diced",
        "2 tbsp olive oil",
        "1 tsp dried basil",
        "1 tsp dried oregano",
        "Salt and pepper to taste",
      ],
      instructions:
        "Heat olive oil in a large pan over medium heat. Sauté onion until translucent, about 5 minutes. Add minced garlic and cook for another minute until fragrant. Add crushed tomatoes, basil, oregano, salt, and pepper. Bring to a simmer and reduce heat to low. Let the sauce simmer for 20-30 minutes, stirring occasionally, until it thickens to your desired consistency. Taste and adjust seasonings as needed. Serve immediately or store in refrigerator for up to 1 week.",
      servings: 6,
      prepTime: "10 minutes",
      cookTime: "30 minutes",
      category: "Sauce",
      image: "", // 👈 no image here, will trigger "No image"
      createdAt: new Date(),
    },
    {
      id: "2",
      name: "Herb-Crusted Chicken Breast",
      ingredients: [
        "4 chicken breasts",
        "2 tbsp fresh rosemary, chopped",
        "2 tbsp fresh thyme",
        "3 cloves garlic, minced",
        "1/4 cup olive oil",
        "1 cup breadcrumbs",
        "Salt and pepper",
      ],
      instructions:
        "Preheat oven to 375°F (190°C). In a bowl, mix together chopped rosemary, thyme, minced garlic, and olive oil to create an herb paste. Season chicken breasts with salt and pepper on both sides. Rub the herb mixture all over the chicken breasts, ensuring even coverage. Press breadcrumbs onto the herb-coated chicken, creating a crust. Place on a baking sheet lined with parchment paper. Bake for 25-30 minutes or until internal temperature reaches 165°F (74°C). Let rest for 5 minutes before slicing. Serve with your favorite sides.",
      servings: 4,
      prepTime: "15 minutes",
      cookTime: "30 minutes",
      category: "Main Course",
      image:
        "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&q=80",
      createdAt: new Date(),
    },



  ]);

  const [newRecipe, setNewRecipe] = useState<Partial<Recipe>>({
    name: "",
    ingredients: [],
    instructions: "",
    servings: 4,
    prepTime: "",
    cookTime: "",
    category: "",
    image: "",
  });

  const [ingredientInput, setIngredientInput] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editRecipe, setEditRecipe] = useState<Partial<Recipe> | null>(null);

const startEditing = (recipe: Recipe) => {
  setEditRecipe({ ...recipe });
  setIsEditDialogOpen(true);
};

const updateRecipe = async () => {
    if (!editRecipe || !editRecipe.id) return;
  
    if (!editRecipe.name?.trim()) {
      alert("Please enter a recipe name.");
      return;
    }
  
    if (!editRecipe.ingredients || editRecipe.ingredients.length === 0) {
      alert("Please add at least one ingredient.");
      return;
    }
  
    if (!editRecipe.instructions?.trim()) {
      alert("Please enter the cooking instructions.");
      return;
    }
  
    if (!restaurantId) {
      alert("No restaurant found for this user.");
      return;
    }
  
    console.log("➡️ Updating with values:", {
        id: editRecipe.id,
        restaurantId,
        fullRecipe: editRecipe,
      });
      
  
    const { data, error } = await supabase
      .from("recipes")
      .update({
        name: editRecipe.name,
        ingredients: editRecipe.ingredients,
        instructions: editRecipe.instructions,
        servings: editRecipe.servings,
        prep_time: editRecipe.prepTime,
        cook_time: editRecipe.cookTime,
        category: editRecipe.category,
        image: editRecipe.image,
      })
      .eq("id", editRecipe.id)
      .eq("restaurant_id", restaurantId)
      .select(); // return the updated rows
  
    if (error) {
      console.error("❌ Error updating recipe:", error);
      alert("Failed to update recipe.");
      return;
    }
  
    if (!data || data.length === 0) {
      console.warn("⚠️ No rows updated. Check if restaurant_id and id match.");
      alert("No recipe was updated. Please check your recipe ID / policies.");
      return;
    }
  
    console.log("✅ Recipe updated:", data[0]);
  
    // Update local state so UI reflects change immediately
    setRecipes((prev) =>
      prev.map((r) => (r.id === editRecipe.id ? { ...r, ...data[0] } : r))
    );
  
    setIsEditDialogOpen(false);
    setEditRecipe(null);
  };
  

  const deleteRecipe = (id: string) => {
    setRecipes((prev) => prev.filter((recipe) => recipe.id !== id));
  };
  


  useEffect(() => {
    const fetchRestaurantId = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
  
      if (!user) return;
  
      const { data, error } = await supabase
        .from("restaurants")
        .select("id")
        .eq("owner_id", user.id)
        .single();
  
      if (error || !data) {
        console.error("Error fetching restaurant ID:", error);
        return;
      }
  
      setRestaurantId(data.id);
      fetchRecipesFromSupabase(data.id);
    };
  
    fetchRestaurantId();
  }, []);

  const fetchRecipesFromSupabase = async (restId: string) => {
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("restaurant_id", restId)
      .order("created_at", { ascending: false });
  
    if (error) {
      console.error("Error fetching recipes:", error);
      return;
    }
  
    const formatted: Recipe[] = data.map((r) => ({
        id: r.id,
        name: r.name,
        ingredients: r.ingredients || [], // Already an array now
        instructions: r.instructions,
        servings: r.servings,
        prepTime: r.prep_time || "",
        cookTime: r.cook_time || "",
        category: r.category || "Custom",
        image: r.image || "",
        createdAt: new Date(r.created_at),
      }));
  
    console.log("Formatted recipes from Supabase:", formatted);
  
    setRecipes((prev) => {
      const exampleRecipes = prev.filter((r) => r.id === "1" || r.id === "2");
      const merged = [...formatted, ...exampleRecipes];
      console.log("Final merged recipes:", merged);
      return merged;
    });
  };
  
  
  
  


  // Filter recipes based on search query
  const filteredRecipes = recipes.filter(
    (recipe) =>
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.ingredients.some((ingredient) =>
        ingredient.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setNewRecipe((prev) => ({
          ...prev,
          image: result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setNewRecipe((prev) => ({
      ...prev,
      image: "",
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target?.result as string; // ✅ renamed from "content"
        try {
          const uploadedRecipe = JSON.parse(fileContent);
          const recipe: Recipe = {
            id: Date.now().toString(),
            ...uploadedRecipe,
            createdAt: new Date(),
          };
          setRecipes((prev) => [...prev, recipe]);
        } catch {
          const recipe: Recipe = {
            id: Date.now().toString(),
            name: file.name.replace(/\.[^/.]+$/, ""),
            ingredients: fileContent
              .split("\n")
              .filter((line) => line.trim().startsWith("-"))
              .map((line) => line.replace("-", "").trim()),
            instructions: fileContent,
            servings: 4,
            prepTime: "Unknown",
            cookTime: "Unknown",
            category: "Uploaded",
            createdAt: new Date(),
          };
          setRecipes((prev) => [...prev, recipe]);
        }
      };
      reader.readAsText(file);
    }
  };

  const addIngredient = () => {
    if (ingredientInput.trim()) {
      setNewRecipe((prev) => ({
        ...prev,
        ingredients: [...(prev.ingredients || []), ingredientInput.trim()],
      }));
      setIngredientInput("");
    }
  };

  const removeIngredient = (index: number) => {
    setNewRecipe((prev) => ({
      ...prev,
      ingredients: prev.ingredients?.filter((_, i) => i !== index) || [],
    }));
  };

  const createRecipe = async () => {
    console.log("[createRecipe] Clicked", { newRecipe, restaurantId });
  
    // Prevent double-clicks
    if (isSubmitting) return;
    setIsSubmitting(true);
  
    try {
      if (!newRecipe.name?.trim()) {
        alert("Please enter a recipe name.");
        return;
      }
  
      if (!newRecipe.ingredients || newRecipe.ingredients.length === 0) {
        alert("Please add at least one ingredient.");
        return;
      }
  
      if (!newRecipe.instructions?.trim()) {
        alert("Please enter the cooking instructions.");
        return;
      }
  
      if (!restaurantId) {
        alert(
          "No restaurant found for this user. Please make sure your account has a restaurant assigned (or create one), then try again."
        );
        return;
      }
  
      const { error } = await supabase.from("recipes").insert({
        restaurant_id: restaurantId,
        name: newRecipe.name,
        ingredients: newRecipe.ingredients,
        instructions: newRecipe.instructions,
        servings: newRecipe.servings || 4,
        prep_time: newRecipe.prepTime || "",
        cook_time: newRecipe.cookTime || "",
        category: newRecipe.category || "Custom",
        image: newRecipe.image || "",
      });
  
      if (error) {
        console.error("Error saving recipe:", error);
        alert("Failed to save recipe. Open the console for details.");
        return;
      }
  
      // Reset the form
      setNewRecipe({
        name: "",
        ingredients: [],
        instructions: "",
        servings: 4,
        prepTime: "",
        cookTime: "",
        category: "",
        image: "",
      });
  
      setIsCreateDialogOpen(false);
  
      // Refresh the list
      fetchRecipesFromSupabase(restaurantId);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  

  const downloadRecipe = (recipe: Recipe) => {
    const fileContent = `${recipe.name}\n\nServings: ${recipe.servings}\nPrep Time: ${recipe.prepTime}\nCook Time: ${recipe.cookTime}\nCategory: ${recipe.category}\n\nIngredients:\n${recipe.ingredients
      .map((ing) => `- ${ing}`)
      .join("\n")}\n\nInstructions:\n${recipe.instructions}`;

    const blob = new Blob([fileContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${recipe.name
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const viewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="w-full h-full min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="flex flex-col mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Recipe Management</h1>
      </div>

      

      {/* Upload + Create */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Upload Recipe Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Recipe
            </CardTitle>
            <CardDescription>
              Upload a recipe file (JSON or text format)
            </CardDescription>
          </CardHeader>
          <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-black transition-colors">
              <input
                type="file"
                accept=".json,.txt,.md"
                onChange={handleFileUpload}
                className="hidden"
                id="recipe-upload"
              />
              <label htmlFor="recipe-upload" className="cursor-pointer">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-800 font-medium mb-2">
                  Click to upload recipe
                </p>
                <p className="text-sm text-gray-500">
                  Supports JSON, TXT, and MD files
                </p>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Create Recipe Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Recipe
            </CardTitle>
            <CardDescription>
              Create a custom recipe from scratch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="w-full h-20 text-lg">
                  <Plus className="h-6 w-6 mr-2" />
                  Create Recipe
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Recipe</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create your custom recipe
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Image Upload Section */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Recipe Image (Optional)
                    </label>
                    {newRecipe.image ? (
                      <div className="relative">
                        <img
                          src={newRecipe.image}
                          alt="Recipe preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-black transition-colors">

                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="recipe-image-upload"
                        />
                        <label
                          htmlFor="recipe-image-upload"
                          className="cursor-pointer"
                        >
                          <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600 font-medium mb-1">
                            Add Recipe Image
                          </p>
                          <p className="text-xs text-gray-500">
                            Click to upload (Max 5MB)
                          </p>
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Recipe Name
                      </label>
                      <Input
                        value={newRecipe.name || ""}
                        onChange={(e) =>
                          setNewRecipe((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Enter recipe name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Category
                      </label>
                      <Input
                        value={newRecipe.category || ""}
                        onChange={(e) =>
                          setNewRecipe((prev) => ({
                            ...prev,
                            category: e.target.value,
                          }))
                        }
                        placeholder="e.g., Main Course, Dessert"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Servings
                      </label>
                      <Input
                        type="number"
                        value={newRecipe.servings || 4}
                        onChange={(e) =>
                          setNewRecipe((prev) => ({
                            ...prev,
                            servings: parseInt(e.target.value),
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Prep Time
                      </label>
                      <Input
                        value={newRecipe.prepTime || ""}
                        onChange={(e) =>
                          setNewRecipe((prev) => ({
                            ...prev,
                            prepTime: e.target.value,
                          }))
                        }
                        placeholder="e.g., 15 minutes"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Cook Time
                      </label>
                      <Input
                        value={newRecipe.cookTime || ""}
                        onChange={(e) =>
                          setNewRecipe((prev) => ({
                            ...prev,
                            cookTime: e.target.value,
                          }))
                        }
                        placeholder="e.g., 30 minutes"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Ingredients
                    </label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={ingredientInput}
                        onChange={(e) => setIngredientInput(e.target.value)}
                        placeholder="Add an ingredient"
                        onKeyPress={(e) =>
                          e.key === "Enter" && addIngredient()
                        }
                      />
                      <Button onClick={addIngredient} size="sm">
                        Add
                      </Button>
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {newRecipe.ingredients?.map((ingredient, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-100 p-2 rounded"
                        >
                          <span className="text-sm">{ingredient}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeIngredient(index)}
                            className="h-6 w-6 p-0"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Instructions
                    </label>
                    <Textarea
                      value={newRecipe.instructions || ""}
                      onChange={(e) =>
                        setNewRecipe((prev) => ({
                          ...prev,
                          instructions: e.target.value,
                        }))
                      }
                      placeholder="Enter cooking instructions..."
                      rows={4}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <div className="flex justify-end gap-2">
  

                    <Button
                        type="button"
                        onClick={createRecipe}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Saving..." : "Create Recipe"}
                    </Button>
                    </div>

                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Recipe List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Your Recipes ({filteredRecipes.length})
          {searchQuery && (
            <span className="text-base font-normal text-gray-500 ml-2">
              - Filtered by "{searchQuery}"
            </span>
          )}
        </h2>

        {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search recipes by name, category, or ingredient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 border-gray-300 focus:border-black"
          />
        </div>
      </div>

        {filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchQuery
                ? "No recipes found matching your search."
                : "No recipes yet. Create your first recipe!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  {recipe.image ? (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={recipe.image}
                        alt={recipe.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center bg-gray-100 text-gray-500 text-sm italic">
                      No image
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{recipe.name}</CardTitle>
                    <CardDescription>
                      {recipe.category} • {recipe.servings} servings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        <p>
                          <strong>Prep:</strong> {recipe.prepTime}
                        </p>
                        <p>
                          <strong>Cook:</strong> {recipe.cookTime}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-1">
                          Ingredients ({recipe.ingredients.length}):
                        </p>
                        <div className="text-xs text-gray-600 max-h-20 overflow-y-auto">
                          {recipe.ingredients.slice(0, 3).map((ingredient, i) => (
                            <p key={i}>• {ingredient}</p>
                          ))}
                          {recipe.ingredients.length > 3 && (
                            <p className="italic">
                              ...and {recipe.ingredients.length - 3} more
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 flex gap-2">
  <Button
    onClick={() => viewRecipe(recipe)}
    variant="outline"
    className="w-full"
    size="sm"
  >
    <Eye className="h-4 w-4 mr-2" />
    View
  </Button>

  <Button
    onClick={() => downloadRecipe(recipe)}
    className="w-full"
    size="sm"
  >
    <Download className="h-4 w-4 mr-2" />
    Download
  </Button>

  <Button
    onClick={() => startEditing(recipe)}
    variant="secondary"
    className="w-full"
    size="sm"
  >
    ✏️ Edit
  </Button>

  
</div>


                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* View Recipe Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedRecipe && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {selectedRecipe.name}
                </DialogTitle>
                <DialogDescription className="text-lg">
                  {selectedRecipe.category}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Recipe Image */}
                {selectedRecipe.image ? (
                  <div className="w-full h-64 overflow-hidden rounded-lg">
                    <img
                      src={selectedRecipe.image}
                      alt={selectedRecipe.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-64 flex items-center justify-center bg-gray-100 text-gray-500 text-base italic rounded-lg">
                    No image available
                  </div>
                )}

                {/* Recipe Info */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-orange-50 rounded-lg">
                  <div className="text-center">
                    <Users className="h-5 w-5 mx-auto mb-1 text-orange-600" />
                    <p className="text-sm font-medium text-gray-800">
                      Servings
                    </p>
                    <p className="text-lg font-bold text-orange-600">
                      {selectedRecipe.servings}
                    </p>
                  </div>
                  <div className="text-center">
                    <Clock className="h-5 w-5 mx-auto mb-1 text-orange-600" />
                    <p className="text-sm font-medium text-gray-800">
                      Prep Time
                    </p>
                    <p className="text-lg font-bold text-orange-600">
                      {selectedRecipe.prepTime}
                    </p>
                  </div>
                  <div className="text-center">
                    <Clock className="h-5 w-5 mx-auto mb-1 text-orange-600" />
                    <p className="text-sm font-medium text-gray-800">
                      Cook Time
                    </p>
                    <p className="text-lg font-bold text-orange-600">
                      {selectedRecipe.cookTime}
                    </p>
                  </div>
                </div>

                {/* Ingredients */}
                <div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-800">
                        Ingredients
                    </h3>
                    <div className="bg-white border rounded-lg p-4 max-h-64 overflow-y-auto">
                        <ul className="space-y-2">
                        {selectedRecipe.ingredients.map((ingredient, index) => (
                            <li key={index} className="flex items-start gap-2">
                            <span className="text-orange-500 font-bold">•</span>
                            <span className="text-gray-700">{ingredient}</span>
                            </li>
                        ))}
                        </ul>
                    </div>
                    </div>


                {/* Instructions */}
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">
                    Instructions
                  </h3>
                <div className="bg-white border rounded-lg p-4 max-h-64 overflow-y-auto">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words break-all">
                        {selectedRecipe.instructions}
                    </p>
                </div>

                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => downloadRecipe(selectedRecipe)}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Recipe
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsViewDialogOpen(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
    {editRecipe && (
      <>
        <DialogHeader>
          <DialogTitle>Edit Recipe</DialogTitle>
          <DialogDescription>
            Update the recipe details and save changes
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Name + Category */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              value={editRecipe.name || ""}
              onChange={(e) =>
                setEditRecipe((prev) => ({ ...prev!, name: e.target.value }))
              }
              placeholder="Recipe name"
            />
            <Input
              value={editRecipe.category || ""}
              onChange={(e) =>
                setEditRecipe((prev) => ({
                  ...prev!,
                  category: e.target.value,
                }))
              }
              placeholder="Category"
            />
          </div>

          {/* Servings + Times */}
          <div className="grid grid-cols-3 gap-4">
            <Input
              type="number"
              value={editRecipe.servings || 4}
              onChange={(e) =>
                setEditRecipe((prev) => ({
                  ...prev!,
                  servings: parseInt(e.target.value),
                }))
              }
            />
            <Input
              value={editRecipe.prepTime || ""}
              onChange={(e) =>
                setEditRecipe((prev) => ({ ...prev!, prepTime: e.target.value }))
              }
              placeholder="Prep time"
            />
            <Input
              value={editRecipe.cookTime || ""}
              onChange={(e) =>
                setEditRecipe((prev) => ({ ...prev!, cookTime: e.target.value }))
              }
              placeholder="Cook time"
            />
          </div>

          {/* Ingredients */}
          <Textarea
            value={editRecipe.ingredients?.join("\n") || ""}
            onChange={(e) =>
              setEditRecipe((prev) => ({
                ...prev!,
                ingredients: e.target.value.split("\n"),
              }))
            }
            rows={4}
            placeholder="One ingredient per line"
          />

          {/* Instructions */}
          <Textarea
            value={editRecipe.instructions || ""}
            onChange={(e) =>
              setEditRecipe((prev) => ({
                ...prev!,
                instructions: e.target.value,
              }))
            }
            rows={6}
            placeholder="Instructions..."
          />

          {/* Buttons */}
<div className="flex justify-between items-center gap-2">
  {/* Delete confirmation dialog - stays on the left */}
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button variant="destructive">
        <Trash2 className="h-4 w-4 mr-2" />
        Delete Recipe
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to delete this recipe?  
          This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction
          className="bg-red-600 text-white hover:bg-red-700"
          onClick={() => {
            if (editRecipe?.id) {
              deleteRecipe(editRecipe.id);
              setIsEditDialogOpen(false);
            }
          }}
        >
          Yes, Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>

  {/* Cancel + Save buttons - on the right */}
  <div className="flex gap-2">
    <Button
      variant="outline"
      onClick={() => setIsEditDialogOpen(false)}
    >
      Cancel
    </Button>
    <Button onClick={updateRecipe}>Save Changes</Button>
  </div>
</div>


        </div>
      </>
    )}
  </DialogContent>
</Dialog>
    </div>
  );
};

export default Recipes;


