"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/contexts/sidebar-context";
import { getSubjectEmojiByName } from "@/lib/utils/emoji";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg
        className="h-5 w-5 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    name: "Generate Questions",
    href: "/dashboard/generate",
    icon: (
      <svg
        className="h-5 w-5 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
  },
  {
    name: "Question Bank",
    href: "/dashboard/questions",
    icon: (
      <svg
        className="h-5 w-5 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    name: "Worksheets",
    href: "/dashboard/worksheets",
    icon: (
      <svg
        className="h-5 w-5 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    name: "Favorites",
    href: "/dashboard/favorites",
    icon: (
      <svg
        className="h-5 w-5 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    ),
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

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 bottom-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40
          transform transition-all duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"}
          lg:translate-x-0
          ${isCollapsed ? "lg:w-16" : "lg:w-64"}
        `}
      >
        <nav className="h-full py-6 overflow-y-auto overflow-x-hidden">
          {/* Main Navigation */}
          <div className="space-y-1 px-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMobile}
                  title={isCollapsed ? item.name : undefined}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }
                    ${isCollapsed ? "lg:justify-center lg:px-2" : ""}
                  `}
                >
                  <span
                    className={
                      isActive
                        ? "text-blue-500"
                        : "text-gray-400 dark:text-gray-500"
                    }
                  >
                    {item.icon}
                  </span>
                  <span
                    className={`whitespace-nowrap transition-opacity duration-200 ${
                      isCollapsed ? "lg:hidden" : ""
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Divider - Hidden when collapsed on desktop */}
          <div
            className={`my-6 border-t border-gray-200 dark:border-gray-700 mx-2 ${
              isCollapsed ? "lg:mx-2" : ""
            }`}
          />

          {/* Quick Actions */}
          <div className={`space-y-2 px-2 ${isCollapsed ? "lg:px-2" : ""}`}>
            <h3
              className={`px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap ${
                isCollapsed ? "lg:hidden" : ""
              }`}
            >
              Quick Actions
            </h3>
            <Link
              href="/dashboard/generate"
              onClick={closeMobile}
              title={isCollapsed ? "New Questions" : undefined}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors
                ${isCollapsed ? "lg:justify-center lg:px-2" : ""}
              `}
            >
              <svg
                className="h-5 w-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span
                className={`whitespace-nowrap ${isCollapsed ? "lg:hidden" : ""}`}
              >
                New Questions
              </span>
            </Link>
          </div>

          {/* Subject Filter Preview - Hidden when collapsed on desktop */}
          <div
            className={`mt-6 space-y-2 px-2 ${isCollapsed ? "lg:hidden" : ""}`}
          >
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Subjects
            </h3>
            <div className="space-y-1">
              {subjects.map((subject) => (
                <button
                  key={subject.name}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-lg">
                    {getSubjectEmojiByName(subject.name)}
                  </span>
                  {subject.name}
                </button>
              ))}
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
