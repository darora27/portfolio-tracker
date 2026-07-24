import { DepthPullProvider } from "@/components/surface/DepthPull";

// Scopes the DepthPullProvider client boundary (and the react-dom
// hydration it pulls in) to only the routes that actually render
// <DepthPull>/useDepthPull: /, /share, /dev/surface-scratch. Every other
// route (e.g. /dashboard, /share/full, /dev/phase10-spike-css) is outside
// this route group and stays free of the provider's client JS entirely.
export default function DepthPullLayout({ children }: { children: React.ReactNode }) {
  return <DepthPullProvider>{children}</DepthPullProvider>;
}
