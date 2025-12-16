import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import { walletService } from "@/services/wallet.service";
import { useAuth } from "@/contexts/AuthContext";
import { xumm } from "@/lib/wallet/xaman";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface ConnectXamanProps {
    onConnected: () => void;
}

export function ConnectXaman({ onConnected }: ConnectXamanProps) {
    const { user } = useAuth();
    const [isConnecting, setIsConnecting] = useState(false);
    const [qrUrl, setQrUrl] = useState<string | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<number>(300); // 5 minutes in seconds

    // Use refs to track cleanup state
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);

    // Cleanup function to prevent memory leaks
    const cleanup = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }

        setQrUrl(null);
        setIsConnecting(false);
        setError(null);
        setTimeRemaining(300);
    };


    // Clean up on unmount or dialog close
    useEffect(() => {
        if (!showDialog) {
            cleanup();
        }

        return () => {
            cleanup();
        };
    }, [showDialog]);

    // Countdown timer for QR code expiration
    useEffect(() => {
        if (showDialog && qrUrl && timeRemaining > 0) {
            countdownRef.current = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        cleanup();
                        setShowDialog(false);
                        toast.error('QR code expired. Please try again.');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (countdownRef.current) {
                clearInterval(countdownRef.current);
            }
        };
    }, [showDialog, qrUrl, timeRemaining]);

    const handleConnect = async () => {
        setIsConnecting(true);
        setError(null);

        try {
            // Use xumm.authorize() for browser-based sign-in
            // This is the recommended method for frontend applications
            const authorization = await xumm.authorize();

            if (!authorization) {
                throw new Error('Failed to initiate authorization');
            }

            console.log('✅ XUMM authorization initiated:', authorization);

            // Check if on mobile device
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

            if (isMobile && authorization.next?.always) {
                // On mobile, open deep link directly
                window.location.href = authorization.next.always;
            } else {
                // On desktop, show QR code
                if (!authorization.qr) {
                    throw new Error('QR code not available');
                }
                setQrUrl(authorization.qr);
                setShowDialog(true);
            }

            // Set timeout for the entire connection process
            timeoutRef.current = setTimeout(() => {
                cleanup();
                setShowDialog(false);
                toast.error('Connection timeout. Please try again.');
            }, 5 * 60 * 1000); // 5 minutes

            // Wait for authorization to complete
            const result = await authorization.resolved;

            if (result) {
                // Successfully authorized
                console.log('✅ Xaman authorization completed:', result);

                const account = result.me;

                if (!account) {
                    throw new Error('No account address received from Xaman');
                }

                if (!user?.id) {
                    throw new Error('User not authenticated');
                }

                // Link the wallet to user account
                await walletService.linkXamanWallet(user.id, {
                    address: account,
                    token: result.jwt || '',
                    uui: result.sub || ''
                });

                toast.success(`✅ Xaman wallet connected: ${account.slice(0, 8)}...${account.slice(-6)}`);
                cleanup();
                setShowDialog(false);
                onConnected();
            } else {
                // User rejected the request
                toast.error('Connection rejected in Xaman app');
                cleanup();
                setShowDialog(false);
            }

        } catch (error) {
            console.error('Xaman Connection Error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to initiate Xaman connection';
            setError(errorMessage);
            toast.error(errorMessage);
            setIsConnecting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <>
            <Button
                variant="outline"
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full flex items-center justify-center gap-2"
            >
                {isConnecting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                    </svg>
                )}
                {isConnecting ? 'Connecting...' : 'Connect Xaman'}
            </Button>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center">Scan with Xaman</DialogTitle>
                        <DialogDescription className="text-center">
                            Open the Xaman app on your phone and scan this QR code to connect your wallet
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center p-6 space-y-4">
                        {error ? (
                            <div className="flex flex-col items-center gap-3 text-center">
                                <div className="p-3 bg-red-100 rounded-full">
                                    <AlertCircle className="w-8 h-8 text-red-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-red-900 mb-1">Connection Failed</p>
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                                <Button
                                    onClick={() => {
                                        setShowDialog(false);
                                        setError(null);
                                    }}
                                    variant="outline"
                                    className="mt-2"
                                >
                                    Close
                                </Button>
                            </div>
                        ) : qrUrl ? (
                            <>
                                <div className="relative">
                                    <img
                                        src={qrUrl}
                                        alt="Scan to sign in"
                                        className="w-64 h-64 rounded-lg shadow-sm border"
                                    />
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-sm text-gray-500 max-w-xs">
                                        Waiting for approval in Xaman app...
                                    </p>
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                                        <p className="text-xs text-gray-400">
                                            Expires in {formatTime(timeRemaining)}
                                        </p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
                                <p className="text-sm text-gray-500">Generating QR code...</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

