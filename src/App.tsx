import { Suspense, useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/HomeComponent";
import PARManagement from "./components/PARManagement";
import PrepListDisplay from "./components/PrepListDisplay";
import InventoryForm from "./components/InventoryForm";
import LoadingScreen from "./components/LoadingScreen";
import LoginPage from "@/pages/LoginPage";
import Recipes from "./components/Recipes"; 

import { ThemeProvider } from "./components/theme-provider";
import { PrepListProvider } from "./components/PrepListContext";
import { supabase } from "@/lib/supabaseClient";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <ThemeProvider defaultTheme="system" storageKey="gerald-prep-theme">
      <PrepListProvider>
        <Suspense fallback={<p>Loading...</p>}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={!session ? <LoginPage onLogin={() => {}} /> : <Navigate to="/" />} />


            {/* Protected routes */}
            <Route
              path="/"
              element={session ? <Home /> : <Navigate to="/login" />}
            />
            <Route
              path="/par-management"
              element={session ? <PARManagement /> : <Navigate to="/login" />}
            />
            <Route
              path="/prep"
              element={session ? <PrepListDisplay /> : <Navigate to="/login" />}
            />
            <Route
              path="/inventory"
              element={session ? <InventoryForm /> : <Navigate to="/login" />}
            />
            <Route
              path="/recipes"
              element={session ? <Recipes /> : <Navigate to="/login" />}
            />
          </Routes>
        </Suspense>
      </PrepListProvider>
    </ThemeProvider>
  );
}

export default App;

