import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import { useEffect, useState, Suspense, lazy } from "react";
import type { ReactNode } from "react";

import appCss from "~/styles/app.css?url";

const ChatBot = lazy(() => import("../components/ChatBot").then(m => ({ default: m.ChatBot })));

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Reply AI — AI-Powered Lead Conversion for Local Businesses" },
      { name: "description", content: "Reply AI helps local businesses capture every lead and book appointments automatically with AI-powered follow-up systems." },
      { name: "format-detection", content: "telephone=yes" },
      { name: "theme-color", content: "#4f46e5" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "mobile-web-app-capable", content: "yes" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💬</text></svg>" }
    ],
  }),
  notFoundComponent: () => <div>Page not found</div>,
  component: RootComponent,
});

function RootComponent() {
  const [showChat, setShowChat] = useState(false);
  useEffect(() => { setShowChat(true); }, []);

  return (
    <RootDocument>
      <Outlet />
      {showChat && (
        <Suspense fallback={null}>
          <ChatBot />
        </Suspense>
      )}
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}