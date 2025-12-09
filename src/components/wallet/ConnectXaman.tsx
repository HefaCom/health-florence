import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { walletService } from "@/services/wallet.service";
import { useAuth } from "@/contexts/AuthContext";
import { xumm } from "@/lib/wallet/xaman";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface ConnectXamanProps {
    onConnected: () => void;
}

export function ConnectXaman({ onConnected }: ConnectXamanProps) {
    const { user } = useAuth();
    const [isConnecting, setIsConnecting] = useState(false);
    const [qrUrl, setQrUrl] = useState<string | null>(null);
    const [showDialog, setShowDialog] = useState(false);

    // Clean up subscription on unmount or dialog close
    useEffect(() => {
        if (!showDialog) {
            setQrUrl(null);
            setIsConnecting(false);
        }
    }, [showDialog]);

    const handleConnect = async () => {
        setIsConnecting(true);
        try {
            // Create a pseudo-transaction for Sign In
            const payload = await xumm.payload.create({
                txjson: {
                    TransactionType: 'SignIn'
                },
                options: {
                    submit: false, // Don't submit to ledger, just sign/auth
                    expire: 5 // Expires in 5 minutes
                }
            });

            if (payload && payload.uuid) {
                // If on mobile, open deep link directly
                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                if (isMobile && payload.next.always) {
                    window.location.href = payload.next.always;
                } else {
                    // On desktop, show QR code
                    if (payload.refs.qr_png) {
                        setQrUrl(payload.refs.qr_png);
                        setShowDialog(true);
                    }
                }

                // Subscribe to payload status
                const subscription = await xumm.payload.subscribe(payload.uuid, async (event) => {
                    if (event.data.signed === true) {
                        // Signed successfully
                        console.log('Xaman Signed Payload:', event.data);

                        // Fetch the payload result to get user info (account, etc.)
                        const result = await xumm.payload.get(payload.uuid);
                        const account = result?.response.account;
                        const userToken = result?.application.issued_user_token;

                        if (account && user?.id) {
                            await walletService.linkXamanWallet(user.id, {
                                address: account,
                                token: userToken || '', // Future usage
                                uui: result?.response.user || '' // User Unique Identifier if available
                            });

                            toast.success(`Connected Xaman: ${account}`);
                            setShowDialog(false);
                            onConnected();
                        }
                    } else if (event.data.signed === false) {
                        // Rejected
                        toast.error('Connection rejected by user');
                        setShowDialog(false);
                        setIsConnecting(false);
                    }
                });

            } else {
                throw new Error('Failed to create login payload');
            }

        } catch (error) {
            console.error('Xaman Connection Error:', error);
            toast.error('Failed to initiate Xaman connection');
            setIsConnecting(false);
        }
    };

    return (
        <>
            <Button
                variant="outline"
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full flex items-center justify-center gap-2"
            >
                {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> :
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                    </svg>
                }
                Connect Xaman
            </Button>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center">Scan with Xaman</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center p-6 space-y-4">
                        {qrUrl ? (
                            <div className="relative">
                                <img
                                    src={qrUrl}
                                    alt="Scan to sign in"
                                    className="w-64 h-64 rounded-lg shadow-sm border"
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    {/* Center logo overlay if desired, usually QR has it */}
                                </div>
                            </div>
                        ) : (
                            <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
                        )}
                        <p className="text-center text-sm text-gray-500 max-w-xs">
                            Open the Xaman app on your phone and scan this QR code to sign in.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

