import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getAutoPriority } from "@/lib/priority";
import { v4 as uuidv4 } from "uuid"; // ✅ install with: npm install uuid

export interface PrepItem {
  id: string; // this is the UUID for the prep_list entry
  item_id: string;
  name: string;
  category: string;
  par_level: number;
  unit: string;
  priority: string;
  notes?: string;
  estimated_time: number;
  quantity: number;
  needed_quantity: number;
  completed: boolean;
  date: string;
}

interface PrepListContextType {
  prepList: PrepItem[];
  isLoading: boolean;
  error: string | null;
}

const PrepListContext = createContext<PrepListContextType>({
  prepList: [],
  isLoading: false,
  error: null,
});

export const usePrepList = () => useContext(PrepListContext);

export const PrepListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prepList, setPrepList] = useState<PrepItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGeneratedPrepList = async () => {
      setIsLoading(true);
      const today = new Date().toISOString().split("T")[0];

      // 1. Check if today's prep list already exists in Supabase
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

      if (existingPrepList && existingPrepList.length > 0) {
        console.log("📦 Using existing prep_list from Supabase");
        setPrepList(existingPrepList);
        setIsLoading(false);
        return;
      }

      // 2. Generate fresh list
      const { data: itemsData, error: itemsError } = await supabase.from("items").select("*");
      const { data: stockData, error: stockError } = await supabase.from("stock").select("*");

      if (itemsError || stockError) {
        setError(itemsError?.message || stockError?.message || "Error fetching items/stock");
        setIsLoading(false);
        return;
      }

      const stockMap = new Map();
      stockData?.forEach((s) => stockMap.set(s.item_id, Number(s.quantity) || 0));

      const fullList = (itemsData || []).map((item) => {
        const stockQty = Number(stockMap.get(item.id)) || 0;
        const par = Number(item.par_level) || 0;
        const neededQty = Math.max(par - stockQty, 0);
      
        const autoPriority = getAutoPriority({
          currentQty: stockQty,
          parLevel: par,
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
          par_level: par,
          unit: item.unit,
          priority: autoPriority,
          notes: item.notes || "",
          estimated_time: item.estimated_time || 15,
          quantity: stockQty,
          needed_quantity: neededQty,
          completed: false,
          date: today,
        };
      });
      
      const generatedList = fullList.filter((i) => {
        const result = Number(i.needed_quantity) > 0;
        if (!result) console.log("❌ Skipping item (not needed):", i.name, "| Needed:", i.needed_quantity);
        return result;
      });
      
      console.log("🧾 Inserting today's filtered prep list:", generatedList);
      

      // 3. Log and insert into Supabase
      console.log("🧾 Inserting today's prep list:", generatedList);

      if (generatedList.length > 0) {
        const { error: insertError, data: insertData } = await supabase
          .from("prep_list")
          .insert(generatedList);

        console.log("📥 Insert result:", insertData, insertError);

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

    fetchGeneratedPrepList();
  }, []);

  return (
    <PrepListContext.Provider value={{ prepList, isLoading, error }}>
      {children}
    </PrepListContext.Provider>
  );
};
