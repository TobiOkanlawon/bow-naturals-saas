import { createContext, useContext, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGetCompanyData } from "@/data/queries";

export interface CompanyContextType {
  company: Company | null;
  getCurrentCompanyId: () => string;
}

const CompanyContext = createContext<CompanyContextType>({
  company: null,
  getCurrentCompanyId: () => "",
});

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const getCurrentCompanyId = () => user?.companyId ?? "";

  const { data } = useGetCompanyData(user?.companyId);

  return (
    <CompanyContext.Provider
      value={{
        company: data ?? null,
        getCurrentCompanyId,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export const useCompany = () => useContext(CompanyContext);
