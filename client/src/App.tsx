import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

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

function AppRouter() {
  const { user, isLoading } = useAuth();
  
  // Show a simple loading state while checking auth
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
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
          
          {/* Protected routes with conditional access */}
          {user ? (
            <>
              <Route path="/ai" component={AI} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/bookkeeping" component={Bookkeeping} />
              <Route path="/">
                <Redirect to="/dashboard" />
              </Route>
            </>
          ) : (
            <>
              <Route path="/ai">
                <Redirect to="/auth" />
              </Route>
              <Route path="/dashboard">
                <Redirect to="/auth" />
              </Route>
              <Route path="/bookkeeping">
                <Redirect to="/auth" />
              </Route>
              <Route path="/" component={Home} />
            </>
          )}
          
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
