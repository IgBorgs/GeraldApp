import React from "react";
import ItemsList from "../../lib/src/components/ItemsList";

export default function Home() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gerald Daily Prep</h1>
      <ItemsList />
    </div>
  );
}
