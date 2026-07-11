export interface CompanyConfig {
  name: string;
  domain: string;
  supportEmail: string;
  legalInfo: string;
}

export function getCompanyConfig(): CompanyConfig {
  return {
    name: process.env.NEXT_PUBLIC_COMPANY_NAME || "BrandBridge",
    domain: process.env.NEXT_PUBLIC_COMPANY_DOMAIN || "bb.mainweb.store",
    supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@bb.mainweb.store",
    legalInfo: process.env.NEXT_PUBLIC_LEGAL_COMPANY_INFO || "BrandBridge Legal Entity Name, Pakistan",
  };
}
