import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

// Pages
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
  const { user } = useAuth();

  if (user) {
    // Authenticated routes
    return (
      <Switch>
        <Route path="/product" component={Product} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/demo" component={Demo} />
        <Route path="/ai" component={AI} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/bookkeeping" component={Bookkeeping} />
        <Route path="/">
          <Redirect to="/dashboard" />
        </Route>
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Unauthenticated routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/product" component={Product} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/demo" component={Demo} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/ai">
        <Redirect to="/auth" />
      </Route>
      <Route path="/dashboard">
        <Redirect to="/auth" />
      </Route>
      <Route path="/bookkeeping">
        <Redirect to="/auth" />
      </Route>
      <Route component={NotFound} />
    </Switch>
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
