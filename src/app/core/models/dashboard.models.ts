/**
 * Maps to: com.cg.dto.UserResponseDTO
 * GET /api/users/{userId}
 */
export interface UserResponse {
  userId:     number;
  name:       string;
  email:      string;
  role:       'USER';
  balance:    number;
  createdAt:  string;
  street:     string;
  city:       string;
  state:      string;
  postalCode: string;
  country:    string;
}

/**
 * Maps to: GET /api/gold/holdings/by-user/{userId}/total
 * Inline response shape — no separate DTO class on backend
 */
export interface GoldHoldingTotal {
  userId:        number;
  totalQuantity: number;
}

/**
 * Maps to: com.cg.dto.TransactionHistoryResponseDTO
 * GET /api/gold/history/by-user/{userId}
 * Each element in the returned List<TransactionHistoryResponseDTO>
 */
export interface TransactionHistoryResponse {
  transactionId:     number;
  userId:            number;
  userName:          string;
  branchId:          number;
  branchCity:        string;
  vendorName:        string;
  transactionType:   string;
  transactionStatus: string;
  quantity:          number;
  amount:            number;
  createdAt:         string;
}