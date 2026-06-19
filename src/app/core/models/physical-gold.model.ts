export interface ConvertToPhysicalRequest {
  userId: number;
  branchId: number;
  quantity: number;
  deliveryAddressId: number;
}

export interface PhysicalGoldTransactionResponse {
  transactionId: number;
  userId: number;
  userName: string;
  branchId: number;
  vendorName: string;
  quantity: number;

  deliveryStreet: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryPostalCode: string;
  deliveryCountry: string;

  createdAt: string;
}