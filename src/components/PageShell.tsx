import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";

export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-56 p-6">{children}</main>
    </div>
  );
}
