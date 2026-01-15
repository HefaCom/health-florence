import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FloLogo } from "@/components/FloLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Mail } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  // Get the redirect path from location state or default to home
  const from = (location.state as any)?.from?.pathname || "/";

  // Redirect if user is already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Redirect to appropriate dashboard based on user role
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "expert") {
        navigate("/expert/dashboard");
      } else {
        navigate(from);
      }
    }
  }, [isAuthenticated, user, isLoading, navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const success = await login(email, password);

    if (success) {
      // The redirect will be handled by the useEffect above
      // based on the user's role
    }

    setIsSubmitting(false);
  };

  const handleDemoLogin = async (role: "user" | "admin" | "expert") => {
    setIsSubmitting(true);
    if (role === "admin") {
      await login("abrahammirambeaux@gmail.com", "password123");
      // Navigation will be handled by useEffect
    } else if (role === "expert") {
      await login("nerdexpert1@gmail.com", "password123");
      // Navigation will be handled by useEffect
    } else {
      await login("mrstrillo@icloud.com", "password123");
      // Navigation will be handled by useEffect
    }
    setIsSubmitting(false);
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="relative min-h-screen overflow-hidden flex flex-col">
        <div className="flex flex-col items-center justify-center flex-1 px-4 py-12">
          <div className="w-full max-w-md bg-card/95 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Checking authentication...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <img
          src="/bg.jpg"
          alt="Landscape background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Login Container */}
      <div className="flex flex-col items-center justify-center flex-1 px-4 py-12">
        <div className="w-full max-w-md bg-card/95 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
          <div className="p-8">
            <div className="flex justify-center mb-4">
              <FloLogo className="w-24 h-24" />
            </div>

            <h1 className="text-3xl font-bold text-center mb-2">Nurse Help Me</h1>
            <p className="text-center text-muted-foreground mb-6">
              Access your personalized healthcare dashboard
            </p>
            {/* <div className="flex justify-center space-x-4 mb-6">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-muted-foreground">Patients</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-muted-foreground">Experts</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-xs text-muted-foreground">Admins</span>
              </div>
            </div> */}

            <form onSubmit={handleLogin} className="space-y-4 mt-8">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-full h-12"
                />
              </div>

              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-full h-12"
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded-full h-12"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Log In
              </Button>

              <div className="text-center">
                <Link
                  to="/forgot-password"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Forgot your password?
                </Link>
              </div>
            </form>

            <div className="mt-6 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                {/* <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div> */}
              </div>

              <div className="mt-6 flex flex-col space-y-3">
                {/* <Button variant="outline" className="rounded-full h-12">
                  <Mail className="mr-2 h-5 w-5" />
                  Login with Google
                </Button> */}

                <div className="flex text-sm justify-center">
                  <span className="text-muted-foreground">Don't have an account?</span>
                  <Link to="/register" className="ml-1 font-medium text-primary hover:underline ">
                    Sign up
                  </Link>
                </div>
              </div>
            </div>

            {/* Demo Credentials - for development only */}
            {/* <div className="mt-8 border-t border-border pt-4">
              <p className="text-xs text-center text-muted-foreground mb-2">Quick Access (Demo)</p>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 h-8 text-xs border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                  onClick={() => handleDemoLogin("user")}
                  disabled={isSubmitting}
                >
                  Patient
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 h-8 text-xs border-green-200 hover:bg-green-50 hover:border-green-300"
                  onClick={() => handleDemoLogin("expert")}
                  disabled={isSubmitting}
                >
                  Expert
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 h-8 text-xs border-purple-200 hover:bg-purple-50 hover:border-purple-300"
                  onClick={() => handleDemoLogin("admin")}
                  disabled={isSubmitting}
                >
                  Admin
                </Button>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">
                Patient • Expert • Admin
              </p>
            </div> */}
          </div>

          {/* Footer */}
          <div className="bg-muted/50 p-4 text-center text-xs text-muted-foreground">
            <p>By Health AI</p>
            <p className="mt-1 text-[10px]">
              This system and the records it contains are the property of Health AI and are subject to security monitoring
            </p>
          </div>
        </div>

        {/* Theme toggle */}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default Login;