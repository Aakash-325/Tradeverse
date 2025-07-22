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
import ThemeToggle from "@/components/ThemeToggle"; // ✅ Import

const Register = () => {
  return (
    <div className="min-h-screen flex justify-center items-center bg-muted px-4 relative">

      {/* Theme Switcher Top-Right */}
      <div className="fixed top-5 right-5 z-50">
        <ThemeToggle /> {/* ✅ Use reusable component */}
      </div>

      {/* Register Container */}
      <div className="relative w-full max-w-5xl flex flex-col lg:flex-row rounded-xl shadow-md overflow-hidden bg-white dark:bg-zinc-900">

        {/* Left Panel */}
        <div className="w-full lg:w-1/2 bg-gray-100 dark:bg-zinc-800 p-10 flex flex-col justify-center">
          <h1 className="text-3xl font-bold mb-2">TradeVerse</h1>
          <p className="text-muted-foreground">
            Step into the world of virtual crypto trading. Practice, learn, and
            grow your trading skills — risk-free.
          </p>
        </div>

        {/* Register Form */}
        <div className="w-full lg:w-1/2 p-8 flex justify-center items-center">
          <Card className="w-full max-w-sm shadow-none border-none bg-transparent">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Sign up for Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-1">
              <Input placeholder="Name" className="h-12 text-base" />
              <Input placeholder="Email" type="email" className="h-12 text-base" />
              <Input placeholder="Password" type="password" className="h-12 text-base" />
              <Input placeholder="Phone" className="h-12 text-base" />
              <Input placeholder="Country" className="h-12 text-base" />
            </CardContent>
            <CardFooter className="flex flex-col gap-4 mt-4">
              <Button className="w-full h-12 text-base">Register</Button>
              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary underline">
                  Login
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
