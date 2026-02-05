"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useSidebar } from "@/contexts/sidebar-context";
import { Menu, X, PanelLeftClose, PanelLeft } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { isCollapsed, isMobileOpen, toggleCollapse, toggleMobile } = useSidebar();

  // Track screen size to show appropriate icon
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleMenuClick = () => {
    // On mobile (< lg): toggle mobile overlay
    // On desktop (>= lg): toggle collapsed state
    if (!isMobile) {
      toggleCollapse();
    } else {
      toggleMobile();
    }
  };

  // Determine which icon to show
  const getMenuIcon = () => {
    if (isMobile) {
      // Mobile: show X when open, hamburger when closed
      return isMobileOpen ? (
        <X className="h-8 w-8 transition-transform duration-200" />
      ) : (
        <Menu className="h-8 w-8 transition-transform duration-200" />
      );
    }
    // Desktop: show panel icons based on collapsed state
    return isCollapsed ? (
      <PanelLeft className="h-8 w-8 transition-transform duration-200" />
    ) : (
      <PanelLeftClose className="h-8 w-8 transition-transform duration-200" />
    );
  };

  return (
    <header className="h-16 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 fixed top-0 left-0 right-0 z-50">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Menu Button - Now visible on all screen sizes */}
          <button
            onClick={handleMenuClick}
            className="p-2 hover:bg-gray-800 rounded-xl transition-all duration-200 text-gray-300 hover:text-white"
            aria-label={isMobile ? (isMobileOpen ? "Close menu" : "Open menu") : (isCollapsed ? "Expand sidebar" : "Collapse sidebar")}
            aria-expanded={isMobile ? isMobileOpen : !isCollapsed}
          >
            {getMenuIcon()}
          </button>

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">Q</span>
            </div>
            <span className="text-xl font-bold text-white hidden sm:block">
              QuestionForge
            </span>
          </Link>
        </div>

        {/* Right Section */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* User Profile Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 1rem',
                borderRadius: '0.75rem',
                transition: 'all 0.2s ease',
                backgroundColor: isProfileOpen ? '#1F2937' : 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
              className="hover:bg-gray-800"
              aria-expanded={isProfileOpen}
              aria-haspopup="true"
            >
              {/* Avatar */}
              <div style={{
                height: '2.5rem',
                width: '2.5rem',
                borderRadius: '9999px',
                backgroundColor: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ color: 'white', fontWeight: '600', fontSize: '1rem' }}>
                  {session?.user?.name
                    ? session.user.name.charAt(0).toUpperCase()
                    : session?.user?.email?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <span style={{ color: '#D1D5DB', fontSize: '0.9375rem', fontWeight: '500' }} className="hidden md:block">
                {session?.user?.name || session?.user?.email?.split("@")[0]}
              </span>
              <svg
                style={{
                  height: '1.25rem',
                  width: '1.25rem',
                  color: '#9CA3AF',
                  transition: 'transform 0.2s ease',
                  transform: isProfileOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <>
                {/* Backdrop */}
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 10 }}
                  onClick={() => setIsProfileOpen(false)}
                />
                {/* Menu */}
                <div style={{
                  position: 'absolute',
                  right: 0,
                  marginTop: '0.75rem',
                  width: '16rem',
                  borderRadius: '1rem',
                  border: '1px solid #374151',
                  backgroundColor: 'rgba(17, 24, 39, 0.98)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
                  zIndex: 20,
                  overflow: 'hidden'
                }}>
                  {/* User Info */}
                  <div style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid #374151'
                  }}>
                    <p style={{ fontSize: '0.9375rem', fontWeight: '600', color: 'white', marginBottom: '0.25rem' }}>
                      {session?.user?.name || "User"}
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {session?.user?.email}
                    </p>
                  </div>
                  {/* Sign Out Button */}
                  <div style={{ padding: '0.5rem' }}>
                    <button
                      onClick={handleSignOut}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        textAlign: 'left',
                        fontSize: '0.9375rem',
                        color: '#F87171',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        transition: 'background-color 0.2s ease'
                      }}
                      className="hover:bg-gray-800"
                    >
                      <svg
                        style={{ height: '1.25rem', width: '1.25rem' }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
