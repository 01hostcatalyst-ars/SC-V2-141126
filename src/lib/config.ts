export interface CompanyConfig {
  name: string;
  domain: string;
  supportEmail: string;
  legalInfo: string;
}

export function getCompanyConfig(): CompanyConfig {
  return {
    name: process.env.NEXT_PUBLIC_COMPANY_NAME || "BrandBridge",
    domain: process.env.NEXT_PUBLIC_COMPANY_DOMAIN || "brandbridge.pk",
    supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@brandbridge.pk",
    legalInfo: process.env.NEXT_PUBLIC_LEGAL_COMPANY_INFO || "BrandBridge Legal Entity Name, Pakistan",
  };
}
