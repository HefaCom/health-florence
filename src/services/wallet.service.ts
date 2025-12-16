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

export interface XamanWalletLink {
  address: string;
  token?: string; // JWT or access token if needed
  uui?: string;   // User Unique Identifier
  linkedAt: string;
}

export interface CustodialWallet {
  address: string;
  seed: string;
  createdAt: string;
  lastUsedAt: string;
}

type Preferences = Record<string, any> & {
  wallets?: {
    joey?: JoeyWalletLink;
    xaman?: XamanWalletLink; // Added Xaman wallet
    custodial?: CustodialWallet;
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

  async linkXamanWallet(userId: string, wallet: Omit<XamanWalletLink, 'linkedAt'>) {
    console.log(`[WalletService] Linking Xaman wallet for user: ${userId}`, wallet);
    const user = await userService.getUser(userId);
    if (!user) {
      console.error(`[WalletService] User not found: ${userId}`);
      throw new Error('User not found');
    }

    const preferences = this.normalizePreferences(user.preferences);
    console.log(`[WalletService] Current preferences for ${userId}:`, preferences);

    const wallets = { ...(preferences.wallets || {}) };
    wallets.xaman = {
      ...wallet,
      linkedAt: new Date().toISOString()
    };

    const nextPreferences: Preferences = {
      ...preferences,
      wallets,
    };

    console.log(`[WalletService] Updating user ${userId} with new preferences:`, nextPreferences);

    await userService.updateUser({
      id: userId,
      preferences: nextPreferences,
    });

    console.log(`[WalletService] Successfully linked Xaman wallet for ${userId}`);
    return nextPreferences.wallets?.xaman || null;
  }

  async getXamanWallet(userId: string): Promise<XamanWalletLink | null> {
    console.log(`[WalletService] Getting Xaman wallet for user: ${userId}`);
    const user = await userService.getUser(userId);
    if (!user) {
      console.warn(`[WalletService] User not found during getXamanWallet: ${userId}`);
      return null;
    }
    const preferences = this.normalizePreferences(user.preferences);
    const wallet = preferences.wallets?.xaman || null;
    console.log(`[WalletService] Found Xaman wallet for ${userId}:`, wallet ? 'Yes' : 'No', wallet);
    return wallet;
  }

  async unlinkXamanWallet(userId: string) {
    const user = await userService.getUser(userId);
    if (!user) return null;

    const preferences = this.normalizePreferences(user.preferences);
    if (!preferences.wallets?.xaman) {
      return null;
    }

    const wallets = { ...(preferences.wallets || {}) };
    delete wallets.xaman;

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

  async getCustodialWallet(userId: string): Promise<CustodialWallet | null> {
    const user = await userService.getUser(userId);
    if (!user) return null;
    const preferences = this.normalizePreferences(user.preferences);
    return preferences.wallets?.custodial || null;
  }

  async saveCustodialWallet(userId: string, wallet: CustodialWallet, merge: boolean = false) {
    const user = await userService.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const preferences = this.normalizePreferences(user.preferences);
    const existing = preferences.wallets?.custodial;

    const nextWallet: CustodialWallet = merge && existing
      ? { ...existing, ...wallet }
      : wallet;

    const wallets = {
      ...(preferences.wallets || {}),
      custodial: nextWallet,
    };

    const nextPreferences: Preferences = {
      ...preferences,
      wallets,
    };

    await userService.updateUser({
      id: userId,
      preferences: nextPreferences,
    });

    return nextWallet;
  }
}

export const walletService = new WalletService();


