import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Dashboard from "./Dashboard";
import InventoryForm from "./InventoryForm";
import PARManagement from "./PARManagement";
import PrepListDisplay from "./PrepListDisplay";
import { motion } from "framer-motion";
import Tutorial from "./Tutorial";
import QuickStartGuide from "./QuickStartGuide";
import Charts from "./Charts";
import { supabase } from "@/lib/supabaseClient";
import Recipes from "./Recipes";

const Home = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error.message);
      } else {
        setUser(data.user);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("restaurant_id");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 🔶 Header */}
      <header className="bg-gerald-header text-gray-800 p-4 shadow-lg">

        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
          <motion.div
  animate={{ rotate: [-10, 10] }}
  transition={{
    repeat: Infinity,
    repeatType: "reverse", // ✅ smooth back and forth
    duration: 3, // slower wave
    ease: "easeInOut",
  }}
  className="w-20 h-20 flex items-center justify-center"
>
  <img
    src="/ChefsHat.png"
    alt="Chef's Hat"
    className="w-20 h-20 object-contain"
  />
</motion.div>


            <div>
            <h1 className="text-2xl font-bold text-slate-900">Gerald's Kitchen</h1>
              <p className="text-slate-900/80 text-sm">Prep Management System</p>
            </div>
          </div>

          {loading ? (
            <span className="text-slate-900/80 text-sm">Loading...</span>
          ) : user ? (
            <div className="flex items-center gap-4">
              <span className="text-slate-900/80 text-sm">
                Welcome, {user.email}
              </span>
              <Button
  onClick={handleLogout}
  className="bg-slate-900 text-white hover:bg-slate-800 hover:text-white px-4 py-2 rounded-md"
>
  Logout
</Button>
            </div>
          ) : (
            <span className="text-slate-900/80 text-sm">Not logged in</span>
          )}
        </div>
      </header>

      {/* 🔧 Main Content */}
      <div className="p-4 md:p-8">
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="relative w-48 h-48 flex-shrink-0">
                <img
                  src="/chefgeraldfullbody.png"
                  alt="Gerald the Mouse"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  Welcome to Gerald's Prep List Generator!
                </h2>
                <p className="text-muted-foreground mb-4">
                  Compare your current inventory to PAR levels and generate
                  prioritized prep lists for your kitchen. Gerald will help you
                  stay organized and efficient throughout your shift.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Tutorial />
                  <QuickStartGuide />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid grid-cols-6 mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="par">PAR Levels</TabsTrigger>
            <TabsTrigger value="prep">Prep Lists</TabsTrigger>
            <TabsTrigger value="charts">Charts View</TabsTrigger>
            <TabsTrigger value="recipes">Recipes</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="bg-background">
            <Dashboard />
          </TabsContent>

          <TabsContent value="inventory" className="bg-background">
            <InventoryForm />
          </TabsContent>

          <TabsContent value="par" className="bg-background">
            <PARManagement />
          </TabsContent>

          <TabsContent value="prep" className="bg-background">
            <PrepListDisplay />
          </TabsContent>

          <TabsContent value="charts" className="bg-background">
            <Charts />
          </TabsContent>

          <TabsContent value="recipes" className="bg-background">
            <Recipes />
          </TabsContent>
        </Tabs>

        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Gerald's Prep List Generator. All rights
            reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Home;


