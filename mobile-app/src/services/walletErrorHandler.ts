/**
 * Wallet Error Handler Service
 * 
 * Provides comprehensive error handling for Mobile Wallet Adapter operations
 * with user-friendly messages, troubleshooting steps, and recovery suggestions.
 * 
 * Requirement 4.8: Wallet connection error messages
 */

export enum WalletErrorCode {
  // Connection Errors
  USER_DECLINED = 'USER_DECLINED',
  WALLET_NOT_FOUND = 'WALLET_NOT_FOUND',
  CONNECTION_TIMEOUT = 'CONNECTION_TIMEOUT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHORIZATION_FAILED = 'AUTHORIZATION_FAILED',
  
  // Session Errors
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  SESSION_INVALID = 'SESSION_INVALID',
  REAUTHORIZATION_FAILED = 'REAUTHORIZATION_FAILED',
  
  // Transaction Errors
  TRANSACTION_REJECTED = 'TRANSACTION_REJECTED',
  TRANSACTION_TIMEOUT = 'TRANSACTION_TIMEOUT',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  SIGNING_FAILED = 'SIGNING_FAILED',
  
  // Game Session Errors
  GAME_SESSION_EXPIRED = 'GAME_SESSION_EXPIRED',
  GAME_SESSION_INVALID = 'GAME_SESSION_INVALID',
  MAX_SHOTS_REACHED = 'MAX_SHOTS_REACHED',
  
  // Wallet Compatibility Errors
  WALLET_INCOMPATIBLE = 'WALLET_INCOMPATIBLE',
  WALLET_OUTDATED = 'WALLET_OUTDATED',
  MWA_NOT_SUPPORTED = 'MWA_NOT_SUPPORTED',
  
  // Generic Errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export interface WalletError {
  code: WalletErrorCode;
  message: string;
  technicalDetails?: string;
  troubleshooting: string[];
  recovery: RecoveryAction[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  retryable: boolean;
}

export interface RecoveryAction {
  label: string;
  description: string;
  action: 'retry' | 'reconnect' | 'install_wallet' | 'check_network' | 'contact_support' | 'update_wallet' | 'restart_app';
  priority: 'primary' | 'secondary';
}

/**
 * Comprehensive error mapping with user-friendly messages and recovery steps
 */
const ERROR_MAPPINGS: Record<WalletErrorCode, Omit<WalletError, 'technicalDetails'>> = {
  // Connection Errors
  [WalletErrorCode.USER_DECLINED]: {
    code: WalletErrorCode.USER_DECLINED,
    message: 'You declined the wallet connection',
    troubleshooting: [
      'The connection request was cancelled or rejected in your wallet app',
      'This is normal if you chose not to connect',
      'You can try connecting again when ready',
    ],
    recovery: [
      {
        label: 'Try Again',
        description: 'Attempt to connect your wallet again',
        action: 'retry',
        priority: 'primary',
      },
      {
        label: 'Cancel',
        description: 'Stay disconnected for now',
        action: 'contact_support',
        priority: 'secondary',
      },
    ],
    severity: 'low',
    retryable: true,
  },

  [WalletErrorCode.WALLET_NOT_FOUND]: {
    code: WalletErrorCode.WALLET_NOT_FOUND,
    message: 'No compatible wallet app found',
    troubleshooting: [
      'Magic Roulette requires a Solana wallet app to play',
      'Compatible wallets: Phantom, Solflare, Backpack, or Seed Vault',
      'Make sure you have at least one wallet app installed',
      'If you just installed a wallet, try restarting Magic Roulette',
    ],
    recovery: [
      {
        label: 'Install Phantom',
        description: 'Download Phantom wallet from the app store',
        action: 'install_wallet',
        priority: 'primary',
      },
      {
        label: 'Restart App',
        description: 'Close and reopen Magic Roulette',
        action: 'restart_app',
        priority: 'secondary',
      },
    ],
    severity: 'critical',
    retryable: false,
  },

  [WalletErrorCode.CONNECTION_TIMEOUT]: {
    code: WalletErrorCode.CONNECTION_TIMEOUT,
    message: 'Wallet connection timed out',
    troubleshooting: [
      'The wallet app took too long to respond',
      'This usually happens due to network issues or wallet app problems',
      'Make sure your wallet app is running and responsive',
      'Check your internet connection',
    ],
    recovery: [
      {
        label: 'Try Again',
        description: 'Retry the wallet connection',
        action: 'retry',
        priority: 'primary',
      },
      {
        label: 'Check Network',
        description: 'Verify your internet connection',
        action: 'check_network',
        priority: 'secondary',
      },
    ],
    severity: 'medium',
    retryable: true,
  },

  [WalletErrorCode.NETWORK_ERROR]: {
    code: WalletErrorCode.NETWORK_ERROR,
    message: 'Network connection failed',
    troubleshooting: [
      'Unable to connect to the Solana network',
      'Check your internet connection (WiFi or mobile data)',
      'Try switching between WiFi and mobile data',
      'The Solana network might be experiencing issues',
    ],
    recovery: [
      {
        label: 'Check Network',
        description: 'Verify your internet connection',
        action: 'check_network',
        priority: 'primary',
      },
      {
        label: 'Try Again',
        description: 'Retry after checking your connection',
        action: 'retry',
        priority: 'secondary',
      },
    ],
    severity: 'high',
    retryable: true,
  },

  [WalletErrorCode.AUTHORIZATION_FAILED]: {
    code: WalletErrorCode.AUTHORIZATION_FAILED,
    message: 'Wallet authorization failed',
    troubleshooting: [
      'The wallet app failed to authorize Magic Roulette',
      'This might be due to wallet app issues or security settings',
      'Make sure your wallet app is up to date',
      'Try disconnecting and reconnecting',
    ],
    recovery: [
      {
        label: 'Reconnect',
        description: 'Disconnect and try connecting again',
        action: 'reconnect',
        priority: 'primary',
      },
      {
        label: 'Update Wallet',
        description: 'Check for wallet app updates',
        action: 'update_wallet',
        priority: 'secondary',
      },
    ],
    severity: 'high',
    retryable: true,
  },

  // Session Errors
  [WalletErrorCode.SESSION_EXPIRED]: {
    code: WalletErrorCode.SESSION_EXPIRED,
    message: 'Your wallet session has expired',
    troubleshooting: [
      'Wallet sessions expire after 1 hour for security',
      'You need to reconnect your wallet to continue',
      'Your funds and game progress are safe',
    ],
    recovery: [
      {
        label: 'Reconnect',
        description: 'Connect your wallet again',
        action: 'reconnect',
        priority: 'primary',
      },
    ],
    severity: 'medium',
    retryable: true,
  },

  [WalletErrorCode.SESSION_INVALID]: {
    code: WalletErrorCode.SESSION_INVALID,
    message: 'Wallet session is invalid',
    troubleshooting: [
      'Your wallet session data is corrupted or invalid',
      'This can happen after app updates or wallet changes',
      'Reconnecting will create a fresh session',
    ],
    recovery: [
      {
        label: 'Reconnect',
        description: 'Connect your wallet again',
        action: 'reconnect',
        priority: 'primary',
      },
    ],
    severity: 'medium',
    retryable: true,
  },

  [WalletErrorCode.REAUTHORIZATION_FAILED]: {
    code: WalletErrorCode.REAUTHORIZATION_FAILED,
    message: 'Failed to refresh wallet session',
    troubleshooting: [
      'Unable to automatically refresh your wallet session',
      'This might be due to wallet app changes or network issues',
      'Reconnecting will establish a new session',
    ],
    recovery: [
      {
        label: 'Reconnect',
        description: 'Connect your wallet again',
        action: 'reconnect',
        priority: 'primary',
      },
    ],
    severity: 'medium',
    retryable: true,
  },

  // Transaction Errors
  [WalletErrorCode.TRANSACTION_REJECTED]: {
    code: WalletErrorCode.TRANSACTION_REJECTED,
    message: 'Transaction was rejected',
    troubleshooting: [
      'You declined the transaction in your wallet app',
      'This is normal if you chose not to proceed',
      'No funds were transferred',
    ],
    recovery: [
      {
        label: 'Try Again',
        description: 'Retry the transaction',
        action: 'retry',
        priority: 'primary',
      },
      {
        label: 'Cancel',
        description: 'Cancel this operation',
        action: 'contact_support',
        priority: 'secondary',
      },
    ],
    severity: 'low',
    retryable: true,
  },

  [WalletErrorCode.TRANSACTION_TIMEOUT]: {
    code: WalletErrorCode.TRANSACTION_TIMEOUT,
    message: 'Transaction timed out',
    troubleshooting: [
      'The transaction took too long to process',
      'This can happen during network congestion',
      'Your funds are safe - the transaction may not have been sent',
      'Check your wallet for transaction status',
    ],
    recovery: [
      {
        label: 'Try Again',
        description: 'Retry the transaction',
        action: 'retry',
        priority: 'primary',
      },
      {
        label: 'Check Network',
        description: 'Verify your internet connection',
        action: 'check_network',
        priority: 'secondary',
      },
    ],
    severity: 'medium',
    retryable: true,
  },

  [WalletErrorCode.INSUFFICIENT_FUNDS]: {
    code: WalletErrorCode.INSUFFICIENT_FUNDS,
    message: 'Insufficient funds in wallet',
    troubleshooting: [
      'Your wallet does not have enough SOL or tokens for this transaction',
      'You need SOL for transaction fees (rent + gas)',
      'Check your wallet balance before trying again',
    ],
    recovery: [
      {
        label: 'Add Funds',
        description: 'Deposit SOL to your wallet',
        action: 'contact_support',
        priority: 'primary',
      },
      {
        label: 'Cancel',
        description: 'Cancel this transaction',
        action: 'contact_support',
        priority: 'secondary',
      },
    ],
    severity: 'high',
    retryable: false,
  },

  [WalletErrorCode.TRANSACTION_FAILED]: {
    code: WalletErrorCode.TRANSACTION_FAILED,
    message: 'Transaction failed',
    troubleshooting: [
      'The transaction was sent but failed on the blockchain',
      'This can happen due to network issues or smart contract errors',
      'Your funds are safe - the transaction was reverted',
      'Check the Solana network status',
    ],
    recovery: [
      {
        label: 'Try Again',
        description: 'Retry the transaction',
        action: 'retry',
        priority: 'primary',
      },
      {
        label: 'Contact Support',
        description: 'Get help if the issue persists',
        action: 'contact_support',
        priority: 'secondary',
      },
    ],
    severity: 'high',
    retryable: true,
  },

  [WalletErrorCode.SIGNING_FAILED]: {
    code: WalletErrorCode.SIGNING_FAILED,
    message: 'Failed to sign transaction',
    troubleshooting: [
      'The wallet app failed to sign the transaction',
      'This might be due to wallet app issues',
      'Make sure your wallet app is responsive',
    ],
    recovery: [
      {
        label: 'Try Again',
        description: 'Retry signing the transaction',
        action: 'retry',
        priority: 'primary',
      },
      {
        label: 'Restart Wallet',
        description: 'Close and reopen your wallet app',
        action: 'restart_app',
        priority: 'secondary',
      },
    ],
    severity: 'medium',
    retryable: true,
  },

  // Game Session Errors
  [WalletErrorCode.GAME_SESSION_EXPIRED]: {
    code: WalletErrorCode.GAME_SESSION_EXPIRED,
    message: 'Game session expired',
    troubleshooting: [
      'Your game session has expired (30 minutes)',
      'You need to pre-authorize the game again',
      'This is a security measure to protect your wallet',
    ],
    recovery: [
      {
        label: 'Authorize Game',
        description: 'Pre-authorize the game session again',
        action: 'retry',
        priority: 'primary',
      },
    ],
    severity: 'medium',
    retryable: true,
  },

  [WalletErrorCode.GAME_SESSION_INVALID]: {
    code: WalletErrorCode.GAME_SESSION_INVALID,
    message: 'Invalid game session',
    troubleshooting: [
      'No active game session found',
      'You need to pre-authorize the game before playing',
      'This enables gasless gameplay without popups',
    ],
    recovery: [
      {
        label: 'Authorize Game',
        description: 'Pre-authorize the game session',
        action: 'retry',
        priority: 'primary',
      },
    ],
    severity: 'medium',
    retryable: true,
  },

  [WalletErrorCode.MAX_SHOTS_REACHED]: {
    code: WalletErrorCode.MAX_SHOTS_REACHED,
    message: 'Maximum shots reached',
    troubleshooting: [
      'You have reached the maximum number of pre-authorized shots',
      'This is a security limit to protect your wallet',
      'You can pre-authorize more shots to continue',
    ],
    recovery: [
      {
        label: 'Authorize More',
        description: 'Pre-authorize additional shots',
        action: 'retry',
        priority: 'primary',
      },
    ],
    severity: 'low',
    retryable: true,
  },

  // Wallet Compatibility Errors
  [WalletErrorCode.WALLET_INCOMPATIBLE]: {
    code: WalletErrorCode.WALLET_INCOMPATIBLE,
    message: 'Wallet is not compatible',
    troubleshooting: [
      'Your wallet app does not support Mobile Wallet Adapter',
      'Magic Roulette requires MWA-compatible wallets',
      'Compatible wallets: Phantom, Solflare, Backpack, Seed Vault',
      'Consider switching to a compatible wallet',
    ],
    recovery: [
      {
        label: 'Install Phantom',
        description: 'Download a compatible wallet',
        action: 'install_wallet',
        priority: 'primary',
      },
      {
        label: 'Contact Support',
        description: 'Get help with wallet compatibility',
        action: 'contact_support',
        priority: 'secondary',
      },
    ],
    severity: 'critical',
    retryable: false,
  },

  [WalletErrorCode.WALLET_OUTDATED]: {
    code: WalletErrorCode.WALLET_OUTDATED,
    message: 'Wallet app is outdated',
    troubleshooting: [
      'Your wallet app version is too old',
      'Magic Roulette requires the latest wallet features',
      'Update your wallet app to the latest version',
    ],
    recovery: [
      {
        label: 'Update Wallet',
        description: 'Update your wallet app',
        action: 'update_wallet',
        priority: 'primary',
      },
      {
        label: 'Try Anyway',
        description: 'Attempt to connect with current version',
        action: 'retry',
        priority: 'secondary',
      },
    ],
    severity: 'high',
    retryable: true,
  },

  [WalletErrorCode.MWA_NOT_SUPPORTED]: {
    code: WalletErrorCode.MWA_NOT_SUPPORTED,
    message: 'Mobile Wallet Adapter not supported',
    troubleshooting: [
      'Your device or wallet does not support Mobile Wallet Adapter',
      'This feature requires Android 6.0+ or iOS 13+',
      'Make sure your wallet app supports MWA',
    ],
    recovery: [
      {
        label: 'Update Wallet',
        description: 'Update your wallet app',
        action: 'update_wallet',
        priority: 'primary',
      },
      {
        label: 'Contact Support',
        description: 'Get help with compatibility',
        action: 'contact_support',
        priority: 'secondary',
      },
    ],
    severity: 'critical',
    retryable: false,
  },

  // Generic Errors
  [WalletErrorCode.UNKNOWN_ERROR]: {
    code: WalletErrorCode.UNKNOWN_ERROR,
    message: 'An unexpected error occurred',
    troubleshooting: [
      'Something went wrong, but we are not sure what',
      'This might be a temporary issue',
      'Try the suggested recovery actions',
      'Contact support if the issue persists',
    ],
    recovery: [
      {
        label: 'Try Again',
        description: 'Retry the operation',
        action: 'retry',
        priority: 'primary',
      },
      {
        label: 'Restart App',
        description: 'Close and reopen Magic Roulette',
        action: 'restart_app',
        priority: 'secondary',
      },
      {
        label: 'Contact Support',
        description: 'Get help from our team',
        action: 'contact_support',
        priority: 'secondary',
      },
    ],
    severity: 'medium',
    retryable: true,
  },

  [WalletErrorCode.INTERNAL_ERROR]: {
    code: WalletErrorCode.INTERNAL_ERROR,
    message: 'Internal error occurred',
    troubleshooting: [
      'Magic Roulette encountered an internal error',
      'This is likely a bug in our app',
      'Please report this to our support team',
      'Restarting the app might help',
    ],
    recovery: [
      {
        label: 'Restart App',
        description: 'Close and reopen Magic Roulette',
        action: 'restart_app',
        priority: 'primary',
      },
      {
        label: 'Contact Support',
        description: 'Report this bug to our team',
        action: 'contact_support',
        priority: 'secondary',
      },
    ],
    severity: 'high',
    retryable: true,
  },
};

/**
 * WalletErrorHandler class for comprehensive error handling
 */
export class WalletErrorHandler {
  /**
   * Parse raw error and return structured WalletError
   */
  static handleError(error: any): WalletError {
    const errorMessage = error?.message || String(error);
    const errorCode = this.detectErrorCode(errorMessage, error);
    
    const baseError = ERROR_MAPPINGS[errorCode];
    
    return {
      ...baseError,
      technicalDetails: errorMessage,
    };
  }

  /**
   * Detect error code from error message or error object
   */
  private static detectErrorCode(message: string, error: any): WalletErrorCode {
    const lowerMessage = message.toLowerCase();

    // Connection Errors
    if (
      lowerMessage.includes('user declined') ||
      lowerMessage.includes('user rejected') ||
      lowerMessage.includes('user cancelled') ||
      lowerMessage.includes('rejected by user')
    ) {
      return WalletErrorCode.USER_DECLINED;
    }

    if (
      lowerMessage.includes('wallet not found') ||
      lowerMessage.includes('no wallet') ||
      lowerMessage.includes('wallet app not installed')
    ) {
      return WalletErrorCode.WALLET_NOT_FOUND;
    }

    if (
      lowerMessage.includes('timeout') ||
      lowerMessage.includes('timed out') ||
      lowerMessage.includes('connection timeout')
    ) {
      return WalletErrorCode.CONNECTION_TIMEOUT;
    }

    if (
      lowerMessage.includes('network') ||
      lowerMessage.includes('connection failed') ||
      lowerMessage.includes('no internet')
    ) {
      return WalletErrorCode.NETWORK_ERROR;
    }

    if (
      lowerMessage.includes('authorization failed') ||
      lowerMessage.includes('auth failed')
    ) {
      return WalletErrorCode.AUTHORIZATION_FAILED;
    }

    // Session Errors
    if (
      lowerMessage.includes('session expired') ||
      lowerMessage.includes('token expired')
    ) {
      return WalletErrorCode.SESSION_EXPIRED;
    }

    if (
      lowerMessage.includes('session invalid') ||
      lowerMessage.includes('invalid session')
    ) {
      return WalletErrorCode.SESSION_INVALID;
    }

    if (
      lowerMessage.includes('reauthorization failed') ||
      lowerMessage.includes('reauth failed')
    ) {
      return WalletErrorCode.REAUTHORIZATION_FAILED;
    }

    // Transaction Errors
    if (
      lowerMessage.includes('transaction rejected') ||
      lowerMessage.includes('tx rejected') ||
      lowerMessage.includes('user rejected transaction')
    ) {
      return WalletErrorCode.TRANSACTION_REJECTED;
    }

    if (
      lowerMessage.includes('transaction timeout') ||
      lowerMessage.includes('tx timeout')
    ) {
      return WalletErrorCode.TRANSACTION_TIMEOUT;
    }

    if (
      lowerMessage.includes('insufficient funds') ||
      lowerMessage.includes('insufficient balance') ||
      lowerMessage.includes('not enough sol')
    ) {
      return WalletErrorCode.INSUFFICIENT_FUNDS;
    }

    if (
      lowerMessage.includes('transaction failed') ||
      lowerMessage.includes('tx failed')
    ) {
      return WalletErrorCode.TRANSACTION_FAILED;
    }

    if (
      lowerMessage.includes('signing failed') ||
      lowerMessage.includes('failed to sign')
    ) {
      return WalletErrorCode.SIGNING_FAILED;
    }

    // Game Session Errors
    if (lowerMessage.includes('game session expired')) {
      return WalletErrorCode.GAME_SESSION_EXPIRED;
    }

    if (
      lowerMessage.includes('game session invalid') ||
      lowerMessage.includes('no active game session')
    ) {
      return WalletErrorCode.GAME_SESSION_INVALID;
    }

    if (
      lowerMessage.includes('max shots reached') ||
      lowerMessage.includes('maximum shots')
    ) {
      return WalletErrorCode.MAX_SHOTS_REACHED;
    }

    // Wallet Compatibility Errors
    if (
      lowerMessage.includes('wallet incompatible') ||
      lowerMessage.includes('not compatible')
    ) {
      return WalletErrorCode.WALLET_INCOMPATIBLE;
    }

    if (
      lowerMessage.includes('wallet outdated') ||
      lowerMessage.includes('update wallet')
    ) {
      return WalletErrorCode.WALLET_OUTDATED;
    }

    if (
      lowerMessage.includes('mwa not supported') ||
      lowerMessage.includes('mobile wallet adapter not supported')
    ) {
      return WalletErrorCode.MWA_NOT_SUPPORTED;
    }

    // Internal Errors
    if (
      lowerMessage.includes('internal error') ||
      lowerMessage.includes('unexpected error in')
    ) {
      return WalletErrorCode.INTERNAL_ERROR;
    }

    // Default to unknown error
    return WalletErrorCode.UNKNOWN_ERROR;
  }

  /**
   * Get user-friendly error message
   */
  static getErrorMessage(error: any): string {
    const walletError = this.handleError(error);
    return walletError.message;
  }

  /**
   * Get troubleshooting steps
   */
  static getTroubleshootingSteps(error: any): string[] {
    const walletError = this.handleError(error);
    return walletError.troubleshooting;
  }

  /**
   * Get recovery actions
   */
  static getRecoveryActions(error: any): RecoveryAction[] {
    const walletError = this.handleError(error);
    return walletError.recovery;
  }

  /**
   * Check if error is retryable
   */
  static isRetryable(error: any): boolean {
    const walletError = this.handleError(error);
    return walletError.retryable;
  }

  /**
   * Get error severity
   */
  static getSeverity(error: any): 'critical' | 'high' | 'medium' | 'low' {
    const walletError = this.handleError(error);
    return walletError.severity;
  }

  /**
   * Format error for display in UI
   */
  static formatForDisplay(error: any): {
    title: string;
    message: string;
    troubleshooting: string[];
    actions: RecoveryAction[];
    severity: string;
  } {
    const walletError = this.handleError(error);
    
    return {
      title: this.getSeverityTitle(walletError.severity),
      message: walletError.message,
      troubleshooting: walletError.troubleshooting,
      actions: walletError.recovery,
      severity: walletError.severity,
    };
  }

  /**
   * Get severity-based title
   */
  private static getSeverityTitle(severity: string): string {
    switch (severity) {
      case 'critical':
        return 'Critical Error';
      case 'high':
        return 'Error';
      case 'medium':
        return 'Warning';
      case 'low':
        return 'Notice';
      default:
        return 'Error';
    }
  }

  /**
   * Log error with context
   */
  static logError(error: any, context?: string): void {
    const walletError = this.handleError(error);
    
    console.error(`[WalletError] ${context || 'Unknown context'}`, {
      code: walletError.code,
      message: walletError.message,
      severity: walletError.severity,
      technicalDetails: walletError.technicalDetails,
      retryable: walletError.retryable,
    });
  }
}
