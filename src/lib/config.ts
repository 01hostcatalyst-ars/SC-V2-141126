export interface CompanyConfig {
  name: string;
  domain: string;
  supportEmail: string;
  legalInfo: string;
}

export function getCompanyConfig(): CompanyConfig {
  return {
    name: process.env.NEXT_PUBLIC_COMPANY_NAME || "SignCollab",
    domain: process.env.NEXT_PUBLIC_COMPANY_DOMAIN || "www.signcollab.com",
    supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@signcollab.com",
    legalInfo: process.env.NEXT_PUBLIC_LEGAL_COMPANY_INFO || "SignCollab Digital Agreement Platform",
  };
}
