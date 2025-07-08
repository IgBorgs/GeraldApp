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
  }): "A" | "B" | "C" {
    const percent = (currentQty / parLevel) * 100;
    if (name.toLowerCase().includes("prime rib seasoning")) return "A";
    if (percent <= 30) return "A";
    if (needsFryer) return "A";
    if (estimated_time >= 90) return "A";
    if (isLunchItem) return "A";
    if (menu_relevance && percent <= 75) return "B";
    return "C";
  }
  
  export function getPriorityColor(priority: "A" | "B" | "C") {
    switch (priority) {
      case "A":
        return "bg-red-100 text-red-800 border-red-200";
      case "B":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "C":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "";
    }
  }
  