// src/components/LoadingScreen.tsx
import React from "react";

export default function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <img
        src="/spinner_arc1.gif"
        alt="Loading…"
        className="w-32 h-32 object-contain"
      />
    </div>
  );
}
