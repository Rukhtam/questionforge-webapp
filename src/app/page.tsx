import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Q</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              QuestionForge
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Create Perfect Exams with{" "}
            <span className="text-blue-500">AI Power</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            Generate custom exam questions, build professional worksheets, and
            export polished PDFs in minutes. Designed for teachers who value
            their time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Start Creating for Free
            </Link>
            <Link
              href="#features"
              className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="mt-32">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Everything You Need
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                <svg
                  className="h-6 w-6 text-blue-500"
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
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                AI-Powered Generation
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Generate high-quality questions across multiple subjects and
                difficulty levels using advanced AI.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                <svg
                  className="h-6 w-6 text-green-500"
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
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Worksheet Builder
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Drag and drop questions to create custom worksheets. Organize
                and arrange with ease.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
                <svg
                  className="h-6 w-6 text-purple-500"
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
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                PDF Export
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Export professional worksheets with separate answer keys.
                Print-ready and beautifully formatted.
              </p>
            </div>
          </div>
        </section>

        {/* Subjects Section */}
        <section className="mt-32">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Subjects We Support
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: "Math", icon: "calculator", urdu: "ریاضی" },
              { name: "English", icon: "book-open", urdu: "انگلش" },
              { name: "Science", icon: "flask", urdu: "سائنس" },
              { name: "Urdu", icon: "pen-tool", urdu: "اردو" },
              { name: "Islamiyat", icon: "moon", urdu: "اسلامیات" },
              { name: "General Knowledge", icon: "globe", urdu: "عمومی علم" },
            ].map((subject) => (
              <div
                key={subject.name}
                className="bg-white dark:bg-gray-800 px-6 py-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-3"
              >
                <span className="text-2xl">{getSubjectEmoji(subject.name)}</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {subject.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {subject.urdu}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 mt-32 py-12">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>Built with AI for Educators</p>
          <p className="mt-2 text-sm">
            QuestionForge - Making exam creation effortless
          </p>
        </div>
      </footer>
    </div>
  );
}

function getSubjectEmoji(name: string): string {
  const emojis: Record<string, string> = {
    Math: "calculator-icon",
    English: "book-icon",
    Science: "flask-icon",
    Urdu: "pen-icon",
    Islamiyat: "moon-icon",
    "General Knowledge": "globe-icon",
  };

  // Return actual emojis for display
  const emojiMap: Record<string, string> = {
    Math: "🔢",
    English: "📚",
    Science: "🔬",
    Urdu: "✍️",
    Islamiyat: "☪️",
    "General Knowledge": "🌍",
  };

  return emojiMap[name] || "📋";
}
