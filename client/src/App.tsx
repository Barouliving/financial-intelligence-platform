import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/hooks/use-auth";

// Pages (direct imports)
import Product from "@/pages/product";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";

// Define types for route components
type ComponentType = () => JSX.Element;

function AppRouter() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        <Switch>
          {/* Only include product and dashboard pages */}
          <Route path="/product" component={Product} />
          <Route path="/dashboard" component={Dashboard} />
          
          {/* Redirect home to dashboard */}
          <Route path="/">
            <Redirect to="/dashboard" />
          </Route>
          
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
