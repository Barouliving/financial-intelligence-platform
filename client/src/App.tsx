import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/hooks/use-auth";

// Pages (direct imports)
import Dashboard from "@/pages/dashboard";
import Bookkeeping from "@/pages/bookkeeping";
import Finance from "@/pages/finance";
import AI from "@/pages/ai";
import NotFound from "@/pages/not-found";

// Define types for route components
type ComponentType = () => JSX.Element;

function AppRouter() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        <Switch>
          {/* Client-facing product pages */}
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/bookkeeping" component={Bookkeeping} />
          <Route path="/finance" component={Finance} />
          <Route path="/ai" component={AI} />
          
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
