use anchor_lang::prelude::*;

#[error_code]
pub enum GameError {
    #[msg("Game is already full")]
    GameFull,
    
    #[msg("Game is not ready to start")]
    GameNotReady,
    
    #[msg("Game is not in progress")]
    GameNotInProgress,
    
    #[msg("Not your turn")]
    NotYourTurn,
    
    #[msg("Invalid game mode")]
    InvalidGameMode,
    
    #[msg("Insufficient entry fee")]
    InsufficientEntryFee,
    
    #[msg("VRF result not ready")]
    VrfNotReady,
    
    #[msg("VRF request already pending")]
    VrfRequestPending,
    
    #[msg("Game already finished")]
    GameAlreadyFinished,
    
    #[msg("Cannot join your own game")]
    CannotJoinOwnGame,
    
    #[msg("Invalid fee configuration")]
    InvalidFeeConfig,
    
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
    
    #[msg("No rewards to claim")]
    NoRewardsToClaim,
    
    #[msg("Invalid VRF authority")]
    InvalidVrfAuthority,
    
    #[msg("Invalid token program")]
    InvalidTokenProgram,
    
    #[msg("Invalid vault owner")]
    InvalidVaultOwner,
    
    #[msg("Unauthorized")]
    Unauthorized,
    
    #[msg("Player already in game")]
    PlayerAlreadyInGame,
    
    #[msg("Invalid mint")]
    InvalidMint,
    
    #[msg("Platform paused")]
    PlatformPaused,
    
    #[msg("Cannot join AI game - AI games are single player")]
    CannotJoinAiGame,
    
    // Kamino integration errors
    #[msg("Insufficient collateral - minimum 110% of entry fee required")]
    InsufficientCollateral,
    
    #[msg("Loan repayment failed")]
    LoanRepaymentFailed,
    
    #[msg("Invalid Kamino market")]
    InvalidKaminoMarket,
    
    #[msg("Invalid Kamino obligation")]
    InvalidKaminoObligation,
    
    #[msg("Collateral withdrawal failed")]
    CollateralWithdrawalFailed,
    
    #[msg("Insufficient winnings to repay loan")]
    InsufficientWinningsForRepayment,
    
    // Squads integration errors
    #[msg("Multisig unauthorized - not the platform authority")]
    MultisigUnauthorized,
    
    #[msg("Invalid multisig transaction")]
    InvalidMultisigTransaction,
    
    #[msg("Multisig proposal not approved")]
    MultisigProposalNotApproved,
    
    #[msg("Insufficient treasury balance")]
    InsufficientTreasuryBalance,
    
    #[msg("Invalid vault balance")]
    InsufficientVaultBalance,
    
    #[msg("Invalid winner - does not match game participants")]
    InvalidWinner,
}
