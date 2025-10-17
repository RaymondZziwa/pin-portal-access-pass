
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PinAuth from "./components/PinAuth";
import PosPage from "./components/PosPage";
import NotFound from "./pages/NotFound";
import "primereact/resources/themes/lara-light-blue/theme.css";  
import "primereact/resources/primereact.min.css";             
import "primeicons/primeicons.css";                         
import RecentSales from "./components/recentSales";
import CreditSales from "./components/creditSales";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PinAuth />} />
          <Route path="/pos" element={<PosPage />} />
          <Route path="/recent-sales" element={<RecentSales />} />
          <Route path="/credit-sales" element={<CreditSales />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
