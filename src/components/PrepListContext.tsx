import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getAutoPriority } from "@/lib/priority";
import { v4 as uuidv4 } from "uuid";

export interface PrepItem {
  id?: string;
  item_id: string;
  name: string;
  category: string;
  par_level: number;
  unit: string;
  priority: string;
  notes?: string;
  estimated_time: number;
  quantity: number; // número de receitas
  recipe_yield?: number; // quanto cada receita rende em unidade
  completed: boolean;
  date: string;
}

interface PrepListContextType {
  prepList: PrepItem[];
  isLoading: boolean;
  error: string | null;
  markItemCompleted: (id: string, completed: boolean) => void;
  refreshPrepList: (forceRefresh?: boolean) => Promise<void>;
  prepStartTime: Date | null;
  prepEndTime: Date | null;
  setPrepStartTime: (time: Date | null) => void;
  setPrepEndTime: (time: Date | null) => void;
  saveCompletedPrepItems: () => Promise<void>;
}

const PrepListContext = createContext<PrepListContextType>({
  prepList: [],
  isLoading: false,
  error: null,
  markItemCompleted: () => {},
  refreshPrepList: async () => {},
  prepStartTime: null,
  prepEndTime: null,
  setPrepStartTime: () => {},
  setPrepEndTime: () => {},
  saveCompletedPrepItems: async () => {},
});

export const usePrepList = () => useContext(PrepListContext);

export const PrepListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prepList, setPrepList] = useState<PrepItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prepStartTime, setPrepStartTime] = useState<Date | null>(null);
  const [prepEndTime, setPrepEndTime] = useState<Date | null>(null);

  const markItemCompleted = (id: string, completed: boolean) => {
    setPrepList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed } : item))
    );
  };

  const saveCompletedPrepItems = async () => {
    const updates = prepList.map((item) =>
      supabase
        .from("prep_list")
        .update({ completed: item.completed })
        .eq("id", item.id!.toString())
    );

    const inventoryUpdates = prepList
      .filter((item) => item.completed)
      .map((item) =>
        supabase.rpc("increment_stock_quantity", {
          item_id_input: item.item_id,
          quantity_to_add: item.quantity * (item.recipe_yield || 1),
        })
      );

    try {
      await Promise.all([...updates, ...inventoryUpdates]);
      console.log("✅ Completed items saved and inventory updated");

      setPrepList((prev) => prev.filter((item) => !item.completed));
    } catch (error) {
      console.error("❌ Error saving completed prep items:", error);
    }
  };

  const fetchGeneratedPrepList = async (forceRefresh = false) => {
    setIsLoading(true);
    const today = new Date().toISOString().split("T")[0];

    const { data: existingPrepList, error: existingError } = await supabase
      .from("prep_list")
      .select("*")
      .eq("date", today);

    if (existingError) {
      console.error("❌ Error checking prep_list:", existingError.message);
      setError(existingError.message);
      setIsLoading(false);
      return;
    }

    if (!forceRefresh && existingPrepList && existingPrepList.length > 0) {
      const incompleteOnly = existingPrepList.filter((item) => !item.completed);
      setPrepList(incompleteOnly);
      setIsLoading(false);
      return;
    }

    if (forceRefresh && existingPrepList && existingPrepList.length > 0) {
      const idsToDelete = existingPrepList.map((item) => item.id);
      const { error: deleteError } = await supabase
        .from("prep_list")
        .delete()
        .in("id", idsToDelete);

      if (deleteError) {
        console.error("❌ Error deleting existing prep_list:", deleteError.message);
        setError(deleteError.message);
        setIsLoading(false);
        return;
      }
    }

    const { data: itemsData, error: itemsError } = await supabase.from("items").select("*");
    const { data: stockData, error: stockError } = await supabase.from("stock").select("*");

    if (itemsError || stockError) {
      setError(itemsError?.message || stockError?.message || "Error fetching items/stock");
      setIsLoading(false);
      return;
    }

    const stockMap = new Map();
    stockData?.forEach((s) => stockMap.set(s.item_id, Number(s.quantity) || 0));

    const generatedList = (itemsData || [])
      .filter((item) => {
        const stockQty = Number(stockMap.get(item.id)) || 0;
        const parLevel = Number(item.par_level) || 0;
        return stockQty < parLevel;
      })
      .map((item) => {
        const stockQty = Number(stockMap.get(item.id)) || 0;

        const autoPriority = getAutoPriority({
          currentQty: stockQty,
          parLevel: item.par_level,
          menu_relevance: item.menu_relevance,
          estimated_time: item.estimated_time,
          needsFryer: item.needs_fryer || false,
          name: item.name,
          isLunchItem: item.is_lunch_item || false,
        });

        return {
          id: uuidv4(),
          item_id: item.id,
          name: item.name,
          category: item.category,
          par_level: item.par_level,
          unit: item.unit,
          priority: autoPriority,
          notes: item.notes || "",
          estimated_time: item.estimated_time || 15,
          quantity: Number(item.default_recipe_qty || 0),
          recipe_yield: Number(item.recipe_yield) || 1,
          completed: false,
          date: today,
        };
      });

    if (generatedList.length > 0) {
      const { error: insertError } = await supabase
        .from("prep_list")
        .upsert(generatedList, { onConflict: ["date", "item_id"] });

      if (insertError) {
        console.error("❌ Error inserting new prep list:", insertError.message);
        setError(insertError.message);
        setIsLoading(false);
        return;
      }
    }

    setPrepList(generatedList);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchGeneratedPrepList();
  }, []);

  return (
    <PrepListContext.Provider
      value={{
        prepList,
        isLoading,
        error,
        markItemCompleted,
        refreshPrepList: fetchGeneratedPrepList,
        prepStartTime,
        prepEndTime,
        setPrepStartTime,
        setPrepEndTime,
        saveCompletedPrepItems,
      }}
    >
      {children}
    </PrepListContext.Provider>
  );
};
