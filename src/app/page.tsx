import Link from "next/link";
import Container from "@/components/layout/container";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      {/* Header */}
      <header style={{ height: '5rem' }} className="sticky top-0 z-50 backdrop-blur-lg bg-gray-900/80 border-b border-gray-800">
        <Container className="h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div style={{ height: '3rem', width: '3rem', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)' }} className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-2xl">Q</span>
            </div>
            <span style={{ fontSize: '1.5rem', letterSpacing: '-0.025em' }} className="font-bold text-white">
              QuestionForge
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              style={{
                padding: '0.625rem 1.25rem',
                fontSize: '0.9375rem',
                color: '#D1D5DB',
                fontWeight: '500',
                borderRadius: '0.5rem',
                transition: 'all 0.2s ease'
              }}
              className="hover:text-white hover:bg-gray-800"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              style={{
                padding: '0.75rem 1.75rem',
                fontSize: '0.9375rem',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontWeight: '600',
                borderRadius: '0.75rem',
                transition: 'all 0.2s ease'
              }}
              className="hover:bg-blue-500"
            >
              Get Started
            </Link>
          </div>
        </Container>
      </header>

      {/* Hero Section */}
      <main id="main-content" className="relative overflow-hidden">
        {/* Subtle gradient orbs for visual interest */}
        <div style={{ position: 'absolute', top: '10%', left: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '20%', right: '5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        <Container style={{ paddingTop: '8rem', paddingBottom: '8rem', position: 'relative', textAlign: 'center' }}>
          <h1 style={{ fontSize: '4rem', lineHeight: '1.1', letterSpacing: '-0.03em' }} className="font-bold tracking-tight text-white">
            Create Perfect Exams with
            <span className="block bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent" style={{ marginTop: '0.5rem', fontSize: '4.25rem' }}>AI Power</span>
          </h1>

          <p style={{ marginTop: '2rem', fontSize: '1.375rem', lineHeight: '1.8', maxWidth: '40rem', color: '#E5E7EB', textAlign: 'center', marginLeft: 'auto', marginRight: 'auto' }}>
            Generate exams, worksheets, and polished PDFs in minutes.
            <br />Built for teachers who value their time.
          </p>

          <div style={{ marginTop: '3rem', gap: '1rem', display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/register"
              style={{
                padding: '1rem 2.5rem',
                fontSize: '1.0625rem',
                boxShadow: '0 4px 20px rgba(59, 130, 246, 0.5)',
                fontWeight: '600',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                borderRadius: '0.75rem',
                transition: 'all 0.2s ease'
              }}
              className="hover:bg-blue-500 hover:shadow-xl"
            >
              Start Free
            </Link>
            <Link
              href="#features"
              style={{
                padding: '1rem 2.5rem',
                fontSize: '1.0625rem',
                backgroundColor: 'rgba(55, 65, 81, 0.9)',
                border: '1px solid #6B7280',
                fontWeight: '600',
                color: '#F3F4F6',
                borderRadius: '0.75rem',
                transition: 'all 0.2s ease'
              }}
              className="hover:bg-gray-600"
            >
              Learn More
            </Link>
          </div>
        </Container>

        {/* Features Section */}
        <section id="features" style={{ paddingTop: '6rem', paddingBottom: '6rem', backgroundColor: 'rgba(17, 24, 39, 0.5)' }}>
          <Container>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <span style={{ 
                display: 'inline-block',
                padding: '0.5rem 1rem', 
                fontSize: '0.875rem', 
                backgroundColor: 'rgba(59, 130, 246, 0.15)', 
                color: '#60A5FA',
                borderRadius: '9999px',
                fontWeight: '500',
                marginBottom: '1rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>Features</span>
              <h2 style={{ fontSize: '2.75rem', letterSpacing: '-0.025em' }} className="font-bold text-white">
                Everything You Need
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
              {/* Feature 1 */}
              <div style={{ 
                padding: '2.5rem', 
                borderRadius: '1.5rem',
                background: 'linear-gradient(145deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.9) 100%)',
                border: '1px solid rgba(75, 85, 99, 0.5)',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)'
              }} className="transition hover:-translate-y-1 hover:border-gray-600">
                <div style={{ 
                  height: '4rem', 
                  width: '4rem', 
                  marginBottom: '1.5rem', 
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)',
                  borderRadius: '1rem'
                }} className="flex items-center justify-center">
                  <svg
                    style={{ height: '2rem', width: '2rem', color: '#60A5FA' }}
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
                </div>
                <h3 style={{ fontSize: '1.375rem', marginBottom: '0.75rem', fontWeight: '600' }} className="text-white">
                  AI-Powered Generation
                </h3>
                <p style={{ fontSize: '1rem', lineHeight: '1.7', color: '#9CA3AF' }}>
                  Generate high-quality questions across multiple subjects and
                  difficulty levels using advanced AI.
                </p>
              </div>

              {/* Feature 2 */}
              <div style={{ 
                padding: '2.5rem', 
                borderRadius: '1.5rem',
                background: 'linear-gradient(145deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.9) 100%)',
                border: '1px solid rgba(75, 85, 99, 0.5)',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)'
              }} className="transition hover:-translate-y-1 hover:border-gray-600">
                <div style={{ 
                  height: '4rem', 
                  width: '4rem', 
                  marginBottom: '1.5rem', 
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)',
                  borderRadius: '1rem'
                }} className="flex items-center justify-center">
                  <svg
                    style={{ height: '2rem', width: '2rem', color: '#60A5FA' }}
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
                </div>
                <h3 style={{ fontSize: '1.375rem', marginBottom: '0.75rem', fontWeight: '600' }} className="text-white">
                  Worksheet Builder
                </h3>
                <p style={{ fontSize: '1rem', lineHeight: '1.7', color: '#9CA3AF' }}>
                  Drag and drop questions to create custom worksheets. Organize
                  and arrange with ease.
                </p>
              </div>

              {/* Feature 3 */}
              <div style={{ 
                padding: '2.5rem', 
                borderRadius: '1.5rem',
                background: 'linear-gradient(145deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.9) 100%)',
                border: '1px solid rgba(75, 85, 99, 0.5)',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)'
              }} className="transition hover:-translate-y-1 hover:border-gray-600">
                <div style={{ 
                  height: '4rem', 
                  width: '4rem', 
                  marginBottom: '1.5rem', 
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)',
                  borderRadius: '1rem'
                }} className="flex items-center justify-center">
                  <svg
                    style={{ height: '2rem', width: '2rem', color: '#60A5FA' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 style={{ fontSize: '1.375rem', marginBottom: '0.75rem', fontWeight: '600' }} className="text-white">
                  PDF Export
                </h3>
                <p style={{ fontSize: '1rem', lineHeight: '1.7', color: '#9CA3AF' }}>
                  Export professional worksheets with separate answer keys.
                  Print-ready and beautifully formatted.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* Subjects Section */}
        <section style={{ paddingTop: '6rem', paddingBottom: '6rem' }}>
          <Container>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span style={{ 
                display: 'inline-block',
                padding: '0.5rem 1rem', 
                fontSize: '0.875rem', 
                backgroundColor: 'rgba(139, 92, 246, 0.15)', 
                color: '#A78BFA',
                borderRadius: '9999px',
                fontWeight: '500',
                marginBottom: '1rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>Curriculum</span>
              <h2 style={{ fontSize: '2.75rem', letterSpacing: '-0.025em' }} className="font-bold text-white">
                Subjects We Support
              </h2>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
              {[
                { name: "Math", emoji: "📐" },
                { name: "English", emoji: "📚" },
                { name: "Science", emoji: "🔬" },
                { name: "Urdu", emoji: "✍️" },
                { name: "Islamiyat", emoji: "🕌" },
                { name: "General Knowledge", emoji: "🌍" },
              ].map((subject) => (
                <span
                  key={subject.name}
                  style={{ 
                    padding: '0.875rem 1.75rem', 
                    fontSize: '1rem', 
                    backgroundColor: 'rgba(31, 41, 55, 0.8)', 
                    border: '1px solid rgba(75, 85, 99, 0.6)',
                    borderRadius: '9999px',
                    fontWeight: '500',
                    color: '#E5E7EB',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  className="hover:bg-gray-700 hover:border-gray-500 transition-all cursor-default"
                >
                  <span>{subject.emoji}</span>
                  {subject.name}
                </span>
              ))}
            </div>
          </Container>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ paddingTop: '5rem', paddingBottom: '3rem' }} className="border-t border-gray-800 bg-gray-950/50">
        <Container>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem' }}>
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3" style={{ marginBottom: '1.25rem' }}>
                <div style={{ height: '2.5rem', width: '2.5rem', boxShadow: '0 2px 10px rgba(59, 130, 246, 0.3)' }} className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Q</span>
                </div>
                <span style={{ fontSize: '1.25rem', letterSpacing: '-0.025em' }} className="font-bold text-white">
                  QuestionForge
                </span>
              </div>
              <p style={{ fontSize: '0.9375rem', lineHeight: '1.7', maxWidth: '18rem', color: '#9CA3AF' }}>
                Empowering educators with AI-powered tools to create engaging assessments and save valuable time.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 style={{ fontSize: '0.9375rem', marginBottom: '1.25rem', fontWeight: '600', color: '#F9FAFB' }}>Product</h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#9CA3AF', fontSize: '0.9375rem' }}>
                <li><Link href="#features" className="hover:text-blue-400 transition-colors">Features</Link></li>
                <li><Link href="/register" className="hover:text-blue-400 transition-colors">Get Started</Link></li>
                <li><Link href="/login" className="hover:text-blue-400 transition-colors">Sign In</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 style={{ fontSize: '0.9375rem', marginBottom: '1.25rem', fontWeight: '600', color: '#F9FAFB' }}>Legal</h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#9CA3AF', fontSize: '0.9375rem' }}>
                <li><span className="cursor-default">Privacy Policy</span></li>
                <li><span className="cursor-default">Terms of Service</span></li>
                <li><span className="cursor-default">Contact</span></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{ marginTop: '3rem', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#6B7280' }} className="border-t border-gray-800/50">
            <p style={{ fontWeight: '500' }}>Built with AI for Educators</p>
            <p style={{ marginTop: '0.375rem' }}>
              &copy; {new Date().getFullYear()} QuestionForge. All rights reserved.
            </p>
          </div>
        </Container>
      </footer>
    </div>
  );
}
