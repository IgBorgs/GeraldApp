import React from "react";

const LoadingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="text-center">
        {/* Logo instead of ChefHat */}
        <div className="flex items-center justify-center mb-6 animate-pulse">
          <img
            src="/LogoNoBackground.png"
            alt="Gerald's Kitchen Logo"
            className="h-28 w-28 object-contain"
          />
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Gerald's Kitchen
        </h1>

        {/* Loading dots */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-3 h-3 bg-[#8B5E3C] rounded-full animate-bounce"></div>
          <div
            className="w-3 h-3 bg-[#8B5E3C] rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-3 h-3 bg-[#8B5E3C] rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>

        <p className="text-gray-600">
          Loading your kitchen management system...
        </p>
      </div>
    </div>
  );
};

export default LoadingPage;
