import { userService } from './user.service';

export interface JoeyWalletLink {
  address: string;
  chain: string;
  connectedAt: string;
  sessionTopic?: string;
  relayProtocol?: string;
  projectId?: string;
  metadata?: {
    name?: string;
    description?: string;
    url?: string;
    icon?: string;
  };
  verified?: boolean;
  verification?: {
    method?: string;
    at?: string;
  };
  lastKnownBalances?: Record<string, any>;
  lastBalanceSyncedAt?: string;
}

type Preferences = Record<string, any> & {
  wallets?: {
    joey?: JoeyWalletLink;
    [key: string]: any;
  };
};

class WalletService {
  private normalizePreferences(prefs: any): Preferences {
    if (!prefs) return {};
    if (typeof prefs === 'string') {
      try {
        return JSON.parse(prefs);
      } catch {
        return {};
      }
    }
    if (typeof prefs === 'object') {
      return { ...prefs };
    }
    return {};
  }

  async getJoeyWallet(userId: string) {
    const user = await userService.getUser(userId);
    if (!user) return null;
    const preferences = this.normalizePreferences(user.preferences);
    return preferences.wallets?.joey || null;
  }

  async linkJoeyWallet(userId: string, wallet: JoeyWalletLink) {
    const user = await userService.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const preferences = this.normalizePreferences(user.preferences);
    const wallets = { ...(preferences.wallets || {}) };
    wallets.joey = wallet;

    const nextPreferences: Preferences = {
      ...preferences,
      wallets,
    };

    await userService.updateUser({
      id: userId,
      preferences: nextPreferences,
    });

    return nextPreferences.wallets?.joey || null;
  }

  async unlinkJoeyWallet(userId: string) {
    const user = await userService.getUser(userId);
    if (!user) return null;

    const preferences = this.normalizePreferences(user.preferences);
    if (!preferences.wallets?.joey) {
      return null;
    }

    const wallets = { ...(preferences.wallets || {}) };
    delete wallets.joey;

    if (Object.keys(wallets).length === 0) {
      delete preferences.wallets;
    } else {
      preferences.wallets = wallets;
    }

    await userService.updateUser({
      id: userId,
      preferences,
    });

    return null;
  }
}

export const walletService = new WalletService();


