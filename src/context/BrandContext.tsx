import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface BrandSettings {
  name: string;
  tagline: string;
  logoUrl: string;
  logoEmoji: string;
  primaryColor: string;
  primaryDark: string;
  primaryLight: string;
  sidebarGradientFrom: string;
  sidebarGradientTo: string;
  accentColor: string;
  thankYouMessage: string;
}

const defaultBrand: BrandSettings = {
  name: "Scale CRM",
  tagline: "Measure, Grow, Dominate",
  logoUrl: "",
  logoEmoji: "",
  primaryColor: "#4F46E5",
  primaryDark: "#4338CA",
  primaryLight: "#818CF8",
  sidebarGradientFrom: "#312E81",
  sidebarGradientTo: "#4F46E5",
  accentColor: "#10B981",
  thankYouMessage: "Thank you for your order! We appreciate your business. 💚",
};

interface BrandContextType {
  brand: BrandSettings;
  updateBrand: (updates: Partial<BrandSettings>) => void;
  resetBrand: () => void;
}

const BrandContext = createContext<BrandContextType>({
  brand: defaultBrand,
  updateBrand: () => undefined,
  resetBrand: () => undefined,
});

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brand, setBrand] = useState<BrandSettings>(defaultBrand);

  useEffect(() => {
    setBrand(defaultBrand);
  }, []);

  const updateBrand = (updates: Partial<BrandSettings>) => {
    setBrand((prev) => ({ ...prev, ...updates }));
  };

  const resetBrand = () => {
    setBrand(defaultBrand);
  };

  return (
    <BrandContext.Provider value={{ brand, updateBrand, resetBrand }}>
      {children}
    </BrandContext.Provider>
  );
}

export const useBrand = () => useContext(BrandContext);
