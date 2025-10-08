import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import LoadingPage from "./LoadingPage";
import { supabase } from "@/lib/supabaseClient";

interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  onSwitchToSignUp: () => void;
}

const LoginForm = ({ onLogin, onSwitchToSignUp }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    // 1. Attempt login via Supabase Auth
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setIsLoading(false);
      setError(loginError.message);
      return;
    }

    // 2. Get the logged-in user
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) {
      setIsLoading(false);
      setError("Unable to retrieve user ID after login.");
      return;
    }

    // 3. Check if a restaurant already exists
    const { data: existingRestaurant, error: fetchError } = await supabase
      .from("restaurants")
      .select("id")
      .eq("owner_id", userId)
      .maybeSingle();

    if (fetchError) {
      setIsLoading(false);
      setError("Failed to check restaurant for this user.");
      return;
    }

    let restaurantId = existingRestaurant?.id;

    // 4. If no restaurant exists, create one
    if (!restaurantId) {
      const { data: restaurantData, error: restaurantError } = await supabase
        .from("restaurants")
        .insert([
          {
            name: "My Restaurant", // default name if none exists
            owner_id: userId,
          },
        ])
        .select()
        .single();

      if (restaurantError) {
        setIsLoading(false);
        console.error("Restaurant creation failed:", restaurantError.message);
        setError(`Failed to create restaurant: ${restaurantError.message}`);
        return;
      }

      restaurantId = restaurantData.id;
    }

    // 5. Save restaurant_id to localStorage
    if (restaurantId) {
      localStorage.setItem("restaurant_id", restaurantId);
    }

    setIsLoading(false);

    // 6. Trigger post-login behavior (redirect etc.)
    onLogin(email, password);
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Gerald the Mouse Header */}
        <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <img
            src="/LogoNoBackground.png"
            alt="Gerald's Kitchen Logo"
            className="h-28 w-28 object-contain"
          />
        </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Gerald's Kitchen
          </h1>
          <p className="text-gray-600 text-lg">
            Prep Management System
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center text-gray-800">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Sign in to access your kitchen management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-800 font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="chef@restaurant.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-gray-300 focus:border-black focus:ring-0"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-800 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 border-gray-300 focus:border-black focus:ring-0"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-[#8B5E3C] hover:bg-[#6E462B] text-white font-medium"
                disabled={isLoading}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-center text-sm text-gray-600">
                <p className="mb-2">Demo Credentials:</p>
                <p className="font-mono bg-orange-50 px-3 py-2 rounded mb-4">
                  Email: chef@demo.com<br />
                  Password: demo123
                </p>
                <p className="text-gray-500">
                  Don't have an account?{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-[#C49A6C] hover:text-[#A67C52] font-medium"
                    onClick={() => {
                      console.log("Sign up clicked");
                      onSwitchToSignUp();
                    }}
                  >
                    Sign up here
                  </Button>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>© 2024 Gerald's Kitchen Management System</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;

