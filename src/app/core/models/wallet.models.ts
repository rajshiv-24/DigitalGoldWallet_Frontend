/**
 * Matches: com.cg.enums.PaymentMethod
 * Values must match the Java enum names exactly.
 * Update this union if the backend enum changes.
 */
export type PaymentMethod =
  | 'PAYTM'
  | 'GOOGLE_PAY'
  | 'PHONEPE'
  | 'DEBIT_CARD'
  | 'CREDIT_CARD'
  | 'AMAZON_PAY'
  | 'BANK_TRANSFER';

/**
 * Matches: com.cg.enums.TransactionType
 */
export type TransactionType =
  | 'CREDIT'
  | 'DEBIT';

/**
 * Matches: com.cg.enums.PaymentStatus
 */
export type PaymentStatus =
  | 'SUCCESS'
  | 'PENDING'
  | 'FAILED';

/**
 * Maps to: com.cg.dto.WalletTopUpRequestDTO
 * POST /api/users/wallet/top-up — request body
 *
 * userId   → Integer        (injected from AuthService, never from form)
 * amount   → BigDecimal     (sent as number; JSON serialises correctly)
 * paymentMethod → PaymentMethod enum name as string
 */
export interface WalletTopUpRequest {
  userId:        number;
  amount:        number;
  paymentMethod: PaymentMethod;
}

/**
 * Maps to: com.cg.dto.PaymentResponseDTO
 * POST /api/users/wallet/top-up — response body
 *
 * createdAt → LocalDateTime serialised as ISO-8601 string by Jackson
 */
export interface PaymentResponse {
  paymentId:       number;
  userId:          number;
  userName:        string;
  amount:          number;
  paymentMethod:   PaymentMethod;
  transactionType: TransactionType;
  paymentStatus:   PaymentStatus;
  createdAt:       string;
}