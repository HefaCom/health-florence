
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FloLogo } from "@/components/FloLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { resetPassword, confirmResetPassword } from "aws-amplify/auth";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await resetPassword({ username: email });
      setCodeSent(true);
      toast.success("Verification code sent to your email");
    } catch (error) {
      console.error("Error sending code:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send verification code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: verificationCode,
        newPassword: newPassword
      });
      toast.success("Password reset successfully");
      navigate("/login");
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error(error instanceof Error ? error.message : "Failed to reset password. Please try again.");
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

      {/* Forgot Password Container */}
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
              {codeSent ? "Reset your password" : "Forgot your password?"}
            </h1>

            {!codeSent ? (
              <form onSubmit={handleSendCode} className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Enter your email address and we'll send you a code to reset your password.
                </p>
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

                <Button 
                  type="submit" 
                  className="w-full rounded-full h-12" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Send Reset Code
                </Button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Verification Code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                    className="rounded-full h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
                  Reset Password
                </Button>
              </form>
            )}

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Remember your password?</span>
              <Link to="/login" className="ml-1 font-medium text-primary hover:underline">
                Back to Login
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-muted/50 p-4 text-center text-xs text-muted-foreground">
            <p>By Health AI</p>
            <p className="mt-1 text-[10px]">
              This system and the records it contains are the property of Health AI
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

export default ForgotPassword;
