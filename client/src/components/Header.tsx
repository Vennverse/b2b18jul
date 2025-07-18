import { useState, useEffect } from "react";
import { Menu, X, Mail, HandHeart, User, LogOut, Settings } from "lucide-react";
import B2BLogo from "./B2BLogo";
import SimpleAuth from "./SimpleAuth";
import { useAuth, useLogout } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const logoutMutation = useLogout();

  const checkAuth = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
      } else {
        localStorage.removeItem("auth_token");
        setCurrentUser(null);
      }
    } catch (error) {
      localStorage.removeItem("auth_token");
      setCurrentUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
    
    // Listen for auth changes
    const handleAuthChange = () => {
      checkAuth();
    };
    
    window.addEventListener('authChanged', handleAuthChange);
    return () => window.removeEventListener('authChanged', handleAuthChange);
  }, []);



  return (
    <>
      {/* Top Contact Bar */}
      <div className="b2b-cyan-bg text-white py-2 px-4">
        <div className="container mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              btwobmarket@gmail.com
            </span>
          </div>
          <div>
            {loading ? (
              <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
            ) : currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-4 text-sm border border-white rounded">
                    <User className="w-4 h-4 mr-2" />
                    <span className="font-medium">
                      {currentUser.firstName || currentUser.email}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/dashboard" className="flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      My Listings
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => {
                      localStorage.removeItem("auth_token");
                      window.location.reload();
                    }}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button 
                onClick={() => {
                  setAuthModalOpen(true);
                }}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '2px solid white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'block',
                  visibility: 'visible',
                  zIndex: 1000,
                  minWidth: '100px',
                  textAlign: 'center'
                }}
                onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#2563eb'}
                onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = '#3b82f6'}
              >
                Sign In/Up
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="flex items-center">
              <B2BLogo size="lg" className="mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">B2B MARKET</h1>
                <p className="text-sm text-gray-600">Bringing People and Business Together!</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <a href="/" className="text-gray-700 hover:text-[hsl(var(--b2b-blue))] font-medium transition-colors">
                Home
              </a>
              <a href="/buy-franchise" className="text-gray-700 hover:text-[hsl(var(--b2b-blue))] font-medium transition-colors">
                Buy a Franchise
              </a>
              <a href="/buy-business" className="text-gray-700 hover:text-[hsl(var(--b2b-blue))] font-medium transition-colors">
                Buy a Business
              </a>
              <a href="/sell-business" className="text-gray-700 hover:text-[hsl(var(--b2b-blue))] font-medium transition-colors">
                Sell Your Business
              </a>
              <a href="/post-ad" className="text-gray-700 hover:text-[hsl(var(--b2b-blue))] font-medium transition-colors">
                Post An Ad
              </a>

              <a href="/pricing" className="text-gray-700 hover:text-[hsl(var(--b2b-blue))] font-medium transition-colors">
                Pricing
              </a>
              <a href="/contact" className="text-gray-700 hover:text-[hsl(var(--b2b-blue))] font-medium transition-colors">
                Contact
              </a>
              <a href="/about" className="text-gray-700 hover:text-[hsl(var(--b2b-blue))] font-medium transition-colors">
                About
              </a>
              {currentUser?.role === 'admin' && (
                <a href="/admin" className="text-gray-700 hover:text-[hsl(var(--b2b-blue))] font-medium transition-colors">
                  Admin
                </a>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden text-gray-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 py-4">
              <nav className="flex flex-col space-y-4">
                <a href="/" className="text-gray-700 hover:text-[hsl(var(--b2b-blue))] font-medium">
                  Home
                </a>
                <a href="/buy-franchise" className="text-gray-700 hover:text-[hsl(var(--b2b-blue))] font-medium">
                  Buy a Franchise
                </a>
                <a href="/buy-business" className="text-gray-700 hover:text-[hsl(var(--b2b-blue))] font-medium">
                  Buy a Business
                </a>
                <a href="/sell-business" className="text-gray-700 hover:text-[hsl(var(--b2b-blue))] font-medium">
                  Sell Your Business
                </a>
                <a href="/post-ad" className="text-gray-700 hover:text-[hsl(var(--b2b-blue))] font-medium">
                  Post An Ad
                </a>

                <a href="/pricing" className="text-gray-700 hover:text-[hsl(var(--b2b-blue))] font-medium">
                  Pricing
                </a>
                <a href="/contact" className="text-gray-700 hover:text-[hsl(var(--b2b-blue))] font-medium">
                  Contact
                </a>
                <a href="/about" className="text-gray-700 hover:text-[hsl(var(--b2b-blue))] font-medium">
                  About
                </a>
                {currentUser?.role === 'admin' && (
                  <a href="/admin" className="text-gray-700 hover:text-[hsl(var(--b2b-blue))] font-medium">
                    Admin
                  </a>
                )}
              </nav>
            </div>
          )}

          {/* Scrolling Tagline */}
          <div className="text-center pb-4 overflow-hidden">
            <div className="scrolling-text">
              <p className="text-[hsl(var(--b2b-blue))] font-medium whitespace-nowrap">
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                A single Integrated platform for your business buying and selling needs
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Authentication Modal */}
      <SimpleAuth 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
}
