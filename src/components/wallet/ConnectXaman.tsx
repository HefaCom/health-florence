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
    const payloadUuidRef = useRef<string | null>(null);

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

        // Unsubscribe from payload if needed
        if (payloadUuidRef.current) {
            // XUMM SDK handles unsubscription automatically on resolution usually,
            // but we clear our ref
            payloadUuidRef.current = null;
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
            // Create a SignIn payload
            const payload = await xumm.payload.create({
                TransactionType: 'SignIn'
            });

            if (!payload || !payload.uuid || !payload.next || !payload.refs) {
                throw new Error('Failed to create login payload');
            }

            console.log('✅ XUMM Payload created:', payload.uuid);
            payloadUuidRef.current = payload.uuid;

            // Check if on mobile device
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

            if (isMobile) {
                // On mobile, try to open deep link
                window.location.href = payload.next.always;
            } else {
                // On desktop, show QR code
                setQrUrl(payload.refs.qr_png);
                setShowDialog(true);
            }

            // Set timeout for the entire connection process
            timeoutRef.current = setTimeout(() => {
                cleanup();
                setShowDialog(false);
                toast.error('Connection timeout. Please try again.');
            }, 5 * 60 * 1000); // 5 minutes

            // Subscribe to payload status
            console.log('📡 Subscribing to payload status...');
            const subscription = await xumm.payload.subscribe(payload, async (event) => {
                // Determine if signed based on the event data structure from XUMM SDK
                // The event object is the Payload subscription message
                console.log('📨 XUMM Event:', event);

                if (typeof event.data === 'object' && event.data !== null && 'signed' in event.data) {
                    const signed = (event.data as any).signed;

                    // Allow the final callback to handle the completion logic
                    // We just return true to close the subscription if signed is explicitly boolean or available
                    return signed === true || signed === false;
                }
                return false; // Keep listening
            });

            // Wait for resolution
            console.log('⏳ Waiting for resolution...');
            const result = await subscription.resolved as any;
            console.log('✅ XUMM Payload resolved:', result);

            if (result && result.signed === true) {
                // Fetch the payload details to get the user token/account if not in result
                // The 'result' from subscription often has limited info, let's fetch full payload

                // However, subscription.resolved usually returns the payload result.
                // Let's safe-guard by fetching fresh payload info if needed, or use what we have.
                // For SignIn, we need the user account (account) and User Token (user_token) 

                // Fetch the full payload result to be sure we have the user token (JWT equivalent context)
                const payloadResult = await xumm.payload.get(payload.uuid);

                if (!payloadResult || !payloadResult.response || !payloadResult.response.account) {
                    throw new Error('Could not retrieve account details from payload');
                }

                const account = payloadResult.response.account;
                const userToken = payloadResult.application.issued_user_token;

                if (!user?.id) {
                    throw new Error('User not authenticated');
                }

                console.log(`🔗 Linking account ${account} to user ${user.id}`);

                // Link the wallet to user account
                await walletService.linkXamanWallet(user.id, {
                    address: account,
                    token: userToken || '', // This is the user specific token for future push/requests
                    uui: payloadResult.response.user || ''
                });

                toast.success(`✅ Xaman wallet connected: ${account.slice(0, 8)}...${account.slice(-6)}`);
                cleanup();
                setShowDialog(false);
                onConnected(); // Notify parent to refresh
            } else {
                // User rejected or unsigned
                // toast.error('Connection rejected in Xaman app');
                // The subscription resolves even on rejection, so we check signed status
                if (result.signed === false) {
                    toast.error('Connection rejected');
                }
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
