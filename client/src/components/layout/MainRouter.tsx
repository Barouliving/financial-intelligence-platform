import { useAuth } from "@/hooks/use-auth";
import AuthenticatedRouter from "./AuthenticatedRouter";
import UnauthenticatedRouter from "./UnauthenticatedRouter";

export default function MainRouter() {
  const { user } = useAuth();
  
  // Return the appropriate router based on authentication status
  return user ? <AuthenticatedRouter /> : <UnauthenticatedRouter />;
}