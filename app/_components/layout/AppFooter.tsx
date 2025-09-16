import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="border-t border-gray-100 bg-white/80 py-8 text-sm text-gray-500">
      <div className="container mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>&copy; {new Date().getFullYear()} staybook. Crafted for modern hosts.</p>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/host" className="hover:text-gray-800">
            Host resources
          </Link>
          <Link href="/dashboard/messages" className="hover:text-gray-800">
            Support
          </Link>
          <Link href="/privacy" className="hover:text-gray-800">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
