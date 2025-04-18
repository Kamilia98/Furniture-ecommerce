export interface ProductDetails {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  date: Date;
  sale?: number;
  categories?: any[];
  description?: string;
  brand?: string;

  colors?: {
    name: string;
    hex: string;
    images: string[];
    quantity: number;
    sku: string;
  }[];

  additionalInformation?: {
    general?: {
      salesPackage?: string;
      modelNumber?: string;
      secondaryMaterial?: string;
      configuration?: string;
      upholsteryMaterial?: string;
      upholsteryColor?: string;
    };
    productDetails?: {
      fillingMaterial?: string;
      finishType?: string;
      adjustableHeadrest?: boolean;
      maximumLoadCapacity?: number;
      originOfManufacture?: string;
    };
    dimensions?: {
      width?: number;
      height?: number;
      depth?: number;
      seatHeight?: number;
      legHeight?: number;
    };
    materials?: {
      primaryMaterial?: string;
      upholsteryMaterial?: string;
      upholsteryColor?: string;
      fillingMaterial?: string;
      finishType?: string;
    };
    specifications?: {
      adjustableHeadrest?: boolean;
      maximumLoadCapacity?: number;
      originOfManufacture?: string;
      weight?: number;
      brand?: string;
    };
    warranty?: {
      summary?: string;
      serviceType?: string;
      covered?: string;
      notCovered?: string;
      domesticWarranty?: string;
    };
  };
}
