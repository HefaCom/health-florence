
import { useState } from "react";
import { Auth } from "aws-amplify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EmailVerificationProps {
  email: string;
  onVerified: () => void;
  onCancel: () => void;
}

export const EmailVerification = ({ email, onVerified, onCancel }: EmailVerificationProps) => {
  const [verificationCode, setVerificationCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendingCode, setResendingCode] = useState(false);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) {
      toast.error("Please enter verification code");
      return;
    }

    setIsSubmitting(true);
    try {
      await Auth.confirmSignUp(email, verificationCode);
      toast.success("Email verified successfully!");
      onVerified();
    } catch (error) {
      console.error("Verification error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to verify email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendVerificationCode = async () => {
    setResendingCode(true);
    try {
      await Auth.resendSignUp(email);
      toast.success("Verification code resent to your email");
    } catch (error) {
      console.error("Resend code error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to resend code. Please try again.");
    } finally {
      setResendingCode(false);
    }
  };

  return (
    <div className="p-6 bg-card rounded-md shadow-md">
      <h2 className="text-xl font-bold mb-4">Verify Your Email</h2>
      <p className="text-muted-foreground mb-6">
        We've sent a verification code to {email}. Please enter it below to verify your email.
      </p>

      <form onSubmit={handleVerification} className="space-y-4">
        <Input
          type="text"
          placeholder="Verification Code"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          required
        />

        <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={resendingCode}
            onClick={resendVerificationCode}
            className="order-2 sm:order-1"
          >
            {resendingCode && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Resend Code
          </Button>

          <div className="flex gap-2 order-1 sm:order-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !verificationCode}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Verify
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
