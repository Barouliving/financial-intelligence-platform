import { Switch, Route, Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";

// Pages
import Product from "@/pages/product";
import AI from "@/pages/ai";
import Pricing from "@/pages/pricing";
import Dashboard from "@/pages/dashboard";
import Demo from "@/pages/demo";
import Bookkeeping from "@/pages/bookkeeping";
import NotFound from "@/pages/not-found";

export default function AuthenticatedRouter() {
  return (
    <Switch>
      {/* Product Routes */}
      <Route path="/product" component={Product} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/demo" component={Demo} />
      
      {/* Authenticated-only Routes */}
      <Route path="/ai" component={AI} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/bookkeeping" component={Bookkeeping} />
      
      {/* Redirect home to dashboard for authenticated users */}
      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}