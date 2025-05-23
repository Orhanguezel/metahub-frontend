export interface IradonarprodImage {
  url: string;
  thumbnail: string;
  webp?: string;
  publicId?: string;
}

export interface Iradonarprod {
  _id: string;
  name: {
    tr?: string;
    en?: string;
    de?: string;
  };
  slug: string;
  description?: {
    tr?: string;
    en?: string;
    de?: string;
  };
  brand: string;
  price: number;
  stock: number;
  stockThreshold?: number;
  category: {
    _id: string;
    name: {
      tr?: string;
      en?: string;
      de?: string;
    };
  } | string; 

  tags?: string[];
  images: IradonarprodImage[];

  frameMaterial?: string;
  brakeType?: string;
  wheelSize?: number;
  gearCount?: number;
  suspensionType?: string;
  color?: string[];
  weightKg?: number;
  isElectric?: boolean;
  batteryRangeKm?: number;
  motorPowerW?: number;

  comments?: string[]; 
  likes?: number;

  isActive: boolean;
  isPublished: boolean;

  createdAt: string;
  updatedAt: string;
}
