import { useEffect } from "react";

export default function Logout() {
  useEffect(() => {
    const doLogout = async () => {
      try {
        await fetch("/api/auth/logout", { 
          method: "POST", 
          credentials: "include" 
        });
      } catch (e) {
        // Ignore errors
      }
      // Force full page reload to clear all state
      window.location.href = "/";
    };
    doLogout();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Saindo...</p>
    </div>
  );
}
