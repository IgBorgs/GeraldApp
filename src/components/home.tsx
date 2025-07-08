import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Dashboard from "./Dashboard";
import InventoryForm from "./InventoryForm";
import PARManagement from "./PARManagement";
import PrepListDisplay from "./PrepListDisplay";
import { motion } from "framer-motion";
import { ChefHat, Clipboard, Settings } from "lucide-react";
import Tutorial from "./Tutorial";
import QuickStartGuide from "./QuickStartGuide";
import Charts from "./Charts";


const Home = () => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <header className="flex md:flex-row items-center justify-between mb-8 gap-4 flex-row">
        <div className="flex items-center gap-3">
        <motion.div
          initial={{ rotate: -10 }}
          animate={{ rotate: 10 }}
          transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        <div className="w-16 h-16 md:w-20 md:h-20">
          <img
            src="/ChefsHat.png"
            alt="Chef Hat Logo"
            className="w-full h-full object-contain"
          />
        </div>
      </motion.div>


          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Gerald's Prep List
            </h1>
            <p className="text-muted-foreground">Kitchen Prep Management</p>
          </div>
        </div>
        
      </header>
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
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="par">PAR Levels</TabsTrigger>
          <TabsTrigger value="prep">Prep Lists</TabsTrigger>
          <TabsTrigger value="charts">Charts View</TabsTrigger>
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
      </Tabs>

      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} Gerald's Prep List Generator. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
};

export default Home;
