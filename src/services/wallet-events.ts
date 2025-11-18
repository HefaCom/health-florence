export type WalletBalanceEventDetail = {
  userId: string;
};

type BalanceHandler = (detail: WalletBalanceEventDetail) => void;

class WalletEventBus {
  private balanceHandlers = new Set<BalanceHandler>();

  onBalanceUpdated(handler: BalanceHandler) {
    this.balanceHandlers.add(handler);
    return () => {
      this.balanceHandlers.delete(handler);
    };
  }

  emitBalanceUpdated(userId: string) {
    this.balanceHandlers.forEach((handler) => handler({ userId }));
  }
}

export const walletEvents = new WalletEventBus();


