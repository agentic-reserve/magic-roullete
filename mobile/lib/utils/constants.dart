import 'package:flutter/material.dart';

/// App-wide constants
class AppConstants {
  // Program IDs
  static const String programId = 'JE2fDdXcYEprUR2yPmWdLGDSJ7Y7HD8qsJ52eD6qUavq';
  static const String kaminoProgramId = 'KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD';
  
  // Network
  static const String rpcUrl = 'https://api.devnet.solana.com';
  static const String wsUrl = 'wss://api.devnet.solana.com';
  
  // Kamino
  static const String kaminoMarketDevnet = 'DxXdAyU3kCjnyggvHmY5nAwg5cRbbmdyX3npfDMjjMek';
  static const String kaminoMarketMainnet = '7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF';
  
  // Game Settings
  static const double minEntryFee = 0.01; // SOL
  static const double collateralRatio = 1.1; // 110%
  static const double kaminoAPY = 5.2; // 5.2% annual
  
  // UI
  static const Duration animationDuration = Duration(milliseconds: 300);
  static const Duration shotAnimationDuration = Duration(milliseconds: 1500);
}

/// App colors
class AppColors {
  static const Color primary = Color(0xFF9945FF);
  static const Color secondary = Color(0xFF14F195);
  static const Color background = Color(0xFF0A0A0A);
  static const Color surface = Color(0xFF1A1A1A);
  static const Color error = Color(0xFFFF4444);
  static const Color success = Color(0xFF00FF88);
  static const Color warning = Color(0xFFFFAA00);
  
  // Game colors
  static const Color bulletChamber = Color(0xFFFF0000);
  static const Color emptyChamber = Color(0xFF333333);
  static const Color revolverMetal = Color(0xFF888888);
  
  // Kamino colors
  static const Color kaminoPurple = Color(0xFF8B5CF6);
  static const Color kaminoGreen = Color(0xFF10B981);
}

/// Text styles
class AppTextStyles {
  static const TextStyle heading1 = TextStyle(
    fontSize: 32,
    fontWeight: FontWeight.bold,
    letterSpacing: 1.2,
  );
  
  static const TextStyle heading2 = TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.bold,
    letterSpacing: 1.0,
  );
  
  static const TextStyle heading3 = TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.8,
  );
  
  static const TextStyle body = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.normal,
  );
  
  static const TextStyle caption = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.normal,
    color: Colors.grey,
  );
  
  static const TextStyle button = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.bold,
    letterSpacing: 1.0,
  );
}

/// Spacing
class AppSpacing {
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 16.0;
  static const double lg = 24.0;
  static const double xl = 32.0;
  static const double xxl = 48.0;
}

/// Border radius
class AppRadius {
  static const double sm = 8.0;
  static const double md = 12.0;
  static const double lg = 16.0;
  static const double xl = 24.0;
  static const double full = 9999.0;
}
