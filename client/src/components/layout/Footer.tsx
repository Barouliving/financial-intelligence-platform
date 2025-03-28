import { Link } from 'wouter';
import { Facebook, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  const productLinks = [
    { name: 'Features', href: '/product#features' },
    { name: 'AI Capabilities', href: '/ai' },
    { name: 'Integrations', href: '/product#integrations' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Security', href: '/security' }
  ];

  const resourceLinks = [
    { name: 'Blog', href: '/blog' },
    { name: 'Case Studies', href: '/case-studies' },
    { name: 'Guides', href: '/guides' },
    { name: 'Help Center', href: '/help' },
    { name: 'Webinars', href: '/webinars' }
  ];

  const companyLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Press', href: '/press' },
    { name: 'Contact', href: '/contact' },
    { name: 'Partners', href: '/partners' }
  ];

  const legalLinks = [
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Cookie Policy', href: '/cookies' }
  ];

  return (
    <footer className="bg-gray-800 text-white pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-2">
            <Link href="/">
              <a className="inline-block mb-6">
                <div className="text-white font-bold text-2xl">Pigment</div>
              </a>
            </Link>
            <p className="text-gray-400 mb-6">
              Transform how you plan, report and analyze with our AI-powered business planning platform.
            </p>
            <div className="flex space-x-4">
              <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-white">
                <Facebook size={24} />
              </a>
              <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-white">
                <Twitter size={24} />
              </a>
              <a href="#" aria-label="LinkedIn" className="text-gray-400 hover:text-white">
                <Linkedin size={24} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Product</h4>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}>
                    <a className="text-gray-400 hover:text-white">{link.name}</a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Resources</h4>
            <ul className="space-y-2">
              {resourceLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}>
                    <a className="text-gray-400 hover:text-white">{link.name}</a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Company</h4>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}>
                    <a className="text-gray-400 hover:text-white">{link.name}</a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Pigment, Inc. All rights reserved.
            </div>
            <div className="flex space-x-6">
              {legalLinks.map((link) => (
                <Link key={link.name} href={link.href}>
                  <a className="text-gray-400 hover:text-white text-sm">{link.name}</a>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
