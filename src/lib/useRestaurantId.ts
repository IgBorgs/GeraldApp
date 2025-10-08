import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export const useRestaurantId = () => {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user?.id) {
        setRestaurantId(data.user.id);
      }
    };
    fetchUser();
  }, []);

  return restaurantId;
};
