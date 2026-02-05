import * as React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center", className)}
      style={{ fontSize: '0.9375rem' }}
    >
      <ol style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <li>
          <Link
            href="/dashboard"
            className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            style={{ padding: '0.375rem', borderRadius: '0.5rem' }}
          >
            <Home style={{ height: '1.25rem', width: '1.25rem' }} />
            <span className="sr-only">Dashboard</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ChevronRight style={{ height: '1.125rem', width: '1.125rem', color: '#9CA3AF' }} className="dark:text-gray-500" />
            {item.href && index < items.length - 1 ? (
              <Link
                href={item.href}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                style={{ fontWeight: '500' }}
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 dark:text-white" style={{ fontWeight: '600' }}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
