import React, { useState, useEffect } from "react";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignupForm";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient"; 

interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate(); 

  // Auto-redirect if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (session) {
        navigate("/"); // ✅ Redirect to main page
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (email: string, password: string) => {
    // At this point, LoginForm already ensured restaurant exists + stored restaurant_id
    navigate("/");
    onLogin(email, password);
  };

  const handleSignUp = (name: string, email: string, password: string) => {
    // SignupForm already creates restaurant + stores restaurant_id
    navigate("/");
    onLogin(email, password);
  };

  const switchToSignUp = () => setIsSignUp(true);
  const switchToLogin = () => setIsSignUp(false);

  if (isSignUp) {
    return (
      <SignUpForm
        onSignUp={handleSignUp}
        onSwitchToLogin={switchToLogin}
      />
    );
  }

  return (
    <LoginForm
      onLogin={handleLogin}
      onSwitchToSignUp={switchToSignUp}
    />
  );
};

export default LoginPage;
