import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/Home"; 
import routes from "tempo-routes";
import { ThemeProvider } from "./components/theme-provider";
import PARManagement from "./components/PARManagement";
import PrepListDisplay from "./components/PrepListDisplay";
import InventoryForm from "./components/InventoryForm";
import LoadingScreen from "./components/LoadingScreen";
import { PrepListProvider } from "./components/PrepListContext";


function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="gerald-prep-theme">
      <PrepListProvider>
        <Suspense fallback={<p>Loading...</p>}>
          <>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/par-management" element={<PARManagement />} />
              <Route path="/prep" element={<PrepListDisplay />} />
              <Route path="/inventory" element={<InventoryForm />} />
            </Routes>
          </>
        </Suspense>
      </PrepListProvider>
    </ThemeProvider>
  );
}

export default App;
