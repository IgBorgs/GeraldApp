import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getAutoPriority } from "@/lib/priority";

export interface PrepItem {
  id?: string;
  item_id: string;
  name: string;
  category: string;
  par_level: number;
  unit: string;
  priority: "A" | "B" | "C" | "D" | null;
  notes?: string;
  estimated_time: number;
  quantity: number;
  recipe_yield?: number;
  completed: boolean;
  date: string;
  
}


interface PrepListContextType {
  prepList: PrepItem[];
  setPrepList: React.Dispatch<React.SetStateAction<PrepItem[]>>;
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
  setPrepList: () => {},
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
      supabase.from("prep_list").update({ completed: item.completed }).eq("id", item.id!.toString())
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
    setError(null);

    const today = new Date().toISOString().split("T")[0];

    // 1) Load today's existing list (if any)
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

    // 2) Load active (non-deleted) items
    const { data: activeItems, error: itemsError } = await supabase
      .from("items")
      .select("*")
      .eq("is_deleted", false);

    if (itemsError) {
      console.error("❌ Error fetching active items:", itemsError.message);
      setError(itemsError.message);
      setIsLoading(false);
      return;
    }

    const activeItemIds = new Set(activeItems.map((item: any) => item.id));

    // 3) If forcing refresh, delete today's rows first
    if (forceRefresh && existingPrepList && existingPrepList.length > 0) {
      const idsToDelete = existingPrepList.map((row) => row.id);
      const { error: deleteError } = await supabase.from("prep_list").delete().in("id", idsToDelete);
      if (deleteError) {
        console.error("❌ Error deleting existing prep_list:", deleteError.message);
        setError(deleteError.message);
        setIsLoading(false);
        return;
      }
    }

    // 4) Load stock
    const { data: stockData, error: stockError } = await supabase.from("stock").select("*");
    if (stockError) {
      console.error("❌ Error fetching stock:", stockError.message);
      setError(stockError.message);
      setIsLoading(false);
      return;
    }

    const stockMap = new Map<string, number>();
    stockData?.forEach((s: any) => stockMap.set(s.item_id, Number(s.quantity) || 0));

    // 5) ALWAYS compute priority for all active items, then upsert the rows with priority !== null.
    //    This means equal-to-PAR (==) will be inserted as B/C even if a saved list exists.
    const toUpsert = activeItems
      .map((item: any) => {
        const stockQty = Number(stockMap.get(item.id)) || 0;
        const parLevel = Number(item.par_level) || 0;

        const autoPriority = getAutoPriority({
          currentQty: stockQty,
          parLevel,
          menu_relevance: !!item.menu_relevance,
          estimated_time: Number(item.estimated_time) || 15,
          needsFryer: !!item.needs_fryer,
          name: String(item.name || ""),
          isLunchItem: !!item.is_lunch_item,
        });

        if (autoPriority === null) return null;

// Exclude items where stock is far above PAR (e.g. > 1.2 * par)
if (autoPriority === "D") {
  const stockQty = Number(stockMap.get(item.id)) || 0;
  const parLevel = Number(item.par_level) || 0;
  const overstockLimit = parLevel * 1.2;

  if (stockQty > overstockLimit) {
    return null;
  }
}

        const defaultBatch = Number(item.default_recipe_qty || 0);

        const row: Omit<PrepItem, "id"> = {
          item_id: item.id,
          name: item.name,
          category: item.category,
          par_level: parLevel,
          unit: item.unit,
          priority: autoPriority,
          notes: item.notes || "",
          estimated_time: Number(item.estimated_time) || 15,
          quantity: defaultBatch,
          recipe_yield: Number(item.recipe_yield) || 1,
          completed: false,
          date: today,
          
        };
        
        return row;
      })
      .filter((x): x is Omit<PrepItem, "id"> => x !== null);

    if (toUpsert.length > 0) {
      const { error: insertError } = await supabase
        .from("prep_list")
        .upsert(toUpsert, { onConflict: ["date", "item_id"] });
      if (insertError) {
        console.error("❌ Error inserting new prep list:", insertError.message);
        setError(insertError.message);
        setIsLoading(false);
        return;
      }
    }

    // 6) Fetch fresh list (post-upsert), show only incomplete + still-active items
    const { data: freshList, error: freshErr } = await supabase
      .from("prep_list")
      .select("*")
      .eq("date", today);

    if (freshErr) {
      console.error("❌ Error fetching fresh prep_list:", freshErr.message);
      setError(freshErr.message);
      setIsLoading(false);
      return;
    }

    const filteredFresh = (freshList || []).filter(
      (row: any) => !row.completed && activeItemIds.has(row.item_id)
    ) as PrepItem[];

    setPrepList(filteredFresh);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchGeneratedPrepList();
  }, []);

  return (
    <PrepListContext.Provider
      value={{
        prepList,
        setPrepList,
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



