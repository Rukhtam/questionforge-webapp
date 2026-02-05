"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/contexts/sidebar-context";
import { getSubjectEmojiByName } from "@/lib/utils/emoji";
import { Home, Sparkles, HelpCircle, FileText, Star, Plus } from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Generate Questions",
    href: "/dashboard/generate",
    icon: Sparkles,
  },
  {
    name: "Question Bank",
    href: "/dashboard/questions",
    icon: HelpCircle,
  },
  {
    name: "Worksheets",
    href: "/dashboard/worksheets",
    icon: FileText,
  },
  {
    name: "Favorites",
    href: "/dashboard/favorites",
    icon: Star,
  },
];

const subjects = [
  { name: "Math" },
  { name: "Science" },
  { name: "English" },
  { name: "Urdu" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, closeMobile } = useSidebar();

  // Handle escape key to close mobile sidebar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) {
        closeMobile();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobileOpen, closeMobile]);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        role="navigation"
        aria-label="Main navigation"
        style={{
          position: 'fixed',
          top: '4rem',
          left: 0,
          bottom: 0,
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          backdropFilter: 'blur(12px)',
          borderRight: '1px solid #1F2937',
          zIndex: 40,
          transition: 'all 0.3s ease',
        }}
        className={`
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${isCollapsed ? 'w-[4.5rem]' : 'w-64'}
        `}
      >
        <nav style={{ height: '100%', paddingTop: '1.5rem', paddingBottom: '1.5rem', overflowY: 'auto', overflowX: 'hidden' }}>
          {/* Main Navigation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', padding: '0 0.75rem' }}>
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMobile}
                  title={isCollapsed ? item.name : undefined}
                  aria-current={isActive ? "page" : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: isCollapsed ? '0.75rem' : '0.75rem 1rem',
                    borderRadius: '0.625rem',
                    fontSize: '0.9375rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                    color: isActive ? '#60A5FA' : '#9CA3AF',
                    border: isActive ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                  }}
                  className="hover:bg-gray-800 hover:text-white hover:border-gray-700"
                >
                  <Icon
                    style={{
                      height: '1.25rem',
                      width: '1.25rem',
                      flexShrink: 0,
                      color: isActive ? '#60A5FA' : '#6B7280',
                      transition: 'color 0.2s ease'
                    }}
                  />
                  {!isCollapsed && (
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div style={{ margin: '1.25rem 0.75rem', borderTop: '1px solid #1F2937' }} />

          {/* Quick Actions */}
          <div style={{ padding: '0 0.75rem' }}>
            {!isCollapsed && (
              <h3 style={{
                padding: '0 0.75rem',
                marginBottom: '0.625rem',
                fontSize: '0.6875rem',
                fontWeight: '600',
                color: '#6B7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Quick Actions
              </h3>
            )}
            <Link
              href="/dashboard/generate"
              onClick={closeMobile}
              title={isCollapsed ? "New Questions" : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: isCollapsed ? '0.75rem' : '0.75rem 1rem',
                borderRadius: '0.625rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                transition: 'all 0.2s ease',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
              }}
              className="hover:bg-blue-500"
            >
              <Plus style={{ height: '1.25rem', width: '1.25rem', flexShrink: 0 }} />
              {!isCollapsed && (
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  New Questions
                </span>
              )}
            </Link>
          </div>

          {/* Subject Filter Preview - Hidden when collapsed */}
          {!isCollapsed && (
            <div style={{ marginTop: '1.5rem', padding: '0 0.75rem' }}>
              <h3 style={{
                padding: '0 0.75rem',
                marginBottom: '0.625rem',
                fontSize: '0.6875rem',
                fontWeight: '600',
                color: '#6B7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Subjects
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {subjects.map((subject) => (
                  <button
                    key={subject.name}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#9CA3AF',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left'
                    }}
                    className="hover:bg-gray-800 hover:text-white"
                  >
                    <span style={{ fontSize: '1rem', flexShrink: 0 }}>
                      {getSubjectEmojiByName(subject.name)}
                    </span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {subject.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
