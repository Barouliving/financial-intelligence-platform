import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LineChart, Settings, User } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

// Simple mock user for development
const mockUser = {
  username: "DemoUser",
  firstName: "Demo",
  lastName: "User",
  email: "demo@example.com"
};

export function UserMenu() {
  // Simplified version without auth
  const getInitials = () => {
    return `${mockUser.firstName[0]}${mockUser.lastName[0]}`.toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {mockUser.firstName} {mockUser.lastName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {mockUser.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">
            <div className="flex items-center">
              <LineChart className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </div>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/bookkeeping">
            <div className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>Bookkeeping</span>
            </div>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/ai">
            <div className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span>AI Assistant</span>
            </div>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}