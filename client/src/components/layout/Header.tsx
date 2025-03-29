import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
import { UserMenu } from './UserMenu';

export default function Header() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Product', href: '/product' },
    { name: 'Dashboard', href: '/dashboard' }
  ];

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center">
                <div className="text-primary-500 font-bold text-2xl">Pigment</div>
              </div>
            </Link>
            <nav className="hidden lg:flex items-center ml-12">
              {menuItems.map((item) => (
                <Link key={item.name} href={item.href}>
                  <div className={`text-gray-600 hover:text-primary-500 px-4 py-2 font-medium text-sm ${location === item.href ? 'text-primary-500' : ''}`}>
                    {item.name}
                  </div>
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center">
            <UserMenu />
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" className="lg:hidden ml-4">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-center mb-8">
                    <div className="text-primary-500 font-bold text-2xl">Pigment</div>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon">
                        <X size={24} />
                      </Button>
                    </SheetClose>
                  </div>
                  <nav className="flex flex-col space-y-4">
                    {menuItems.map((item) => (
                      <Link key={item.name} href={item.href}>
                        <div 
                          className={`text-gray-700 hover:text-primary-500 py-2 font-medium text-lg ${location === item.href ? 'text-primary-500' : ''}`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.name}
                        </div>
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
