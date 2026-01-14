import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Logout() {
  const { logout } = useAuth();
  const hasLoggedOut = useRef(false);

  useEffect(() => {
    if (!hasLoggedOut.current) {
      hasLoggedOut.current = true;
      logout();
    }
  }, [logout]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Saindo...</p>
    </div>
  );
}
