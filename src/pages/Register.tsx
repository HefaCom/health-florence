import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FloLogo } from "@/components/FloLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";


const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const navigate = useNavigate();
  const { register, confirmRegistration } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await register(email, password, fullName);

      if (result.success) {
        setVerificationSent(true);
        toast.success("Please check your email for the verification code");
      } else if (result.error === "User already exists") {
        toast.error("This email is already registered. Please login or use a different email.");
      } else {
        toast.error(result.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setIsSubmitting(true);
    try {
      const result = await register(email, password, fullName);
      if (result.success) {
        toast.success("Verification code resent. Please check your email.");
      } else {
        toast.error("Failed to resend verification code. Please try again.");
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      toast.error("Failed to resend verification code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const success = await confirmRegistration(email, verificationCode);

      if (success) {
        toast.success("Email verified successfully! You can now login.");
        navigate("/login");
      } else {
        toast.error("Verification failed. Please check the code and try again.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Verification failed. Please try again.");
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

            <h1 className="text-2xl font-bold text-center mb-6">
              {verificationSent ? "Verify Your Email" : "Create an Account"}
            </h1>

            {!verificationSent ? (
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
            ) : (
              <form onSubmit={handleConfirmRegistration} className="space-y-4">
                <p className="text-center text-muted-foreground mb-4">
                  We've sent a verification code to {email}. Please enter it below to verify your account.
                </p>

                <div className="space-y-2">
                  <Input
                    placeholder="Verification Code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
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
                  Verify Email
                </Button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    className="text-sm text-primary hover:underline"
                    disabled={isSubmitting}
                  >
                    Didn't receive the code? Resend
                  </button>
                </div>
              </form>
            )}

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