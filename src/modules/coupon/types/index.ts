export interface CouponLabel {
  title: { tr: string; en: string; de: string };
  description: { tr: string; en: string; de: string };
}

export interface Coupon {
  _id?: string;
  code: string;
  label: CouponLabel;
  discount: number;
  expiresAt: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
