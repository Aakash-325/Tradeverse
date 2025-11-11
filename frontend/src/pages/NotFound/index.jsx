import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white dark:bg-zinc-900 px-4">
      <div className="text-center max-w-lg">
        <div className="flex justify-center mb-6">
          <AlertTriangle className="w-24 h-24 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-6xl font-extrabold text-zinc-800 dark:text-white mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
          Page Not Found
        </h2>
        <p className="text-lg text-muted-foreground mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild size="lg">
          <Link to="/">← Back to Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
