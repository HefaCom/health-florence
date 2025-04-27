
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FloLogo } from "@/components/FloLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Auth } from "aws-amplify";


const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      // Sign up with AWS Cognito
      const { user } = await Auth.signUp({
        username: email,
        password,
        attributes: {
          name: fullName,
          email: email
        }
      });
      
      toast.success("Account created successfully! Please verify your email to continue.");
      navigate("/login");
    } catch (error) {
      console.error("Error signing up:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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

      {/* Register Container */}
      <div className="flex flex-col items-center justify-center flex-1 px-4 py-12">
        <div className="w-full max-w-md bg-card/95 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate("/login")}
                className="rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <FloLogo className="w-16 h-16" />
              <div className="w-10"></div> {/* Empty div for flex spacing */}
            </div>

            <h1 className="text-2xl font-bold text-center mb-6">Create an Account</h1>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="rounded-full h-12"
                />
              </div>

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

              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or register with</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="mt-6 w-full rounded-full h-12"
              >
                <Mail className="mr-2 h-5 w-5" />
                Sign up with Google
              </Button>

              <div className="mt-6 text-sm">
                <span className="text-muted-foreground">Already have an account?</span>
                <Link to="/login" className="ml-1 font-medium text-primary hover:underline">
                  Log in
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-muted/50 p-4 text-center text-xs text-muted-foreground">
            <p>By signing up, you agree to our Terms of Service and Privacy Policy</p>
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

export default Register;
