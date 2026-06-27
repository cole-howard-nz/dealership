import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ShortlistProvider } from "../hooks/useShortlist";
import { ToastProvider } from "../hooks/useToast";
import { auth } from "../lib/auth";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isAdmin = !!(session?.user?.role);

  return (
    <ShortlistProvider>
      <ToastProvider>
        <div className="flex min-h-screen flex-col">
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-accent text-white px-3 py-2 rounded-sm z-50"
          >
            Skip to content
          </a>
          <Header isAdmin={isAdmin} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </ToastProvider>
    </ShortlistProvider>
  );
}