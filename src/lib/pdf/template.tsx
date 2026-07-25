import React from "react";
import { getCompanyConfig } from "@/lib/config";
import { formatLegalDate, parseUserAgentString, formatUsageLicenseText, formatDeliverableTypeName } from "@/lib/utils";
import { getJurisdiction } from "@/lib/config/jurisdictions";
import { formatCurrencyAmount } from "@/lib/currency";

interface PDFTemplateProps {
  contract: any;
}

export const ContractPDFTemplate: React.FC<PDFTemplateProps> = ({ contract }) => {
  const company = getCompanyConfig();
  const jur = getJurisdiction(contract.jurisdictionCountryCode || "US");

  const getRemainingAmount = () => {
    return Number(contract.totalAmount || 0) - Number(contract.advancePayment || 0);
  };

  const initiatorParty = contract.parties?.find((p: any) => p.partyType === "INITIATOR") || {
    name: contract.initiator?.name || "Initiator",
    email: contract.initiator?.email || "",
    phone: contract.initiatorPhone || contract.initiator?.phone,
    role: contract.contractType?.startsWith("CREATOR_") ? "CREATOR" : contract.contractType?.startsWith("BRAND_") ? "BRAND" : "AGENCY",
    designation: contract.initiatorDesignation,
    companyName: contract.initiatorCompanyName || contract.initiator?.agencyName,
    companyAddress: contract.initiatorCompanyAddress || contract.initiator?.agencyAddress,
    ntn: contract.initiatorNtn,
    cnic: contract.initiatorCnic,
    paymentMethod: contract.paymentMethod,
    bankAccountIban: contract.bankAccountIban,
    mobileWalletNumber: contract.mobileWalletNumber,
  };

  const respondentParty = contract.parties?.find((p: any) => p.partyType === "RESPONDENT") || {
    name: contract.respondentName || contract.respondent?.name || "Pending Execution",
    email: contract.respondentEmail || contract.respondent?.email || "Pending Execution",
    phone: contract.respondentPhone || contract.respondent?.phone,
    role: contract.contractType?.endsWith("_CREATOR") ? "CREATOR" : contract.contractType?.endsWith("_BRAND") ? "BRAND" : "AGENCY",
    designation: contract.respondentDesignation,
    companyName: contract.respondentCompany || contract.respondent?.agencyName,
    companyAddress: contract.respondentAddress || contract.respondent?.agencyAddress,
    ntn: contract.respondentNtn,
    cnic: contract.respondentCnic,
    paymentMethod: contract.respondentPaymentMethod,
    bankAccountIban: contract.respondentBankAccountIban,
    mobileWalletNumber: contract.respondentMobileWalletNumber,
  };

  const initiatorSign = contract.signatures?.find(
    (s: any) => s.signerPartyId === (initiatorParty as any).id || s.signerId === contract.initiatorId || s.signerRole === initiatorParty.role
  );

  const respondentSign = contract.signatures?.find(
    (s: any) => s.signerPartyId === (respondentParty as any).id || (s.signerId && s.signerId !== contract.initiatorId) || (s.id !== initiatorSign?.id)
  );

  const getContractTitle = () => {
    switch (contract.contractType as string) {
      case "AGENCY_TO_BRAND":
        return "AGENCY TO BRAND INFLUENCER MARKETING & CONTENT LICENSING AGREEMENT";
      case "AGENCY_TO_CREATOR":
        return "AGENCY TO CREATOR CONTENT PRODUCTION & SERVICE AGREEMENT";
      case "BRAND_TO_CREATOR":
        return "BRAND TO CREATOR DIRECT SPONSORSHIP AGREEMENT";
      case "BRAND_TO_AGENCY":
        return "BRAND TO AGENCY CAMPAIGN MANAGEMENT & SERVICE AGREEMENT";
      case "CREATOR_TO_BRAND":
        return "CREATOR TO BRAND DIRECT CONTENT ENGAGEMENT AGREEMENT";
      case "CREATOR_TO_AGENCY":
        return "CREATOR TO AGENCY CONTENT COLLABORATION & SERVICE AGREEMENT";
      default:
        return "MUTUAL COLLABORATION & CONTENT LICENSING AGREEMENT";
    }
  };

  const partyATaxId = initiatorParty.taxId || initiatorParty.ntn || initiatorParty.cnic || initiatorParty.nationalId;
  const partyBTaxId = respondentParty.taxId || respondentParty.ntn || respondentParty.cnic || respondentParty.nationalId;

  return (
    <div style={{ padding: "30px", fontFamily: "Helvetica, Arial, sans-serif", color: "#0f172a", fontSize: "12px", lineHeight: "1.5" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "2px solid #0f172a", paddingBottom: "10px", marginBottom: "14px" }}>
        <div>
          <h1 style={{ fontSize: "22px", margin: "0", fontWeight: "900", color: "#000" }}>{company.name}</h1>
          <p style={{ margin: "2px 0 0 0", fontSize: "10px", color: "#475569" }}>{company.legalInfo}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <h4 style={{ margin: "0", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>{getContractTitle()}</h4>
          <p style={{ margin: "2px 0 0 0", fontSize: "9.5px", color: "#64748b" }}>
            Ref No: <strong style={{ color: "#2563eb" }}>{contract.contractNumber}</strong> | Structured under {jur.lawAbbreviation}
          </p>
        </div>
      </div>

      {contract.status === "DRAFT" && (
        <div style={{ background: "#fffbebf0", border: "1.5px solid #f59e0b", borderRadius: "6px", padding: "6px 12px", fontSize: "10px", fontWeight: "800", color: "#b45309", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
          DRAFT PREVIEW — UNEXECUTED &amp; UNVERIFIED DOCUMENT (FOR REVIEW ONLY)
        </div>
      )}

      {/* Preamble */}
      <div style={{ backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "8px 12px", fontSize: "10px", color: "#334155", marginBottom: "14px" }}>
        <strong>LEGAL PREAMBLE &amp; E-SIGN BINDING NOTICE:</strong> This document represents a legally binding electronic agreement executed under {jur.governingLawName} of {jur.countryName}. SignCollab is a neutral technology platform provider facilitating electronic agreement execution. All parameters, financial consideration, usage licenses, and bilateral penalties set forth herein are legally enforceable upon bilateral execution.
      </div>

      {/* Section 1: Parties */}
      <div style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#0f172a", borderBottom: "1.5px solid #0f172a", paddingBottom: "3px", marginBottom: "8px" }}>
        1. PARTIES &amp; LEGAL IDENTIFICATION
      </div>
      <div style={{ display: "flex", gap: "14px", marginBottom: "14px" }}>
        <div style={{ flex: 1, border: "1px solid #cbd5e1", borderRadius: "6px", padding: "10px", fontSize: "11px", backgroundColor: "#f8fafc" }}>
          <div style={{ fontWeight: "800", textTransform: "uppercase", color: "#475569", marginBottom: "4px", fontSize: "9px" }}>PARTY A (INITIATOR ENTITY)</div>
          <div style={{ fontSize: "13px", fontWeight: "900", color: "#0f172a", textTransform: "uppercase", marginBottom: "2px" }}>
            {initiatorParty.companyName || initiatorParty.name}
          </div>
          {partyATaxId && <div style={{ margin: "1px 0", fontSize: "10px", color: "#475569", fontWeight: "700" }}>Tax Identification: {partyATaxId}</div>}
          
          <div style={{ marginTop: "8px", borderTop: "1px solid #e2e8f0", paddingTop: "6px" }}>
            <div style={{ fontWeight: "800", textTransform: "uppercase", color: "#64748b", fontSize: "9px", marginBottom: "3px" }}>
              {initiatorParty.companyName ? "Authorized Signatory Representative" : "Individual Signer Details"}
            </div>
            <div style={{ margin: "2px 0" }}><strong>Representative:</strong> {initiatorParty.name} {initiatorParty.designation ? `(${initiatorParty.designation})` : ""}</div>
            <div style={{ margin: "2px 0" }}><strong>Email:</strong> {initiatorParty.email}</div>
            {initiatorParty.phone && <div style={{ margin: "2px 0" }}><strong>Phone:</strong> {initiatorParty.phone}</div>}
            {(initiatorParty.companyAddress || (initiatorParty as any).address || contract.initiatorCompanyAddress || contract.initiator?.agencyAddress || contract.initiator?.address || contract.collabDeliveryAddress) && (
              <div style={{ margin: "2px 0" }}>
                <strong>Address:</strong> {initiatorParty.companyAddress || (initiatorParty as any).address || contract.initiatorCompanyAddress || contract.initiator?.agencyAddress || contract.initiator?.address || contract.collabDeliveryAddress}
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: 1, border: "1px solid #cbd5e1", borderRadius: "6px", padding: "10px", fontSize: "11px", backgroundColor: "#f8fafc" }}>
          <div style={{ fontWeight: "800", textTransform: "uppercase", color: "#475569", marginBottom: "4px", fontSize: "9px" }}>PARTY B (COUNTERPARTY ENTITY)</div>
          <div style={{ fontSize: "13px", fontWeight: "900", color: "#0f172a", textTransform: "uppercase", marginBottom: "2px" }}>
            {respondentParty.companyName || (respondentParty.role === "CREATOR" ? (contract.creatorName || respondentParty.name) : respondentParty.name)}
          </div>
          {partyBTaxId && <div style={{ margin: "1px 0", fontSize: "10px", color: "#475569", fontWeight: "700" }}>Tax Identification: {partyBTaxId}</div>}
          
          <div style={{ marginTop: "8px", borderTop: "1px solid #e2e8f0", paddingTop: "6px" }}>
            <div style={{ fontWeight: "800", textTransform: "uppercase", color: "#64748b", fontSize: "9px", marginBottom: "3px" }}>
              Authorized Signatory / Representative Details
            </div>
            <div style={{ margin: "2px 0" }}><strong>Representative:</strong> {respondentParty.name} {respondentParty.designation ? `(${respondentParty.designation})` : ""}</div>
            <div style={{ margin: "2px 0" }}><strong>Email:</strong> {respondentParty.email}</div>
            {respondentParty.phone && <div style={{ margin: "2px 0" }}><strong>Phone:</strong> {respondentParty.phone}</div>}
            {(respondentParty.companyAddress || (respondentParty as any).address || contract.respondentAddress || contract.collabDeliveryAddress) && (
              <div style={{ margin: "2px 0" }}>
                <strong>Address:</strong> {respondentParty.companyAddress || (respondentParty as any).address || contract.respondentAddress || contract.collabDeliveryAddress}
              </div>
            )}
          </div>
        </div>
      </div>

      {(() => {
        // Resolve Creator Name & Handle
        const cName = contract.creatorName || (initiatorParty.role === "CREATOR" ? initiatorParty.name : respondentParty.role === "CREATOR" ? respondentParty.name : undefined);
        const cHandle = contract.creatorHandle || undefined;

        // Resolve Client Brand Name & Handle
        let bName = contract.brandName;
        if (!bName) {
          if (initiatorParty.role === "BRAND") bName = initiatorParty.companyName || initiatorParty.name;
          else if (respondentParty.role === "BRAND") bName = respondentParty.companyName || respondentParty.name;
        }
        const bHandle = contract.brandHandle || undefined;

        // Resolve Managing Agency Name
        let aName = contract.agencyName;
        if (!aName) {
          if (initiatorParty.role === "AGENCY") aName = initiatorParty.companyName || initiatorParty.name;
          else if (respondentParty.role === "AGENCY") aName = respondentParty.companyName || respondentParty.name;
        }

        const campaign = contract.campaignName || undefined;

        if (!bName && !cName && !aName && !campaign) return null;

        return (
          <div style={{ border: "1px solid #cbd5e1", borderRadius: "6px", padding: "8px 12px", backgroundColor: "#ffffff", marginBottom: "14px", fontSize: "11px" }}>
            <div style={{ fontWeight: "800", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>CAMPAIGN &amp; TALENT ASSIGNMENT</div>
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
              {bName && <div><strong>Client Brand:</strong> {bName} {bHandle ? `(${bHandle})` : ""}</div>}
              {aName && <div><strong>Managing Agency:</strong> {aName}</div>}
              {campaign && <div><strong>Campaign / Product:</strong> {campaign}</div>}
              {cName && <div><strong>Target Creator:</strong> {cName} {cHandle ? `(${cHandle})` : ""}</div>}
            </div>
          </div>
        );
      })()}

      {/* Section 2: Deliverables */}
      <div style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#0f172a", borderBottom: "1.5px solid #0f172a", paddingBottom: "3px", marginTop: "14px", marginBottom: "8px" }}>
        2. CAMPAIGN DELIVERABLES SPECIFICATIONS &amp; RETENTION ENFORCEMENT
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "8px", fontSize: "11px", border: "1px solid #cbd5e1" }}>
        <thead>
          <tr style={{ backgroundColor: "#f1f5f9", color: "#0f172a", textTransform: "uppercase", fontSize: "10px" }}>
            <th style={{ padding: "6px 8px", border: "1px solid #cbd5e1", textAlign: "left" }}>Platform Format</th>
            <th style={{ padding: "6px 8px", border: "1px solid #cbd5e1", textAlign: "center", width: "60px" }}>Quantity</th>
            <th style={{ padding: "6px 8px", border: "1px solid #cbd5e1", textAlign: "center", width: "120px" }}>Stay Published</th>
            <th style={{ padding: "6px 8px", border: "1px solid #cbd5e1", textAlign: "left" }}>Brief &amp; Instructions</th>
          </tr>
        </thead>
        <tbody>
          {contract.deliverables?.map((d: any) => (
            <tr key={d.id}>
              <td style={{ padding: "6px 8px", border: "1px solid #cbd5e1", fontWeight: "bold" }}>{formatDeliverableTypeName(d.type)}</td>
              <td style={{ padding: "6px 8px", border: "1px solid #cbd5e1", textAlign: "center", fontWeight: "bold" }}>{d.quantity}</td>
              <td style={{ padding: "6px 8px", border: "1px solid #cbd5e1", textAlign: "center", color: "#475569" }}>{d.duration || "Permanent"}</td>
              <td style={{ padding: "6px 8px", border: "1px solid #cbd5e1", color: "#334155" }}>{d.notes || "Standard creative execution as agreed."}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ fontSize: "10px", color: "#475569", marginBottom: "14px", fontStyle: "italic" }}>
        * RETENTION BREACH ENFORCEMENT: Premature deletion, archiving, or hiding of deliverables prior to the agreed retention duration constitutes a material breach, subjecting the breaching party to a mandatory pro-rata refund plus a 25% early-deletion penalty fee.
      </div>

      {/* Section 3: Usage Rights */}
      <div style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#0f172a", borderBottom: "1.5px solid #0f172a", paddingBottom: "3px", marginTop: "14px", marginBottom: "8px" }}>
        3. USAGE RIGHTS, PLATFORM SCOPE &amp; LICENSING TERMS
      </div>
      <div style={{ border: "1px solid #cbd5e1", borderRadius: "6px", padding: "10px", fontSize: "11px", marginBottom: "14px", backgroundColor: "#ffffff", lineHeight: "1.6" }}>
        <div style={{ marginBottom: "4px" }}><strong>Permitted Platforms:</strong> {contract.platformsAllowed?.map((p: string) => (p === "X_TWITTER" ? "X (TWITTER)" : p)).join(", ")}</div>
        <div style={{ marginBottom: "4px" }}><strong>Granted Commercial License:</strong> <strong>{formatUsageLicenseText(contract.usageType)}</strong></div>
        <div style={{ marginBottom: "4px" }}><strong>Licensed Duration:</strong> <strong>{contract.usageRightsDuration}</strong></div>
        <div style={{ fontSize: "10px", color: "#64748b", marginTop: "6px", borderTop: "1px dashed #cbd5e1", paddingTop: "4px" }}>
          <em>WITHHELD RIGHTS NOTICE: {initiatorParty.role === "CREATOR" ? "Party A (Creator) reserves" : respondentParty.role === "CREATOR" ? "Party A and Party B (Creator) reserve" : "Both Parties reserve"} all intellectual property rights not expressly granted above. Any commercial re-use, television broadcast, dark-posting, or off-platform print distribution outside the licensed parameters is strictly prohibited without prior written amendment.</em>
        </div>
      </div>

      {/* Section 4: Financial Compensation */}
      <div style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#0f172a", borderBottom: "1.5px solid #0f172a", paddingBottom: "3px", marginTop: "14px", marginBottom: "8px" }}>
        4. FINANCIAL COMPENSATION &amp; PAYMENT SCHEDULE
      </div>
      {(() => {
        const isRespondentPayee = ["BRAND_TO_CREATOR", "AGENCY_TO_CREATOR", "BRAND_TO_AGENCY"].includes(contract.contractType);
        
        const payeeParty = isRespondentPayee ? respondentParty : initiatorParty;
        const payeeMethod = (isRespondentPayee ? (contract.respondentPaymentMethod || payeeParty.paymentMethod || contract.paymentMethod) : (payeeParty.paymentMethod || contract.paymentMethod)) as string | undefined;
        const payeeIban = isRespondentPayee ? (contract.respondentBankAccountIban || payeeParty.bankAccountIban || contract.bankAccountIban) : (payeeParty.bankAccountIban || contract.bankAccountIban);
        const payeeWallet = isRespondentPayee ? (contract.respondentMobileWalletNumber || payeeParty.mobileWalletNumber || contract.mobileWalletNumber) : (payeeParty.mobileWalletNumber || contract.mobileWalletNumber);

        const routeText = payeeMethod
          ? (payeeMethod === "BANK_IBAN" ? (payeeIban || "Pending Execution") : (payeeWallet || "Pending Execution"))
          : "Pending Execution";

        return (
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "14px", fontSize: "11px", border: "1px solid #cbd5e1" }}>
            <thead>
              <tr style={{ backgroundColor: "#f1f5f9", color: "#0f172a", textTransform: "uppercase", fontSize: "10px" }}>
                <th style={{ padding: "6px 8px", border: "1px solid #cbd5e1", textAlign: "left" }}>Total Campaign Valuation</th>
                <th style={{ padding: "6px 8px", border: "1px solid #cbd5e1", textAlign: "left" }}>Advance Payment</th>
                <th style={{ padding: "6px 8px", border: "1px solid #cbd5e1", textAlign: "left" }}>Remaining Payout</th>
                <th style={{ padding: "6px 8px", border: "1px solid #cbd5e1", textAlign: "left" }}>Payout Route ({isRespondentPayee ? "Party B" : "Party A"})</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "6px 8px", border: "1px solid #cbd5e1", fontWeight: "bold", fontSize: "12px" }}>{formatCurrencyAmount(contract.totalAmount, contract.currency || jur.defaultCurrency || "USD")}</td>
                <td style={{ padding: "6px 8px", border: "1px solid #cbd5e1" }}>
                  <strong>{formatCurrencyAmount(contract.advancePayment || 0, contract.currency || jur.defaultCurrency || "USD")}</strong>
                  {contract.advancePaymentDate && <><br /><span style={{ fontSize: "10px", color: "#64748b" }}>Due: {formatLegalDate(contract.advancePaymentDate)}</span></>}
                </td>
                <td style={{ padding: "6px 8px", border: "1px solid #cbd5e1" }}>
                  <strong>{formatCurrencyAmount(getRemainingAmount(), contract.currency || jur.defaultCurrency || "USD")}</strong>
                  {contract.remainingPaymentDate && <><br /><span style={{ fontSize: "10px", color: "#64748b" }}>Due: {formatLegalDate(contract.remainingPaymentDate)}</span></>}
                </td>
                <td style={{ padding: "6px 8px", border: "1px solid #cbd5e1" }}>
                  <strong>{payeeMethod ? payeeMethod.replace(/_/g, " ") : "Not Specified"}</strong>
                  <br /><span style={{ fontSize: "10px", fontFamily: "monospace", color: "#475569" }}>{routeText}</span>
                </td>
              </tr>
            </tbody>
          </table>
        );
      })()}
      <div style={{ fontSize: "9px", color: "#64748b", fontStyle: "italic", marginTop: "-8px", marginBottom: "12px" }}>
        * Note: All financial valuation figures are inclusive of statutory local sales taxes (VAT / GST). Each party is responsible for their own tax compliance.
      </div>

      {/* Section 5: Delivery & Revisions */}
      <div style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#0f172a", borderBottom: "1.5px solid #0f172a", paddingBottom: "3px", marginTop: "14px", marginBottom: "8px" }}>
        5. DELIVERY TIMEFRAME, REVISIONS &amp; PRE-APPROVAL PROTOCOL
      </div>
      <div style={{ border: "1px solid #cbd5e1", borderRadius: "6px", padding: "10px", fontSize: "11px", marginBottom: "14px", backgroundColor: "#ffffff" }}>
        <div style={{ display: "flex", gap: "20px", marginBottom: "4px" }}>
          <div style={{ flex: 1 }}><strong>Initial Delivery Window:</strong> {contract.deliveryTimeframeDays} Days (commences post product/advance receipt)</div>
          <div style={{ flex: 1 }}><strong>Revision Rounds:</strong> {contract.revisionRounds} Rounds ({contract.revisionTurnaroundDays || 5} Days/Round)</div>
          <div style={{ flex: 1 }}><strong>Content Pre-Approval:</strong> <strong>{contract.brandApprovalRequired ? "Required (48-Hr Deemed Approval)" : "Not Required"}</strong></div>
        </div>
        <div style={{ fontSize: "10px", color: "#475569", borderTop: "1px dashed #cbd5e1", paddingTop: "4px", marginTop: "4px" }}>
          <strong>DELIVERY &amp; NDA PUBLISHING PROTOCOL:</strong> Delivery timeframe starts post physical product receipt (if product shipment is agreed) or post advance payment receipt (if no product loan/shipment), counted as Round 1. If draft revisions are requested, revised drafts must be submitted within {contract.revisionTurnaroundDays || 5} calendar days per round. Content shall not be published prior to an active NDA Embargo Launch Threshold Date regardless of pre-approval.
        </div>
      </div>

      {/* Section 6: Exclusivity */}
      <div style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#0f172a", borderBottom: "1.5px solid #0f172a", paddingBottom: "3px", marginTop: "14px", marginBottom: "8px" }}>
        6. EXCLUSIVITY RESTRICTIONS &amp; PROHIBITED COMPETITORS
      </div>
      <div style={{ border: "1px solid #cbd5e1", borderRadius: "6px", padding: "10px", fontSize: "11px", marginBottom: "14px", backgroundColor: "#ffffff" }}>
        <div style={{ marginBottom: "4px" }}><strong>Exclusivity Clause Status:</strong> <strong>{contract.exclusivityClause ? `Active (${contract.exclusivityDuration || "Yes"})` : "Not Required"}</strong></div>
        {contract.exclusivityClause && (
          <div style={{ fontSize: "10px", color: "#475569" }}>* Exclusivity duration commences on the official post date of the first campaign deliverable.</div>
        )}
        {contract.exclusivityClause && contract.exclusivityCompetitors && (
          <div style={{ marginTop: "4px", fontSize: "10px", color: "#dc2626" }}><strong>Prohibited Competitors / Categories:</strong> {contract.exclusivityCompetitors}</div>
        )}
      </div>

      {/* Section 7: NDA & Embargo */}
      <div style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#0f172a", borderBottom: "1.5px solid #0f172a", paddingBottom: "3px", marginTop: "14px", marginBottom: "8px" }}>
        7. CONFIDENTIALITY &amp; PRE-LAUNCH PRODUCT EMBARGO (NDA)
      </div>
      <div style={{ border: `1px solid ${contract.confidentialityRequired ? "#fde68a" : "#cbd5e1"}`, borderRadius: "6px", padding: "10px", fontSize: "11px", marginBottom: "14px", backgroundColor: contract.confidentialityRequired ? "#fffbeb" : "#ffffff" }}>
        <div><strong>Confidentiality Status:</strong> <strong>{contract.confidentialityRequired ? "STRICT PRE-LAUNCH NDA ACTIVE" : "Standard Commercial Confidentiality"}</strong></div>
        {contract.confidentialityRequired && (
          <div style={{ marginTop: "4px", fontSize: "10px", color: "#92400e" }}>
            <strong>Embargo Launch Date:</strong> {contract.embargoDate ? formatLegalDate(contract.embargoDate) : "Required until official product launch"}<br />
            {contract.earlyDisclosurePenalty && <><strong>Early Disclosure Leak Penalty:</strong> {formatCurrencyAmount(contract.earlyDisclosurePenalty, contract.currency || jur.defaultCurrency || "USD")} payable upon unauthorized leak or premature posting.</>}
          </div>
        )}
      </div>

      {/* Section 8: Product Shipment & Loan Return Terms */}
      {(contract.collabProduct || contract.collabDeliveryDate || contract.collabDeliveryAddress) && (
        <>
          <div style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#0f172a", borderBottom: "1.5px solid #0f172a", paddingBottom: "3px", marginTop: "14px", marginBottom: "8px" }}>
            8. COLLABORATION PRODUCT SHIPMENT &amp; LOAN RETURN TERMS
          </div>
          <div style={{ border: "1px solid #cbd5e1", borderRadius: "6px", padding: "10px", fontSize: "11px", marginBottom: "14px", backgroundColor: "#ffffff" }}>
            <div style={{ display: "flex", gap: "20px" }}>
              <div><strong>Product Details:</strong> {contract.collabProduct || "Product Sample / Provision"} ({contract.collabProductProvisionType || "Provision"})</div>
              {contract.collabDeliveryDate && <div><strong>Expected Product Arrival:</strong> {formatLegalDate(contract.collabDeliveryDate)}</div>}
            </div>
            {contract.collabDeliveryAddress && <div style={{ marginTop: "4px", fontSize: "10px", color: "#475569" }}><strong>Shipment Address:</strong> {contract.collabDeliveryAddress}</div>}
            {contract.collabProductProvisionType === "Product Loan" && (
              <div style={{ marginTop: "6px", paddingTop: "6px", borderTop: "1px dashed #cbd5e1", fontSize: "10px", color: "#92400e" }}>
                <strong>PRODUCT LOAN RETURN CONDITIONS:</strong> Loaned product must be returned to Brand within {contract.collabProductReturnDays || 7} calendar days post-deliverable. Return shipping costs paid by {contract.collabProductReturnShippingBy || "Brand"}. Failure to return or returning in damaged condition incurs a mandatory non-return penalty of {formatCurrencyAmount(contract.collabProductNonReturnFee || 0, contract.currency || jur.defaultCurrency || "USD")}.
                {contract.collabProductReturnAddress && <><br />Return Address: {contract.collabProductReturnAddress}</>}
              </div>
            )}
          </div>
        </>
      )}

      {/* Section 9: Tagging & Copyright */}
      <div style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#0f172a", borderBottom: "1.5px solid #0f172a", paddingBottom: "3px", marginTop: "14px", marginBottom: "8px" }}>
        9. TAGGING REQUIREMENTS &amp; COPYRIGHT OWNERSHIP
      </div>
      <div style={{ border: "1px solid #cbd5e1", borderRadius: "6px", padding: "10px", fontSize: "11px", marginBottom: "14px", backgroundColor: "#ffffff", lineHeight: "1.5" }}>
        {contract.taggingRequirements && <div style={{ marginBottom: "4px" }}><strong>Tagging &amp; Caption Guidelines:</strong> {contract.taggingRequirements}</div>}
        <div><strong>Content Copyright Clause:</strong> {contract.contentOwnership}</div>
      </div>

      {/* Section 10: Bilateral Safeguard Penalties */}
      <div style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#0f172a", borderBottom: "1.5px solid #0f172a", paddingBottom: "3px", marginTop: "14px", marginBottom: "8px" }}>
        10. BILATERAL SAFEGUARD PENALTIES &amp; LIQUIDATED DAMAGES
      </div>
      <div style={{ border: "1px solid #cbd5e1", borderRadius: "6px", padding: "10px", fontSize: "10px", marginBottom: "14px", backgroundColor: "#f8fafc", lineHeight: "1.6" }}>
        {(() => {
          const payerRole = ["BRAND_TO_CREATOR", "BRAND_TO_AGENCY", "CREATOR_TO_BRAND", "AGENCY_TO_BRAND"].includes(contract.contractType)
            ? "Brand"
            : "Agency";
          const delivererRole = ["BRAND_TO_CREATOR", "AGENCY_TO_CREATOR", "CREATOR_TO_BRAND", "CREATOR_TO_AGENCY"].includes(contract.contractType)
            ? "Creator"
            : "Agency";
          const payerPartyLabel = initiatorParty.role === payerRole.toUpperCase() ? "Party A" : "Party B";
          const delivererPartyLabel = initiatorParty.role === delivererRole.toUpperCase() ? "Party A" : "Party B";
          return (
            <>
              <div>• <strong>Late Payment Penalty (Charged to {payerPartyLabel} / {payerRole}):</strong> {Number(contract.latePaymentPenaltyPct)}% per calendar day of delay (capped at max {Number(contract.penaltyCapPct || 20)}% of total value as agreed liquidated damages under Section 74 Contract Act 1872).</div>
              <div>• <strong>Late Content Delivery Penalty (Charged to {delivererPartyLabel} / {delivererRole}):</strong> {Number(contract.lateContentPenaltyPct)}% per calendar day of delay (capped at max {Number(contract.penaltyCapPct || 20)}% of total value as agreed liquidated damages).</div>
            </>
          );
        })()}
        <div>• <strong>Non-Delivery Threshold &amp; Cutoff:</strong> Content delivery delayed beyond {contract.nonDeliveryCutoffDays || 7} calendar days post-deadline legally constitutes Non-Delivery, terminating daily late fees and triggering the 100% advance refundability clause with zero enforcement gap.</div>
        <div>• <strong>Unauthorized Brand Re-Use Penalty:</strong> {Number(contract.unauthorizedUsagePenaltyPct || 50)}% of total contract value per violation outside licensed platforms, duration, or scope.</div>
        <div>• <strong>Pre-Delivery Termination Fee:</strong> {Number(contract.cancellationFeePct || 25)}% of total campaign fee owed if terminated post-execution prior to deliverable hand-off.</div>
      </div>

      {/* Section 11: Governing Law & Dispute Resolution */}
      <div style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#0f172a", borderBottom: "1.5px solid #0f172a", paddingBottom: "3px", marginTop: "14px", marginBottom: "8px" }}>
        11. GOVERNING LAW &amp; ALTERNATIVE DISPUTE RESOLUTION (ADR)
      </div>
      <div style={{ border: "1px solid #cbd5e1", borderRadius: "6px", padding: "10px", fontSize: "10px", marginBottom: "14px", backgroundColor: "#ffffff", lineHeight: "1.6" }}>
        {jur.disputeClause} Legal recourse and dispute determination shall be administered under the <strong>{jur.arbitrationAct}</strong>.
      </div>

      {/* Section 12: Signature execution log */}
      <div style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#0f172a", borderBottom: "1.5px solid #0f172a", paddingBottom: "3px", marginTop: "18px", marginBottom: "8px" }}>
        12. {jur.lawAbbreviation.toUpperCase()} BILATERAL SIGNATURE AUDIT LOG &amp; CRYPTOGRAPHIC VERIFICATION
      </div>
      <div style={{ display: "flex", gap: "16px", marginTop: "10px" }}>
        <div style={{ flex: 1, border: "1px solid #cbd5e1", borderRadius: "6px", padding: "10px", textAlign: "center", backgroundColor: "#ffffff" }}>
          <div style={{ fontSize: "10px", fontWeight: "800", textTransform: "uppercase", color: "#475569" }}>PARTY A (INITIATOR SIGNATURE)</div>
          {initiatorSign ? (
            <div>
              <div style={{ height: "55px", display: "flex", alignItems: "center", justifyContent: "center", margin: "6px 0" }}>
                <img src={initiatorSign.signatureImageUrl} alt="Party A Sig" style={{ maxHeight: "50px", maxWidth: "160px", objectFit: "contain" }} />
              </div>
              <div style={{ fontSize: "9px", color: "#334155" }}>
                <div style={{ fontWeight: "800", color: "#0f172a", fontSize: "10px", textTransform: "uppercase" }}>EXECUTED ON BEHALF OF:</div>
                <div style={{ fontWeight: "900", color: "#2563eb", textTransform: "uppercase", fontSize: "11px", marginBottom: "4px" }}>
                  {initiatorParty.companyName || initiatorParty.name}
                </div>
                <div>Authorized Signer: <strong>{initiatorParty.name}</strong> {initiatorParty.designation ? `(${initiatorParty.designation})` : ""}</div>
                <div>Verified Email OTP: ✓ Verified | Email: {initiatorParty.email} | IP: {initiatorSign.ipAddress}</div>
                <div>Signed: {formatLegalDate(initiatorSign.signedAt)}</div>
              </div>
            </div>
          ) : (
            <div style={{ height: "55px", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontStyle: "italic", fontSize: "10px" }}>Pending Signature</div>
          )}
        </div>

        <div style={{ flex: 1, border: "1px solid #cbd5e1", borderRadius: "6px", padding: "10px", textAlign: "center", backgroundColor: "#ffffff" }}>
          <div style={{ fontSize: "10px", fontWeight: "800", textTransform: "uppercase", color: "#475569" }}>PARTY B (RESPONDENT SIGNATURE)</div>
          {respondentSign ? (
            <div>
              <div style={{ height: "55px", display: "flex", alignItems: "center", justifyContent: "center", margin: "6px 0" }}>
                <img src={respondentSign.signatureImageUrl} alt="Party B Sig" style={{ maxHeight: "50px", maxWidth: "160px", objectFit: "contain" }} />
              </div>
              <div style={{ fontSize: "9px", color: "#334155" }}>
                <div style={{ fontWeight: "800", color: "#0f172a", fontSize: "10px", textTransform: "uppercase" }}>EXECUTED ON BEHALF OF:</div>
                <div style={{ fontWeight: "900", color: "#2563eb", textTransform: "uppercase", fontSize: "11px", marginBottom: "4px" }}>
                  {respondentParty.companyName || (respondentParty.role === "CREATOR" ? (contract.creatorName || respondentParty.name) : respondentParty.name)}
                </div>
                <div>Authorized Signer: <strong>{respondentParty.name}</strong> {respondentParty.designation ? `(${respondentParty.designation})` : ""}</div>
                <div>Verified Email OTP: ✓ Verified | Email: {respondentParty.email} | IP: {respondentSign.ipAddress}</div>
                <div>Signed: {formatLegalDate(respondentSign.signedAt)}</div>
              </div>
            </div>
          ) : (
            <div style={{ height: "55px", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontStyle: "italic", fontSize: "10px" }}>Pending Signature</div>
          )}
        </div>
      </div>

      {/* Footer SHA-256 Checksum */}
      <div style={{ borderTop: "1.5px solid #0f172a", marginTop: "20px", paddingTop: "8px", textAlign: "center", fontSize: "9px", color: "#475569" }}>
        <div style={{ fontSize: "8px", lineHeight: "1.35", color: "#64748b", maxWidth: "95%", margin: "0 auto 4px auto" }}>PLATFORM ROLE &amp; LIABILITY DISCLAIMER: SignCollab is an independent technology service provider facilitating digital document creation and cryptographic signature logging under {jur.governingLawName} guidelines. SignCollab is not a legal representative, broker, or party to this agreement, provides no legal advice, and disclaims all liability arising from the performance, enforcement, or dispute of its terms.</div>
        <div style={{ fontFamily: "monospace", fontWeight: "bold", marginTop: "2px" }}>BILATERAL EXECUTED SHA-256: <span style={{ color: "#2563eb" }}>{contract.finalDocumentHash || contract.documentHash || contract.contentHash || "SHA256_PENDING_BILATERAL_EXECUTION"}</span></div>
      </div>
    </div>
  );
};
