"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MainNav from "../navigation/MainNav";
import CartDrawer from "../cart/CartDrawer";
import SearchDrawer from "../search/SearchDrawer";
import { useCart } from "../cart/CartProvider";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { count } = useCart();
  const { customer, isAuthenticated, signOut } = useCustomerAuth();

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    if (isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 10);

      if (y <= 10) {
        setShowHeader(true);
      } else if (y > lastScrollY) {
        // scrolling down
        setShowHeader(false);
      } else {
        // scrolling up
        setShowHeader(true);
      }
      setLastScrollY(y);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastScrollY]);

  return (
    <header className={`header-bl ${scrolled ? "scrolled" : ""} ${showHeader ? "" : "hide"}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <a href="/" className="flex items-center" aria-label="Patram Home">
          <Image
            src="/logo-1.svg"
            alt="Patram"
            width={120}
            height={32}
            priority
            className="h-13 w-auto"
          />
        </a>
        
        {/* Desktop Navigation */}
        <MainNav />
        
        {/* Right Side Icons */}
        <div className="flex items-center gap-4">
          {/* Search Icon */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="icon-link p-2"
            aria-label="Search"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
 
          {/* User Icon */}
          {isAuthenticated ? (
            <div className="relative" ref={userDropdownRef}>
              <button 
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="icon-link p-2" 
                aria-label="User Account"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              
              {/* User Dropdown */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{customer?.name}</p>
                      <p className="text-xs text-gray-500">{customer?.email}</p>
                    </div>
                    <a 
                      href="/orders" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      My Orders
                    </a>
                    <button
                      onClick={() => {
                        signOut();
                        setIsUserDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <a
              href="/customer-login"
              className="icon-link p-2"
              aria-label="User Account"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </a>
          )}

          {/* Cart Icon with Count */}
          <div className="relative">
            <CartDrawer />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {count}
              </span>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden icon-link p-2"
            aria-label="Toggle mobile menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="mobile-menu-drawer">
            <div className="mobile-menu-header">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Close mobile menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mobile-menu-content">
              <a href="/" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>Home</a>
              <a href="/about" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>About</a>
              <a href="/shop" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>Shop</a>
              <a href="/contact" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>Contact</a>
              <a href="/track-order" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>Track Order</a>
              
              {isAuthenticated ? (
                <>
                  <div className="mobile-menu-divider">
                    <p className="text-xs text-gray-500 mb-2">Welcome back!</p>
                    <p className="text-sm font-medium text-gray-900">{customer?.name}</p>
                    <p className="text-xs text-gray-500">{customer?.email}</p>
                  </div>
                  <a href="/orders" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>My Orders</a>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="mobile-menu-link text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <a href="/customer-login" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>Login / Sign Up</a>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Search Drawer */}
      <SearchDrawer 
        open={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </header>
  );
}