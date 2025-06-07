export interface CompanyLogo {
  url: string;
  thumbnail?: string;
  webp?: string;
  publicId?: string;
}

export interface CompanyFormValues {
  companyName: string;
  email: string;
  phone: string;
  taxNumber: string;
  handelsregisterNumber?: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  bankDetails: {
    bankName: string;
    iban: string;
    swiftCode: string;
  };
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
  logos?: CompanyLogo[];
}

