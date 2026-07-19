import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import fs from "fs";
import path from "path";

// Load .env manually to populate process.env before pool initialization
try {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, "utf-8");
    for (const line of envFile.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const index = trimmed.indexOf("=");
      if (index !== -1) {
        const key = trimmed.substring(0, index).trim();
        let value = trimmed.substring(index + 1).trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    }
  }
} catch (e) {
  console.warn("Could not load .env manually:", e);
}

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new pg.Pool({
  connectionString,
  ssl: connectionString?.includes("supabase") || connectionString?.includes("pooler") ? { rejectUnauthorized: false } : undefined,
});
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

const JURISDICTIONS = [
  {
    countryCode: "US",
    countryName: "United States",
    governingLawName: "Electronic Signatures in Global and National Commerce Act (ESIGN 2000) & UETA",
    lawAbbreviation: "US ESIGN & UETA",
    arbitrationAct: "Federal Arbitration Act (FAA) & AAA Commercial Arbitration Rules",
    defaultCurrency: "USD",
    taxIdLabel: "EIN / Tax ID",
    nationalIdLabel: "Government ID (Optional)",
    disputeResolutionClause: "This Agreement shall be governed by the laws of the State of Delaware, United States, without regard to conflict of law principles. Any dispute exceeding $25,000 USD shall be settled by binding arbitration administered by the American Arbitration Association (AAA).",
    certificateNotice: "Executed under US Federal ESIGN Act (15 U.S.C. § 7001) and Uniform Electronic Transactions Act (UETA) guidelines.",
  },
  {
    countryCode: "GB",
    countryName: "United Kingdom",
    governingLawName: "Electronic Communications Act 2000 & UK eIDAS Regulations",
    lawAbbreviation: "UK eIDAS",
    arbitrationAct: "Arbitration Act 1996 of the United Kingdom",
    defaultCurrency: "GBP",
    taxIdLabel: "VAT Registration No",
    nationalIdLabel: "National Insurance No",
    disputeResolutionClause: "This Agreement shall be governed by and construed in accordance with the laws of England and Wales. The courts of England and Wales shall have exclusive jurisdiction to settle any dispute.",
    certificateNotice: "Executed under UK Electronic Communications Act 2000 and UK eIDAS Regulation standards.",
  },
  {
    countryCode: "EU",
    countryName: "European Union",
    governingLawName: "eIDAS Regulation (EU) No 910/2014 & eIDAS 2.0 (EU 2024/1183)",
    lawAbbreviation: "EU eIDAS Reg 910/2014",
    arbitrationAct: "ICC Rules of Arbitration",
    defaultCurrency: "EUR",
    taxIdLabel: "VAT ID / NIF",
    nationalIdLabel: "National ID / Passport",
    disputeResolutionClause: "This Agreement is governed by EU contract directives and local law of the Initiator. Article 25(1) eIDAS non-discrimination applies to electronic execution.",
    certificateNotice: "Executed under European Union eIDAS Regulation (EU) No 910/2014 Article 25(1).",
  },
  {
    countryCode: "AE",
    countryName: "United Arab Emirates",
    governingLawName: "Federal Decree-Law No. 46 of 2021 on Electronic Transactions and Trust Services",
    lawAbbreviation: "UAE Decree-Law 46/2021",
    arbitrationAct: "DIAC (Dubai International Arbitration Centre) Rules",
    defaultCurrency: "AED",
    taxIdLabel: "TRN (Tax Reg Number)",
    nationalIdLabel: "Emirates ID (EID)",
    disputeResolutionClause: "This Agreement is governed by the laws of the United Arab Emirates as applied in the Emirate of Dubai. Disputes shall be finally settled under the Arbitration Rules of DIAC.",
    certificateNotice: "Executed under UAE Federal Decree-Law No. 46 of 2021 on Electronic Transactions and Trust Services.",
  },
  {
    countryCode: "SA",
    countryName: "Saudi Arabia",
    governingLawName: "Electronic Transactions Law, 2007 (Royal Decree No. M/18)",
    lawAbbreviation: "KSA Royal Decree M/18",
    arbitrationAct: "Saudi Center for Commercial Arbitration (SCCA) Rules",
    defaultCurrency: "SAR",
    taxIdLabel: "TRN / VAT Number",
    nationalIdLabel: "National ID / Iqama",
    disputeResolutionClause: "This Agreement shall be governed by and construed in accordance with the laws of the Kingdom of Saudi Arabia. Any dispute shall be referred to final arbitration under the Saudi Center for Commercial Arbitration (SCCA).",
    certificateNotice: "Executed in compliance with the Electronic Transactions Law of Saudi Arabia (Royal Decree No. M/18).",
  },
  {
    countryCode: "CA",
    countryName: "Canada",
    governingLawName: "Uniform Electronic Commerce Act (UECA) & PIPEDA",
    lawAbbreviation: "Canada UECA & PIPEDA",
    arbitrationAct: "Commercial Arbitration Act (R.S.C., 1985, c. 17 (2nd Supp.))",
    defaultCurrency: "CAD",
    taxIdLabel: "Business Number (GST/HST)",
    nationalIdLabel: "Social Insurance No (SIN)",
    disputeResolutionClause: "This Agreement is governed by the laws of the Province of Ontario and the federal laws of Canada applicable therein. Disputes shall be resolved in courts of competent jurisdiction in Toronto.",
    certificateNotice: "Executed under Canada Uniform Electronic Commerce Act (UECA) and PIPEDA guidelines.",
  },
  {
    countryCode: "AU",
    countryName: "Australia",
    governingLawName: "Electronic Transactions Act 1999 (Cth)",
    lawAbbreviation: "Australia ETA 1999",
    arbitrationAct: "International Arbitration Act 1974 (Cth)",
    defaultCurrency: "AUD",
    taxIdLabel: "ABN (Australian Business No)",
    nationalIdLabel: "Tax File Number (TFN)",
    disputeResolutionClause: "This Agreement is governed by the laws of the State of New South Wales, Australia. Any dispute shall be resolved by arbitration in Sydney under the ACICA Rules.",
    certificateNotice: "Executed under Australian Federal Electronic Transactions Act 1999 guidelines.",
  },
  {
    countryCode: "SG",
    countryName: "Singapore",
    governingLawName: "Electronic Transactions Act 2010 (Cap. 88)",
    lawAbbreviation: "Singapore ETA 2010",
    arbitrationAct: "International Arbitration Act (Cap. 143A)",
    defaultCurrency: "SGD",
    taxIdLabel: "UEN (Unique Entity Number)",
    nationalIdLabel: "NRIC / FIN Card",
    disputeResolutionClause: "This Agreement shall be governed by and construed in accordance with the laws of Singapore. Disputes shall be referred to arbitration in Singapore under SIAC Rules.",
    certificateNotice: "Executed under Singapore Electronic Transactions Act 2010 guidelines.",
  },
  {
    countryCode: "IN",
    countryName: "India",
    governingLawName: "Information Technology Act, 2000 & Section 63 of Bharatiya Sakshya Adhiniyam (BSA) 2023",
    lawAbbreviation: "India IT Act & BSA",
    arbitrationAct: "Arbitration and Conciliation Act, 1996 of India",
    defaultCurrency: "INR",
    taxIdLabel: "GSTIN / PAN Number",
    nationalIdLabel: "Government ID (Optional)",
    disputeResolutionClause: "This Agreement shall be governed by the laws of India. Any dispute arising out of this agreement shall be referred to final and binding arbitration under the Arbitration and Conciliation Act, 1996.",
    certificateNotice: "Cryptographic audit record formatted in compliance with Section 63 of the Bharatiya Sakshya Adhiniyam, 2023.",
  },
  {
    countryCode: "PK",
    countryName: "Pakistan",
    governingLawName: "Electronic Transactions Ordinance (ETO), 2002",
    lawAbbreviation: "ETO 2002",
    arbitrationAct: "Arbitration Act 1940 of Pakistan",
    defaultCurrency: "PKR",
    taxIdLabel: "NTN (National Tax No)",
    nationalIdLabel: "CNIC Number",
    disputeResolutionClause: "This Agreement is governed by the laws of the Islamic Republic of Pakistan. Claims exceeding PKR 500,000 shall proceed to binding arbitration under the Arbitration Act 1940.",
    certificateNotice: "Executed under Pakistan Electronic Transactions Ordinance (ETO 2002) guidelines.",
  },
  {
    countryCode: "BR",
    countryName: "Brazil",
    governingLawName: "Provisional Measure No. 2.200-2/2001 & Law No. 14.063/2020",
    lawAbbreviation: "Brazil MP 2.200-2",
    arbitrationAct: "Arbitration Law (Law No. 9.307/1996)",
    defaultCurrency: "BRL",
    taxIdLabel: "CNPJ / CPF Number",
    nationalIdLabel: "RG / RNE Number",
    disputeResolutionClause: "This Agreement is governed by Brazilian law. Any dispute arising under it shall be resolved in courts of competent jurisdiction in São Paulo or by arbitration under Law No. 9.307/1996.",
    certificateNotice: "Executed in compliance with Brazilian Provisional Measure No. 2.200-2/2001 and Law No. 14.063/2020.",
  },
  {
    countryCode: "MX",
    countryName: "Mexico",
    governingLawName: "Código de Comercio (Commerce Code, Articles 89-114)",
    lawAbbreviation: "Mexico Commerce Code",
    arbitrationAct: "Arbitration Title in Commerce Code",
    defaultCurrency: "MXN",
    taxIdLabel: "RFC (Tax Identification)",
    nationalIdLabel: "CURP / INE Number",
    disputeResolutionClause: "This Agreement is governed by the Commerce Code and federal laws of Mexico. Any dispute shall be resolved by arbitration in Mexico City or courts of competent jurisdiction.",
    certificateNotice: "Executed under Mexico Commerce Code Article 89 electronic transaction rules.",
  },
  {
    countryCode: "CO",
    countryName: "Colombia",
    governingLawName: "Law 527 of 1999 & Decree 2364 of 2012",
    lawAbbreviation: "Colombia Law 527/1999",
    arbitrationAct: "Arbitration Statute (Law 1563 of 2012)",
    defaultCurrency: "COP",
    taxIdLabel: "NIT (Tax Identification)",
    nationalIdLabel: "Cédula de Ciudadanía",
    disputeResolutionClause: "This Agreement is governed by Colombian law. Disputes shall be resolved in Bogotá courts or through binding arbitration under Law 1563.",
    certificateNotice: "Executed under Colombian Law 527 of 1999 and regulatory Decree 2364 of 2012.",
  },
  {
    countryCode: "ID",
    countryName: "Indonesia",
    governingLawName: "Law No. 11/2008 on Electronic Information and Transactions (ITE Law)",
    lawAbbreviation: "Indonesia ITE Law",
    arbitrationAct: "Law No. 30/1999 on Arbitration",
    defaultCurrency: "IDR",
    taxIdLabel: "NPWP (Tax ID)",
    nationalIdLabel: "KTP (National ID Card)",
    disputeResolutionClause: "This Agreement is governed by the laws of the Republic of Indonesia. Disputes shall be resolved through BANI (Indonesian National Board of Arbitration) in Jakarta.",
    certificateNotice: "Executed under Republic of Indonesia ITE Law No. 11 of 2008 guidelines.",
  },
  {
    countryCode: "MY",
    countryName: "Malaysia",
    governingLawName: "Electronic Commerce Act 2006 & Digital Signature Act 1997",
    lawAbbreviation: "Malaysia ECA 2006",
    arbitrationAct: "Arbitration Act 2005 of Malaysia",
    defaultCurrency: "MYR",
    taxIdLabel: "SST / Tax Number",
    nationalIdLabel: "MyKad / NRIC Card",
    disputeResolutionClause: "This Agreement is governed by Malaysian law. Any dispute shall be resolved through AIAC (Asian International Arbitration Centre) in Kuala Lumpur.",
    certificateNotice: "Executed under Malaysian Electronic Commerce Act 2006 guidelines.",
  },
  {
    countryCode: "PH",
    countryName: "Philippines",
    governingLawName: "Electronic Commerce Act of 2000 (Republic Act No. 8792)",
    lawAbbreviation: "Philippines RA 8792",
    arbitrationAct: "Alternative Dispute Resolution Act (RA 9285)",
    defaultCurrency: "PHP",
    taxIdLabel: "TIN (Tax Registration)",
    nationalIdLabel: "Government Issued ID",
    disputeResolutionClause: "This Agreement is governed by the laws of the Republic of the Philippines. Disputes shall be resolved by arbitration in Manila or in courts of competent jurisdiction.",
    certificateNotice: "Executed under Philippines Electronic Commerce Act of 2000 (RA 8792) rules.",
  },
  {
    countryCode: "TH",
    countryName: "Thailand",
    governingLawName: "Electronic Transactions Act B.E. 2544 (2001)",
    lawAbbreviation: "Thailand ETA B.E. 2544",
    arbitrationAct: "Arbitration Act B.E. 2545 (2002)",
    defaultCurrency: "THB",
    taxIdLabel: "Tax Identification Number",
    nationalIdLabel: "Citizen ID Card Number",
    disputeResolutionClause: "This Agreement is governed by Thai law. Disputes shall be resolved through TAI (Thailand Arbitration Institute) in Bangkok.",
    certificateNotice: "Executed under Thailand Electronic Transactions Act B.E. 2544 guidelines.",
  },
  {
    countryCode: "VN",
    countryName: "Vietnam",
    governingLawName: "Law on Electronic Transactions 2005 (Updated 2023)",
    lawAbbreviation: "Vietnam Law on ET 2023",
    arbitrationAct: "Law on Commercial Arbitration 2010",
    defaultCurrency: "VND",
    taxIdLabel: "MST (Tax Identification)",
    nationalIdLabel: "Citizen Identity Card",
    disputeResolutionClause: "This Agreement is governed by Vietnamese law. Disputes shall be resolved through VIAC (Vietnam International Arbitration Centre) in Hanoi.",
    certificateNotice: "Executed under Vietnam Law on Electronic Transactions No. 51/2005/QH11 (updated 2023).",
  },
  {
    countryCode: "CN",
    countryName: "China",
    governingLawName: "Electronic Signature Law of the People's Republic of China",
    lawAbbreviation: "PRC E-Signature Law",
    arbitrationAct: "Arbitration Law of the PRC",
    defaultCurrency: "CNY",
    taxIdLabel: "USCI (Unified Social Credit)",
    nationalIdLabel: "Resident Identity Card",
    disputeClause: "This Agreement is governed by the laws of the People's Republic of China. Disputes shall be submitted to CIETAC (China International Economic and Trade Arbitration Commission) in Beijing.",
    certificateNotice: "Executed in compliance with the Electronic Signature Law of the People's Republic of China.",
  },
  {
    countryCode: "NG",
    countryName: "Nigeria",
    governingLawName: "Evidence Act 2011 & NITDA Act 2007",
    lawAbbreviation: "Nigeria Evidence Act 2011",
    arbitrationAct: "Arbitration and Mediation Act 2023",
    defaultCurrency: "NGN",
    taxIdLabel: "TIN (Tax Registration)",
    nationalIdLabel: "National Identification No",
    disputeResolutionClause: "This Agreement is governed by Nigerian law. Disputes shall be resolved in courts of competent jurisdiction in Lagos or through arbitration.",
    certificateNotice: "Executed under Nigerian Evidence Act 2011 Section 93 guidelines.",
  },
  {
    countryCode: "ZA",
    countryName: "South Africa",
    governingLawName: "Electronic Communications and Transactions Act (ECTA) 2002",
    lawAbbreviation: "South Africa ECTA 2002",
    arbitrationAct: "Arbitration Act 42 of 1965",
    defaultCurrency: "ZAR",
    taxIdLabel: "Tax Number (SARS)",
    nationalIdLabel: "National ID Card / Passport",
    disputeResolutionClause: "This Agreement is governed by South African law. Disputes shall be resolved through AFSA (Arbitration Foundation of Southern Africa) in Johannesburg.",
    certificateNotice: "Executed under South African Electronic Communications and Transactions Act No. 25 of 2002.",
  },
  {
    countryCode: "KE",
    countryName: "Kenya",
    governingLawName: "Kenya Information and Communications Act (KICA 2020)",
    lawAbbreviation: "Kenya KICA 2020",
    arbitrationAct: "Arbitration Act 1995 of Kenya",
    defaultCurrency: "KES",
    taxIdLabel: "KRA PIN Number",
    nationalIdLabel: "National ID Card Number",
    disputeResolutionClause: "This Agreement is governed by Kenyan law. Disputes shall be resolved through the Nairobi Centre for International Arbitration (NCIA).",
    certificateNotice: "Executed under Kenya Information and Communications Act (KICA) electronic signature rules.",
  },
  {
    countryCode: "EG",
    countryName: "Egypt",
    governingLawName: "E-Signature Law No. 15 of 2004",
    lawAbbreviation: "Egypt E-Signature Law",
    arbitrationAct: "Arbitration Law No. 27 of 1994",
    defaultCurrency: "EGP",
    taxIdLabel: "Tax Card / Registration",
    nationalIdLabel: "National ID Number",
    disputeResolutionClause: "This Agreement is governed by Egyptian law. Disputes shall be resolved through CRCICA (Cairo Regional Centre for International Commercial Arbitration).",
    certificateNotice: "Executed under Egypt E-Signature Law No. 15 of 2004 guidelines.",
  },
  {
    countryCode: "QA",
    countryName: "Qatar",
    governingLawName: "Electronic Commerce and Transactions Law (Law No. 16 of 2010)",
    lawAbbreviation: "Qatar Law No. 16/2010",
    arbitrationAct: "Arbitration Law (Law No. 2 of 2017)",
    defaultCurrency: "QAR",
    taxIdLabel: "Commercial Registry (CR)",
    nationalIdLabel: "QID (Qatari Identity Card)",
    disputeResolutionClause: "This Agreement is governed by Qatari law. Disputes shall be resolved through QICCA (Qatar International Center for Conciliation and Arbitration) in Doha.",
    certificateNotice: "Executed under Qatar Electronic Commerce and Transactions Law (Law No. 16 of 2010).",
  },
  {
    countryCode: "OM",
    countryName: "Oman",
    governingLawName: "Electronic Transactions Law (Royal Decree No. 69/2008)",
    lawAbbreviation: "Oman RD 69/2008",
    arbitrationAct: "Arbitration Law (Royal Decree No. 47/97)",
    defaultCurrency: "OMR",
    taxIdLabel: "Commercial Registration No",
    nationalIdLabel: "Civil ID Card Number",
    disputeResolutionClause: "This Agreement is governed by Omani law. Disputes shall be resolved in courts of competent jurisdiction in Muscat.",
    certificateNotice: "Executed under Oman Electronic Transactions Law (Royal Decree No. 69/2008).",
  },
  {
    countryCode: "GH",
    countryName: "Ghana",
    governingLawName: "Electronic Transactions Act, 2008 (Act 772)",
    lawAbbreviation: "Ghana Act 772",
    arbitrationAct: "Alternative Dispute Resolution Act, 2010 (Act 798)",
    defaultCurrency: "GHS",
    taxIdLabel: "TIN / Tax Pin",
    nationalIdLabel: "Ghana Card Number",
    disputeResolutionClause: "This Agreement is governed by Ghanaian law. Disputes shall be resolved by arbitration in Accra under Act 798.",
    certificateNotice: "Executed under Ghanaian Electronic Transactions Act, 2008 (Act 772) guidelines.",
  },
  {
    countryCode: "JM",
    countryName: "Jamaica",
    governingLawName: "Electronic Transactions Act, 2006",
    lawAbbreviation: "Jamaica ET Act 2006",
    arbitrationAct: "Arbitration Act, 2017 of Jamaica",
    defaultCurrency: "JMD",
    taxIdLabel: "TRN Number",
    nationalIdLabel: "National ID Card / Passport",
    disputeResolutionClause: "This Agreement is governed by Jamaican law. Disputes shall be resolved in courts of competent jurisdiction in Kingston.",
    certificateNotice: "Executed under Jamaican Electronic Transactions Act, 2006 guidelines.",
  },
];

async function main() {
  console.log("Seeding global jurisdictions...");
  for (const j of JURISDICTIONS) {
    const data = {
      countryCode: j.countryCode,
      countryName: j.countryName,
      governingLawName: j.governingLawName,
      lawAbbreviation: j.lawAbbreviation,
      arbitrationAct: j.arbitrationAct,
      defaultCurrency: j.defaultCurrency as any,
      taxIdLabel: j.taxIdLabel,
      nationalIdLabel: j.nationalIdLabel,
      disputeResolutionClause: (j as any).disputeResolutionClause || (j as any).disputeClause,
      certificateNotice: j.certificateNotice || (j as any).certificateLegalNotice,
    };
    const record = await prisma.jurisdiction.upsert({
      where: { countryCode: data.countryCode },
      update: data,
      create: data as any,
    });
    console.log(`Upserted jurisdiction: ${record.countryName} (${record.countryCode})`);
  }
  console.log("Seed complete.");
}


main()
  .catch((e) => {
    console.error("Error seeding jurisdictions:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
