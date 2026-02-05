"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

// Time-based greeting helper
function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const greeting = getTimeBasedGreeting();

  const stats = [
    {
      name: "Total Questions",
      value: "0",
      href: "/dashboard/questions",
      icon: (
        <svg
          className="h-10 w-10"
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
      color: "blue",
    },
    {
      name: "Worksheets",
      value: "0",
      href: "/dashboard/worksheets",
      icon: (
        <svg
          className="h-10 w-10"
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
      color: "green",
    },
    {
      name: "Favorites",
      value: "0",
      href: "/dashboard/favorites",
      icon: (
        <svg
          className="h-10 w-10"
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
      color: "yellow",
    },
    {
      name: "AI Generated",
      value: "0",
      href: "/dashboard/generate",
      icon: (
        <svg
          className="h-10 w-10"
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
      color: "purple",
    },
  ];

  const quickActions = [
    {
      name: "Generate Questions",
      description: "Create new questions using AI",
      href: "/dashboard/generate",
      icon: (
        <svg
          className="h-10 w-10"
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
      ),
      color: "blue",
    },
    {
      name: "Create Worksheet",
      description: "Build a new exam worksheet",
      href: "/dashboard/worksheets/new",
      icon: (
        <svg
          className="h-10 w-10"
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
      color: "green",
    },
    {
      name: "Browse Questions",
      description: "View your question bank",
      href: "/dashboard/questions",
      icon: (
        <svg
          className="h-10 w-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
      color: "purple",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; gradient: string; text: string; icon: string; hover: string }> = {
      blue: {
        bg: "bg-blue-900/20",
        gradient: "from-blue-800 to-blue-900",
        text: "text-blue-300",
        icon: "text-blue-400",
        hover: "hover:border-blue-700",
      },
      green: {
        bg: "bg-green-900/20",
        gradient: "from-green-800 to-green-900",
        text: "text-green-300",
        icon: "text-green-400",
        hover: "hover:border-green-700",
      },
      yellow: {
        bg: "bg-yellow-900/20",
        gradient: "from-yellow-800 to-yellow-900",
        text: "text-yellow-300",
        icon: "text-yellow-400",
        hover: "hover:border-yellow-700",
      },
      purple: {
        bg: "bg-purple-900/20",
        gradient: "from-purple-800 to-purple-900",
        text: "text-purple-300",
        icon: "text-purple-400",
        hover: "hover:border-purple-700",
      },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Section */}
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'white' }}>
          {greeting}, {session?.user?.name || "Teacher"}!
        </h1>
        <p style={{ marginTop: '0.25rem', color: '#9CA3AF' }}>
          Here&apos;s an overview of your question bank
        </p>
      </div>

      {/* Stats Grid - Modern card styling */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {stats.map((stat) => {
          const colors = getColorClasses(stat.color);
          return (
            <Link
              key={stat.name}
              href={stat.href}
              style={{
                borderRadius: '1rem',
                border: '1px solid #374151',
                background: 'linear-gradient(145deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.9) 100%)',
                padding: '1.5rem',
                display: 'block',
                transition: 'all 0.2s'
              }}
              className="group hover:-translate-y-1 hover:border-gray-600"
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#9CA3AF' }}>
                    {stat.name}
                  </p>
                  <p style={{ fontSize: '1.875rem', fontWeight: '700', letterSpacing: '-0.025em', color: 'white' }}>
                    {stat.value}
                  </p>
                </div>
                <div style={{
                  display: 'flex',
                  height: '3.5rem',
                  width: '3.5rem',
                  flexShrink: 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '0.75rem',
                  background: stat.color === 'blue' ? 'linear-gradient(135deg, #1E3A5F 0%, #1E40AF 100%)' :
                             stat.color === 'green' ? 'linear-gradient(135deg, #14532D 0%, #166534 100%)' :
                             stat.color === 'yellow' ? 'linear-gradient(135deg, #713F12 0%, #A16207 100%)' :
                             'linear-gradient(135deg, #581C87 0%, #7C3AED 100%)',
                  transition: 'transform 0.3s'
                }} className="group-hover:scale-110">
                  <span style={{ 
                    color: stat.color === 'blue' ? '#60A5FA' :
                           stat.color === 'green' ? '#4ADE80' :
                           stat.color === 'yellow' ? '#FBBF24' :
                           '#A78BFA'
                  }}>{stat.icon}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions - Modern styling */}
      <div style={{ marginTop: '1rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white', marginBottom: '1.5rem' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {quickActions.map((action) => {
            return (
              <Link
                key={action.name}
                href={action.href}
                style={{
                  borderRadius: '1rem',
                  border: '1px solid #374151',
                  background: 'linear-gradient(145deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.9) 100%)',
                  padding: '1.5rem',
                  display: 'block',
                  transition: 'all 0.2s'
                }}
                className="group hover:-translate-y-1 hover:border-gray-600"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      height: '4rem',
                      width: '4rem',
                      flexShrink: 0,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '0.75rem',
                      background: action.color === 'blue' ? 'linear-gradient(135deg, #1E3A5F 0%, #1E40AF 100%)' :
                                 action.color === 'green' ? 'linear-gradient(135deg, #14532D 0%, #166534 100%)' :
                                 'linear-gradient(135deg, #581C87 0%, #7C3AED 100%)',
                      transition: 'transform 0.3s'
                    }}
                    className="group-hover:scale-110"
                  >
                    <span style={{ 
                      color: action.color === 'blue' ? '#60A5FA' :
                             action.color === 'green' ? '#4ADE80' :
                             '#A78BFA'
                    }}>{action.icon}</span>
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem', color: 'white' }} className="group-hover:text-blue-400 transition-colors">
                      {action.name}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Placeholder - Modern empty state */}
      <div style={{ marginTop: '1rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white', marginBottom: '1.5rem' }}>
          Recent Questions
        </h2>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '1rem',
          border: '2px dashed #374151',
          backgroundColor: 'rgba(17, 24, 39, 0.5)',
          padding: '4rem 1.5rem',
          textAlign: 'center'
        }}>
          <div style={{
            marginBottom: '1rem',
            display: 'flex',
            height: '4rem',
            width: '4rem',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '9999px',
            backgroundColor: '#1F2937'
          }}>
            <svg
              style={{ height: '2rem', width: '2rem', color: '#6B7280' }}
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
          </div>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem', fontWeight: '600', color: 'white' }}>
            No questions yet
          </h3>
          <p style={{ marginBottom: '1.5rem', maxWidth: '24rem', fontSize: '0.9375rem', color: '#9CA3AF', lineHeight: '1.5' }}>
            Start generating questions with AI to build your question bank
          </p>
          <Link
            href="/dashboard/generate"
            style={{
              display: 'inline-flex',
              height: '3rem',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              borderRadius: '0.75rem',
              backgroundColor: '#2563EB',
              padding: '0 1.5rem',
              fontSize: '0.9375rem',
              fontWeight: '600',
              color: '#FFFFFF',
              transition: 'all 0.2s ease',
              textDecoration: 'none'
            }}
            className="hover:bg-blue-500"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Generate Questions
          </Link>
        </div>
      </div>
    </div>
  );
}
