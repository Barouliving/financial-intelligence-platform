import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/hooks/use-auth";

// Pages (direct imports)
import Home from "@/pages/home";
import Product from "@/pages/product";
import AI from "@/pages/ai";
import Pricing from "@/pages/pricing";
import Dashboard from "@/pages/dashboard";
import Demo from "@/pages/demo";
import Bookkeeping from "@/pages/bookkeeping";
import Finance from "@/pages/finance";
import NotFound from "@/pages/not-found";

// Define types for route components
type ComponentType = () => JSX.Element;

function AppRouter() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        <Switch>
          {/* All routes accessible without auth */}
          <Route path="/product" component={Product} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/demo" component={Demo} />
          <Route path="/ai" component={AI} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/bookkeeping" component={Bookkeeping} />
          <Route path="/finance" component={Finance} />
          
          {/* Home route */}
          <Route path="/" component={Home} />
          
          {/* Fallback route */}
          <Route component={NotFound} />
        </Switch>
      </main>
      
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRouter />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
