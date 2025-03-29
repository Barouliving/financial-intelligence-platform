import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Loader2 } from "lucide-react";

// Pages (direct imports)
import Home from "@/pages/home";
import Product from "@/pages/product";
import AI from "@/pages/ai";
import Pricing from "@/pages/pricing";
import Dashboard from "@/pages/dashboard";
import Demo from "@/pages/demo";
import Bookkeeping from "@/pages/bookkeeping";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";

// Protected route component
const ProtectedRoute = ({ component: Component }) => {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    // Redirect to auth page if not authenticated
    navigate("/auth");
    return null;
  }
  
  return <Component />;
};

function AppRouter() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        <Switch>
          {/* Public routes */}
          <Route path="/product" component={Product} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/demo" component={Demo} />
          <Route path="/auth" component={AuthPage} />
          
          {/* Protected routes */}
          <Route path="/ai">
            <ProtectedRoute component={AI} />
          </Route>
          
          <Route path="/dashboard">
            <ProtectedRoute component={Dashboard} />
          </Route>
          
          <Route path="/bookkeeping">
            <ProtectedRoute component={Bookkeeping} />
          </Route>
          
          {/* Home route */}
          <Route path="/">
            {user ? <Dashboard /> : <Home />}
          </Route>
          
          {/* Fallback route */}
          <Route>
            <NotFound />
          </Route>
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
