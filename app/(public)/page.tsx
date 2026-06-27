import { HomePage } from "../pages/HomePage";
import { ShortlistProvider } from "../hooks/useShortlist";

export default function Home() {
  return (
    <ShortlistProvider>
      <HomePage />
    </ShortlistProvider>
  );
}