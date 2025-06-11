import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function ItemsList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItems() {
      const { data, error } = await supabase.from("items").select("*");
      if (error) {
        console.error("Error fetching items:", error.message);
      } else {
        setItems(data);
      }
      setLoading(false);
    }

    fetchItems();
  }, []);

  if (loading) return <p className="text-gray-500">Loading items...</p>;
  if (!items.length) return <p className="text-gray-500">No items found.</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Items</h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="p-4 bg-white shadow rounded-lg border border-gray-200"
          >
            <strong>{item.name}</strong> — Stock: {item.current_stock}
          </li>
        ))}
      </ul>
    </div>
  );
}
