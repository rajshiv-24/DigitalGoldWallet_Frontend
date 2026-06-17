export type TransactionType2 = 'BUY' | 'SELL' | 'CONVERT_TO_PHYSICAL';
export type TransactionStatus = 'SUCCESS' | 'FAILED';
export type PaymentMethod =
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'GOOGLE_PAY'
  | 'AMAZON_PAY'
  | 'PHONEPE'
  | 'PAYTM'
  | 'BANK_TRANSFER';

export interface TransactionHistoryResponse {
  transactionId: number;
  userId: number;
  userName: string;
  branchId: number;
  branchCity: string;
  vendorName: string;
  transactionType: TransactionType2;
  transactionStatus: TransactionStatus;
  quantity: number;
  amount: number;
  createdAt: string;
}

export interface BuyGoldRequest {
  userId: number;
  branchId: number;
  quantity: number;
  paymentMethod: PaymentMethod;
}

export interface SellGoldRequest {
  userId: number;
  branchId: number;
  quantity: number;
}