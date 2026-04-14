import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";
import { useBackground } from "@/lib/backgroundContext";

export default function PageShell({ children }: { children: ReactNode }) {
  const { backgroundUrl, backgroundOpacity } = useBackground();

  return (
    <div className="min-h-screen bg-background relative">
      {backgroundUrl && (
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0 pointer-events-none"
          style={{
            backgroundImage: `url(${backgroundUrl})`,
            opacity: backgroundOpacity,
          }}
        />
      )}
      <AppSidebar />
      <main className="ml-56 p-6 relative z-10">{children}</main>
    </div>
  );
}
