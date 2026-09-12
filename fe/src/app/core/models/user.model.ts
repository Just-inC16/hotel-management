export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  paymentCardholderName: string;
  paymentCardBrand: string;
  /** Last 4 digits only — the full card number is never stored or transmitted. */
  paymentLast4: string;
  /** MM/YY */
  paymentExpiry: string;
  token: string;
}
