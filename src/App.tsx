// Main App component - v6 - with theme support
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { ExpenseProvider } from "@/contexts/ExpenseContext";
import { HabitProvider } from "@/contexts/HabitContext";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import MonthlyView from "./pages/MonthlyView";
import AddEditExpense from "./pages/AddEditExpense";
import HabitsDashboard from "./pages/HabitsDashboard";
import AddHabit from "./pages/AddHabit";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <BrowserRouter>
            <ExpenseProvider>
              <HabitProvider>
                <Toaster />
                <Sonner />
                <Layout>
                  <Routes>
                    {/* Expense routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/months" element={<MonthlyView />} />
                    <Route path="/add" element={<AddEditExpense />} />
                    <Route path="/edit/:year/:month" element={<AddEditExpense />} />
                    
                    {/* Habit routes */}
                    <Route path="/habits" element={<HabitsDashboard />} />
                    <Route path="/habits/add" element={<AddHabit />} />
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </HabitProvider>
            </ExpenseProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
