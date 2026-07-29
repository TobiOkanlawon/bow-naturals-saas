import { createContext, useContext, useState, type ReactNode } from 'react';

export interface Company {
  id: string;
  name: string;
  ceoName?: string;
  ceoEmail?: string;
}

interface CompanyContextType {
  company: Company | null;
  getCurrentCompanyId: () => string;
}

const CompanyContext = createContext<CompanyContextType>({
  company: null,
  getCurrentCompanyId: () => 'default-company',
});

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [company, setCompany] = useState<Company>(() => {
    const saved = {
      id: "",
      name: "Bow Naturals",
    }
    return saved
  });

  const getCurrentCompanyId = () => company?.id

  return (
    <CompanyContext.Provider value={{ company, getCurrentCompanyId }}>
      {children}
    </CompanyContext.Provider>
  );
}

export const useCompany = () => useContext(CompanyContext);
