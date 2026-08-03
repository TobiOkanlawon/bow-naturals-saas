import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "../config/supabase";
import { useCompany } from "./CompanyContext";
// import the logo

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
  ceoName: string;
  ceoEmail: string;
  phoneNumber: string;
  accountNumber: string;
  bankName: string;
  accountName: string;
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
  ceoName: "Sarah Johnson",
  ceoEmail: "ceo@company.com",
  phoneNumber: "",
  accountNumber: "",
  bankName: "",
  accountName: "",
  thankYouMessage: "Thank you for your order! We appreciate your business. 💚",
};

// Maps DB row (snake_case) -> BrandSettings (camelCase)
function rowToBrand(row: any): BrandSettings {
  return {
    name: row.name ?? defaultBrand.name,
    tagline: row.tagline ?? defaultBrand.tagline,
    logoUrl: row.logo_url ?? defaultBrand.logoUrl,
    logoEmoji: row.logo_emoji ?? defaultBrand.logoEmoji,
    primaryColor: row.primary_color ?? defaultBrand.primaryColor,
    primaryDark: row.primary_dark ?? defaultBrand.primaryDark,
    primaryLight: row.primary_light ?? defaultBrand.primaryLight,
    sidebarGradientFrom:
      row.sidebar_gradient_from ?? defaultBrand.sidebarGradientFrom,
    sidebarGradientTo:
      row.sidebar_gradient_to ?? defaultBrand.sidebarGradientTo,
    accentColor: row.accent_color ?? defaultBrand.accentColor,
    ceoName: row.ceo_name ?? defaultBrand.ceoName,
    ceoEmail: row.ceo_email ?? defaultBrand.ceoEmail,
    phoneNumber: row.phone_number ?? defaultBrand.phoneNumber,
    accountNumber: row.account_number ?? defaultBrand.accountNumber,
    bankName: row.bank_name ?? defaultBrand.bankName,
    accountName: row.account_name ?? defaultBrand.accountName,
    thankYouMessage: row.thank_you_message ?? defaultBrand.thankYouMessage,
  };
}

// Maps BrandSettings (camelCase) -> DB row (snake_case) for upsert
function brandToRow(companyId: string, brand: Partial<BrandSettings>) {
  const row: Record<string, any> = { company_id: companyId };
  if (brand.name !== undefined) row.name = brand.name;
  if (brand.tagline !== undefined) row.tagline = brand.tagline;
  if (brand.logoUrl !== undefined) row.logo_url = brand.logoUrl;
  if (brand.logoEmoji !== undefined) row.logo_emoji = brand.logoEmoji;
  if (brand.primaryColor !== undefined) row.primary_color = brand.primaryColor;
  if (brand.primaryDark !== undefined) row.primary_dark = brand.primaryDark;
  if (brand.primaryLight !== undefined) row.primary_light = brand.primaryLight;
  if (brand.sidebarGradientFrom !== undefined)
    row.sidebar_gradient_from = brand.sidebarGradientFrom;
  if (brand.sidebarGradientTo !== undefined)
    row.sidebar_gradient_to = brand.sidebarGradientTo;
  if (brand.accentColor !== undefined) row.accent_color = brand.accentColor;
  if (brand.ceoName !== undefined) row.ceo_name = brand.ceoName;
  if (brand.ceoEmail !== undefined) row.ceo_email = brand.ceoEmail;
  if (brand.phoneNumber !== undefined) row.phone_number = brand.phoneNumber;
  if (brand.accountNumber !== undefined)
    row.account_number = brand.accountNumber;
  if (brand.bankName !== undefined) row.bank_name = brand.bankName;
  if (brand.accountName !== undefined) row.account_name = brand.accountName;
  if (brand.thankYouMessage !== undefined)
    row.thank_you_message = brand.thankYouMessage;
  return row;
}

interface BrandContextType {
  brand: BrandSettings;
  loading: boolean;
  updateBrand: (updates: Partial<BrandSettings>) => Promise<void>;
  resetBrand: () => Promise<void>;
}

const BrandContext = createContext<BrandContextType>({
  brand: defaultBrand,
  loading: true,
  updateBrand: async () => {},
  resetBrand: async () => {},
});

export function BrandProvider({ children }: { children: ReactNode }) {
  const { getCurrentCompanyId } = useCompany();
  const companyId = getCurrentCompanyId();

  const [brand, setBrand] = useState<BrandSettings>(defaultBrand);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) {
      setBrand(defaultBrand);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadBrand() {
      setLoading(true);
      const { data, error } = await supabase
        .from("brand_settings")
        .select("*")
        .eq("company_id", companyId)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error("Failed to load brand settings:", error);
        setBrand(defaultBrand);
      } else {
        setBrand(data ? rowToBrand(data) : defaultBrand);
      }
      setLoading(false);
    }

    loadBrand();

    // Keep brand in sync in real time (e.g. another tab/staff member updates it)
    const channel = supabase
      .channel(`brand-settings-${companyId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "brand_settings",
          filter: `company_id=eq.${companyId}`,
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setBrand(defaultBrand);
          } else {
            setBrand(rowToBrand(payload.new));
          }
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [companyId]);

  const updateBrand = async (updates: Partial<BrandSettings>) => {
    if (!companyId) return;

    // Optimistic local update
    setBrand((prev) => ({ ...prev, ...updates }));

    const { error } = await supabase
      .from("brand_settings")
      .upsert(brandToRow(companyId, updates), { onConflict: "company_id" });

    if (error) {
      console.error("Failed to update brand settings:", error);
    }
  };

  const resetBrand = async () => {
    if (!companyId) return;

    setBrand(defaultBrand);

    const { error } = await supabase
      .from("brand_settings")
      .delete()
      .eq("company_id", companyId);

    if (error) {
      console.error("Failed to reset brand settings:", error);
    }
  };

  return (
    <BrandContext.Provider value={{ brand, loading, updateBrand, resetBrand }}>
      {children}
    </BrandContext.Provider>
  );
}

export const useBrand = () => useContext(BrandContext);
