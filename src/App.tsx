import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ExpenseProvider } from "@/contexts/ExpenseContext";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import MonthlyView from "./pages/MonthlyView";
import AddEditExpense from "./pages/AddEditExpense";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <ExpenseProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/months" element={<MonthlyView />} />
                <Route path="/add" element={<AddEditExpense />} />
                <Route path="/edit/:year/:month" element={<AddEditExpense />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </ExpenseProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
