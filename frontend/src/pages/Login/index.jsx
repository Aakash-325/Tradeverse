import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle"; // ✅ imported

const Login = () => {
  return (
    <div className="min-h-screen flex justify-center items-center bg-muted px-4 relative">
      {/* Theme Toggle Top-Right */}
      <div className="fixed top-5 right-5 z-50">
        <ThemeToggle />
      </div>

      {/* Container */}
      <div className="w-full max-w-5xl flex flex-col lg:flex-row rounded-xl shadow-md overflow-hidden bg-white dark:bg-zinc-900">

        {/* Left Section */}
        <div className="w-full lg:w-1/2 bg-gray-100 dark:bg-zinc-800 p-10 flex flex-col justify-center">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">
            Log in to continue trading, track your portfolio, and explore the crypto world.
          </p>
        </div>

        {/* Right Form */}
        <div className="w-full lg:w-1/2 p-8 flex justify-center items-center">
          <Card className="w-full max-w-sm shadow-none border-none bg-transparent">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Login</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-1">
              <Input
                placeholder="Email"
                type="email"
                className="h-12 text-base"
              />
              <Input
                placeholder="Password"
                type="password"
                className="h-12 text-base"
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-4 mt-4">
              <Button className="w-full h-12 text-base">Login</Button>
              <p className="text-sm text-center text-muted-foreground">
                Don’t have an account?{" "}
                <Link to="/register" className="text-primary underline">
                  Create Account
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
