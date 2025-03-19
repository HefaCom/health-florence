
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FloLogo } from "@/components/FloLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Password reset instructions sent to your email");
    setIsSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <img 
          src="/lovable-uploads/d66d44af-2963-485a-af75-173d1dc55766.png" 
          alt="Landscape background" 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Container */}
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
            
            <h1 className="text-2xl font-bold text-center">Forgot Password</h1>
            
            {!submitted ? (
              <>
                <p className="text-center text-muted-foreground mt-2 mb-6">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    Send Reset Instructions
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h2 className="text-xl font-medium mb-2">Check Your Email</h2>
                <p className="text-muted-foreground mb-4">
                  We've sent password reset instructions to {email}
                </p>
                <Button 
                  variant="outline" 
                  className="rounded-full"
                  onClick={() => navigate("/login")}
                >
                  Back to Login
                </Button>
              </div>
            )}
            
            <div className="mt-6 text-center text-sm">
              <Link to="/login" className="font-medium text-primary hover:underline">
                Back to login
              </Link>
            </div>
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
