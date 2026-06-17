export interface Address {
  addressId: number;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Vendors {
  vendorId: number;
  vendorName: string;
  description: string;
  contactPersonName: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl: string;
  totalGoldQuantity: number;
  currentGoldPrice: number;
}

export interface VendorBranch {
  branchId: number;
  vendor: Vendors;
  address: Address;
  quantity: number;
  createdAt: string;
}