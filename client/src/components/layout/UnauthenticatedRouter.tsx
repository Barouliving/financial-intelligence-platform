import { Switch, Route, Redirect } from "wouter";

// Pages
import Home from "@/pages/home";
import Product from "@/pages/product";
import Pricing from "@/pages/pricing";
import Demo from "@/pages/demo";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";

export default function UnauthenticatedRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/product" component={Product} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/demo" component={Demo} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Redirect protected routes to auth */}
      <Route path="/ai">
        <Redirect to="/auth" />
      </Route>
      <Route path="/dashboard">
        <Redirect to="/auth" />
      </Route>
      <Route path="/bookkeeping">
        <Redirect to="/auth" />
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}