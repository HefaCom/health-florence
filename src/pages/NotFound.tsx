
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FloLogo } from "@/components/FloLogo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <FloLogo className="w-24 h-24 mb-6" />
      <h1 className="text-6xl font-bold mb-4 neon-text">404</h1>
      <p className="text-xl text-muted-foreground mb-8 text-center max-w-md">
        Oops! It seems like Florence can't find the page you're looking for.
      </p>
      <Button
        asChild
        size="lg"
        className="rounded-full px-8 animate-pulse-glow"
      >
        <a href="/">Return to Dashboard</a>
      </Button>
    </div>
  );
};

export default NotFound;
