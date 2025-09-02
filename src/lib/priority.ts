export function getAutoPriority({
  currentQty,
  parLevel,
  menu_relevance,
  estimated_time,
  needsFryer,
  name,
  isLunchItem,
}: {
  currentQty: number;
  parLevel: number;
  menu_relevance: boolean;
  estimated_time: number;
  needsFryer: boolean;
  name: string;
  isLunchItem: boolean;
}): "A" | "B" | "C" | null {
  const LIMITE_C = 1.2; // 20% above PAR

  if (!Number.isFinite(parLevel) || parLevel <= 0) return null;

  // ❌ EXCLUDE items far above the PAR limit (not even shown)
  if (currentQty > parLevel * LIMITE_C) return null;

  // ✅ C: Slightly above PAR (up to 20% above)
  if (currentQty > parLevel && currentQty <= parLevel * LIMITE_C) {
    return "C";
  }

  // ✅ B: Exactly at PAR (1:1)
  if (currentQty === parLevel) {
    return "B";
  }

  // ✅ A or B: Below PAR
  if (currentQty < parLevel) {
    const percent = (currentQty / parLevel) * 100;

    if (name.toLowerCase().includes("prime rib seasoning")) return "A";
    if (percent <= 30) return "A";
    if (needsFryer) return "A";
    if (estimated_time >= 90) return "A";
    if (isLunchItem) return "A";

    if (menu_relevance && percent <= 75) return "B";
    return "B";
  }

  return null;
}

export function getPriorityColor(priority: "A" | "B" | "C") {
  switch (priority) {
    case "A":
      return [
        "border",
        "bg-red-100 text-red-800 border-red-200",
        "hover:!bg-red-200 hover:!text-red-900 hover:!border-red-300",
        "active:!bg-red-300 active:!text-red-950 active:!border-red-400",
        "transition-colors duration-150",
        "cursor-default select-none",
        "shadow-sm"
      ].join(" ");
    case "B":
      return [
        "border",
        "bg-yellow-100 text-yellow-800 border-yellow-200",
        "hover:!bg-yellow-200 hover:!text-yellow-900 hover:!border-yellow-300",
        "active:!bg-yellow-300 active:!text-yellow-950 active:!border-yellow-400",
        "transition-colors duration-150",
        "cursor-default select-none",
        "shadow-sm"
      ].join(" ");
    case "C":
      return [
        "border",
        "bg-green-100 text-green-800 border-green-200",
        "hover:!bg-green-200 hover:!text-green-900 hover:!border-green-300",
        "active:!bg-green-300 active:!text-green-950 active:!border-green-400",
        "transition-colors duration-150",
        "cursor-default select-none",
        "shadow-sm"
      ].join(" ");
    default:
      return "";
  }
}






