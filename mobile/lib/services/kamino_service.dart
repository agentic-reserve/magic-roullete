import 'package:solana/solana.dart';
import '../models/loan_option.dart';
import '../utils/constants.dart';

/// Kamino Finance Integration Service
/// Handles all Kamino lending operations
class KaminoService {
  static final KaminoService instance = KaminoService._();
  KaminoService._();

  late RpcClient _rpcClient;
  bool _initialized = false;

  Future<void> initialize() async {
    if (_initialized) return;
    
    _rpcClient = RpcClient(AppConstants.rpcUrl);
    _initialized = true;
  }

  /// Get available loan options
  List<LoanOption> getLoanOptions() {
    return [
      LoanOption(
        entryFee: 0.01,
        collateralRequired: 0.011,
        estimatedAPY: 5.2,
        loanDuration: '~5 minutes',
      ),
      LoanOption(
        entryFee: 0.05,
        collateralRequired: 0.055,
        estimatedAPY: 5.2,
        loanDuration: '~5 minutes',
      ),
      LoanOption(
        entryFee: 0.1,
        collateralRequired: 0.11,
        estimatedAPY: 5.2,
        loanDuration: '~5 minutes',
      ),
      LoanOption(
        entryFee: 0.5,
        collateralRequired: 0.55,
        estimatedAPY: 5.2,
        loanDuration: '~5 minutes',
      ),
      LoanOption(
        entryFee: 1.0,
        collateralRequired: 1.1,
        estimatedAPY: 5.2,
        loanDuration: '~5 minutes',
      ),
    ];
  }

  /// Calculate required collateral (110%)
  double calculateCollateral(double entryFee) {
    return entryFee * AppConstants.collateralRatio;
  }

  /// Calculate loan interest
  double calculateInterest(double loanAmount, {int durationMinutes = 5}) {
    final annualRate = AppConstants.kaminoAPY / 100;
    final minutesPerYear = 365 * 24 * 60;
    return loanAmount * annualRate * (durationMinutes / minutesPerYear);
  }

  /// Calculate total repayment
  double calculateRepayment(double loanAmount, {int durationMinutes = 5}) {
    return loanAmount + calculateInterest(loanAmount, durationMinutes: durationMinutes);
  }

  /// Calculate net winnings after loan repayment
  double calculateNetWinnings(double totalWinnings, double loanAmount, {int durationMinutes = 5}) {
    final repayment = calculateRepayment(loanAmount, durationMinutes: durationMinutes);
    return totalWinnings - repayment;
  }

  /// Check if user has existing obligation
  Future<bool> checkUserObligation(Ed25519HDPublicKey userPublicKey) async {
    try {
      // Derive obligation PDA
      final obligationPda = await _deriveObligationPda(userPublicKey);
      
      // Check if account exists
      final accountInfo = await _rpcClient.getAccountInfo(obligationPda.toBase58());
      return accountInfo.value != null;
    } catch (e) {
      return false;
    }
  }

  /// Derive obligation PDA
  Future<Ed25519HDPublicKey> _deriveObligationPda(Ed25519HDPublicKey owner) async {
    final marketAddress = Ed25519HDPublicKey.fromBase58(AppConstants.kaminoMarketDevnet);
    final kaminoProgramId = Ed25519HDPublicKey.fromBase58(AppConstants.kaminoProgramId);
    
    // TODO: Implement PDA derivation
    // This is a placeholder - actual implementation requires proper PDA derivation
    return owner;
  }

  /// Format SOL amount
  String formatSol(double sol) {
    return sol.toStringAsFixed(4);
  }

  /// Convert SOL to lamports
  int solToLamports(double sol) {
    return (sol * 1e9).toInt();
  }

  /// Convert lamports to SOL
  double lamportsToSol(int lamports) {
    return lamports / 1e9;
  }
}
