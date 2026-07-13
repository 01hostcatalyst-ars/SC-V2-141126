import React from "react";
import { getCompanyConfig } from "@/lib/config";
import { formatLegalDate, parseUserAgentString, formatUsageLicenseText, formatDeliverableTypeName } from "@/lib/utils";

interface PDFTemplateProps {
  contract: any;
}

export const ContractPDFTemplate: React.FC<PDFTemplateProps> = ({ contract }) => {
  const company = getCompanyConfig();

  const getRemainingAmount = () => {
    return Number(contract.totalAmount || 0) - Number(contract.advancePayment || 0);
  };

  const getSignatureByRole = (role: string) => {
    return contract.signatures?.find((s: any) => s.signerRole === role);
  };

  const respondentSign = getSignatureByRole(
    contract.contractType === "BRAND_TO_CREATOR" || contract.contractType === "AGENCY_TO_CREATOR"
      ? "CREATOR"
      : "BRAND"
  );

  const initiatorSign = getSignatureByRole(contract.initiator.role);

  const getContractTitle = () => {
    switch (contract.contractType as string) {
      case "AGENCY_TO_BRAND":
        return "AGENCY TO BRAND INFLUENCER MARKETING & CONTENT LICENSING AGREEMENT";
      case "AGENCY_TO_CREATOR":
        return "AGENCY TO CREATOR CONTENT PRODUCTION & SERVICE AGREEMENT";
      case "BRAND_TO_CREATOR":
        return "BRAND TO CREATOR DIRECT SPONSORSHIP AGREEMENT";
      case "CREATOR_TO_BRAND":
        return "CREATOR TO BRAND DIRECT CONTENT ENGAGEMENT AGREEMENT";
      default:
        return "MUTUAL COLLABORATION & CONTENT LICENSING AGREEMENT";
    }
  };

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
          <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#2563eb", fontWeight: "700" }}>Ref No: {contract.contractNumber}</p>
        </div>
      </div>

      {/* Preamble */}
      <div style={{ backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "8px 12px", fontSize: "10px", color: "#334155", marginBottom: "14px" }}>
        <strong>LEGAL PREAMBLE & E-SIGN BINDING NOTICE:</strong> This document represents a legally binding electronic agreement executed under the Electronic Transactions Ordinance (ETO 2002) of Pakistan. SignCollab is a neutral technology platform provider facilitating electronic agreement execution. All parameters, financial consideration, usage licenses, and bilateral penalties set forth herein are legally enforceable upon bilateral execution.
      </div>

      {/* Section 1: Parties */}
      <div style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#0f172a", borderBottom: "1.5px solid #0f172a", paddingBottom: "3px", marginBottom: "8px" }}>
        1. PARTIES &amp; RECITALS
      </div>
      <div style={{ display: "flex", gap: "14px", marginBottom: "14px" }}>
        <div style={{ flex: 1, border: "1px solid #cbd5e1", borderRadius: "6px", padding: "10px", fontSize: "11px" }}>
          <div style={{ fontWeight: "800", textTransform: "uppercase", color: "#475569", marginBottom: "6px", borderBottom: "1px solid #f1f5f9", paddingBottom: "2px" }}>PARTY A (AGENCY / INITIATOR)</div>
          <div style={{ margin: "2px 0" }}><strong>Legal Signer Name:</strong> {contract.initiator.name}</div>
          <div style={{ margin: "2px 0" }}><strong>Email:</strong> {contract.initiator.email}</div>
          {contract.initiator.phone && <div style={{ margin: "2px 0" }}><strong>Phone:</strong> {contract.initiator.phone}</div>}
          {(contract.initiator as any).agencyName && <div style={{ margin: "2px 0" }}><strong>Company:</strong> {(contract.initiator as any).agencyName}</div>}
          {contract.initiatorDesignation && <div style={{ margin: "2px 0" }}><strong>Signing Capacity:</strong> {contract.initiatorDesignation}</div>}
          {contract.initiatorNtn && <div style={{ margin: "2px 0" }}><strong>NTN / Reg No:</strong> {contract.initiatorNtn}</div>}
          {(contract.initiator as any).agencyAddress && <div style={{ margin: "2px 0" }}><strong>Address:</strong> {(contract.initiator as any).agencyAddress}</div>}
        </div>

        <div style={{ flex: 1, border: "1px solid #cbd5e1", borderRadius: "6px", padding: "10px", fontSize: "11px" }}>
          <div style={{ fontWeight: "800", textTransform: "uppercase", color: "#475569", marginBottom: "6px", borderBottom: "1px solid #f1f5f9", paddingBottom: "2px" }}>PARTY B (CLIENT BRAND / RESPONDENT)</div>
          <div style={{ margin: "2px 0" }}><strong>Contact Person:</strong> {contract.respondentName || "Pending Execution"}</div>
          <div style={{ margin: "2px 0" }}><strong>Email:</strong> {contract.respondentEmail || "Pending Execution"}</div>
          {contract.respondentPhone && <div style={{ margin: "2px 0" }}><strong>Phone:</strong> {contract.respondentPhone}</div>}
          {contract.respondentCompany && <div style={{ margin: "2px 0" }}><strong>Brand / Company:</strong> {contract.respondentCompany}</div>}
          {contract.respondentDesignation && <div style={{ margin: "2px 0" }}><strong>Signing Capacity:</strong> {contract.respondentDesignation}</div>}
          {contract.respondentNtn && <div style={{ margin: "2px 0" }}><strong>NTN / Reg No:</strong> {contract.respondentNtn}</div>}
          {contract.respondentAddress && <div style={{ margin: "2px 0" }}><strong>Address:</strong> {contract.respondentAddress}</div>}
        </div>
      </div>

      {(contract.brandName || contract.campaignName || contract.creatorName) && (
        <div style={{ border: "1px solid #cbd5e1", borderRadius: "6px", padding: "8px 12px", backgroundColor: "#ffffff", marginBottom: "14px", fontSize: "11px" }}>
          <div style={{ fontWeight: "800", textTransform: "uppercase", color: "#475569", marginBottom: "4px" }}>CAMPAIGN & TALENT ASSIGNMENT</div>
          <div style={{ display: "flex", gap: "30px" }}>
            {contract.brandName && <div><strong>Client Brand:</strong> {contract.brandName} {contract.brandHandle ? `(${contract.brandHandle})` : ""}</div>}
            {contract.campaignName && <div><strong>Campaign / Product:</strong> {contract.campaignName}</div>}
            {contract.creatorName && <div><strong>Target Creator:</strong> {contract.creatorName} {contract.creatorHandle ? `(${contract.creatorHandle})` : ""}</div>}
          </div>
        </div>
      )}

      {/* Section 2: Deliverables */}
      <div style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#0f172a", borderBottom: "1.5px solid #0f172a", paddingBottom: "3px", marginTop: "14px", marginBottom: "8px" }}>
        2. CAMPAIGN DELIVERABLES SPECIFICATIONS &amp; RETENTION ENFORCEMENT
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "8px", fontSize: "11px", border: "1px solid #cbd5e1" }}>
        <thead>
          <tr style={{ backgroundColor: "#f1f5f9", color: "#0f172a", textTransform: "uppercase", fontSize: "10px" }}>
            <th style={{ padding: "6px 8px", border: "1px solid #cbd5e1", textAlign: "left" }}>Platform Format</th>
            <th style={{ padding: "6px 8px", border: "1px solid #cbd5e1", textAlign: "center", width: "60px" }}>Quantity</th>
            <th style={{ padding: "6px 8px", border: "1px solid #cbd5e1", textAlign: "center", width: "120px" }}>Retention Duration</th>
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
          <em>WITHHELD RIGHTS NOTICE: Party A and Creator reserve all intellectual property rights not expressly granted above. Any commercial re-use, television broadcast, dark-posting, or off-platform print distribution outside the licensed parameters is strictly prohibited without prior written amendment.</em>
        </div>
      </div>

      {/* Section 4: Financial Compensation */}
      <div style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#0f172a", borderBottom: "1.5px solid #0f172a", paddingBottom: "3px", marginTop: "14px", marginBottom: "8px" }}>
        4. FINANCIAL COMPENSATION &amp; PAYMENT SCHEDULE
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "14px", fontSize: "11px", border: "1px solid #cbd5e1" }}>
        <thead>
          <tr style={{ backgroundColor: "#f1f5f9", color: "#0f172a", textTransform: "uppercase", fontSize: "10px" }}>
            <th style={{ padding: "6px 8px", border: "1px solid #cbd5e1", textAlign: "left" }}>Total Campaign Valuation</th>
            <th style={{ padding: "6px 8px", border: "1px solid #cbd5e1", textAlign: "left" }}>Advance Payment</th>
            <th style={{ padding: "6px 8px", border: "1px solid #cbd5e1", textAlign: "left" }}>Remaining Payout</th>
            <th style={{ padding: "6px 8px", border: "1px solid #cbd5e1", textAlign: "left" }}>Payment Method &amp; Route</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: "6px 8px", border: "1px solid #cbd5e1", fontWeight: "bold", fontSize: "12px" }}>PKR {Number(contract.totalAmount).toLocaleString()}</td>
            <td style={{ padding: "6px 8px", border: "1px solid #cbd5e1" }}>
              <strong>PKR {Number(contract.advancePayment || 0).toLocaleString()}</strong>
              {contract.advancePaymentDate && <><br /><span style={{ fontSize: "10px", color: "#64748b" }}>Due: {formatLegalDate(contract.advancePaymentDate)}</span></>}
            </td>
            <td style={{ padding: "6px 8px", border: "1px solid #cbd5e1" }}>
              <strong>PKR {getRemainingAmount().toLocaleString()}</strong>
              {contract.remainingPaymentDate && <><br /><span style={{ fontSize: "10px", color: "#64748b" }}>Due: {formatLegalDate(contract.remainingPaymentDate)}</span></>}
            </td>
            <td style={{ padding: "6px 8px", border: "1px solid #cbd5e1" }}>
              <strong>{contract.paymentMethod ? contract.paymentMethod.replace(/_/g, " ") : "Not Specified"}</strong>
              <br /><span style={{ fontSize: "10px", fontFamily: "monospace", color: "#475569" }}>{contract.paymentMethod === "BANK_IBAN" ? (contract.bankAccountIban || "Pending") : (contract.mobileWalletNumber || "Pending")}</span>
            </td>
          </tr>
        </tbody>
      </table>

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
            {contract.earlyDisclosurePenalty && <><strong>Early Disclosure Leak Penalty:</strong> PKR {Number(contract.earlyDisclosurePenalty).toLocaleString()} payable upon unauthorized leak or premature posting.</>}
          </div>
        )}
      </div>

      {/* Section 8: Product Shipment & Loan Return Terms */}
      {contract.collabProduct && (
        <>
          <div style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#0f172a", borderBottom: "1.5px solid #0f172a", paddingBottom: "3px", marginTop: "14px", marginBottom: "8px" }}>
            8. COLLABORATION PRODUCT SHIPMENT &amp; LOAN RETURN TERMS
          </div>
          <div style={{ border: "1px solid #cbd5e1", borderRadius: "6px", padding: "10px", fontSize: "11px", marginBottom: "14px", backgroundColor: "#ffffff" }}>
            <div style={{ display: "flex", gap: "20px" }}>
              <div><strong>Product Details:</strong> {contract.collabProduct} ({contract.collabProductProvisionType || "Provision"})</div>
              {contract.collabDeliveryDate && <div><strong>Expected Arrival:</strong> {formatLegalDate(contract.collabDeliveryDate)}</div>}
            </div>
            {contract.collabDeliveryAddress && <div style={{ marginTop: "4px", fontSize: "10px", color: "#475569" }}><strong>Shipment Address:</strong> {contract.collabDeliveryAddress}</div>}
            {contract.collabProductProvisionType === "Product Loan" && (
              <div style={{ marginTop: "6px", paddingTop: "6px", borderTop: "1px dashed #cbd5e1", fontSize: "10px", color: "#92400e" }}>
                <strong>PRODUCT LOAN RETURN CONDITIONS:</strong> Loaned product must be returned to Brand within {contract.collabProductReturnDays || 7} calendar days post-deliverable. Return shipping costs paid by {contract.collabProductReturnShippingBy || "Brand"}. Failure to return or returning in damaged condition incurs a mandatory non-return penalty of PKR {Number(contract.collabProductNonReturnFee || 0).toLocaleString()}.
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
        <div>• <strong>Late Payment Penalty (Charged to Brand):</strong> {Number(contract.latePaymentPenaltyPct)}% per calendar day of delay (capped at max {Number(contract.penaltyCapPct || 20)}% of total value as agreed liquidated damages under Section 74 Contract Act 1872).</div>
        <div>• <strong>Late Content Delivery Penalty (Charged to Agency/Creator):</strong> {Number(contract.lateContentPenaltyPct)}% per calendar day of delay (capped at max {Number(contract.penaltyCapPct || 20)}% of total value as agreed liquidated damages).</div>
        <div>• <strong>Non-Delivery Threshold &amp; Cutoff:</strong> Content delivery delayed beyond {contract.nonDeliveryCutoffDays || 7} calendar days post-deadline legally constitutes Non-Delivery, terminating daily late fees and triggering the 100% advance refundability clause with zero enforcement gap.</div>
        <div>• <strong>Unauthorized Brand Re-Use Penalty:</strong> {Number(contract.unauthorizedUsagePenaltyPct || 50)}% of total contract value per violation outside licensed platforms, duration, or scope.</div>
        <div>• <strong>Pre-Delivery Termination Fee:</strong> {Number(contract.cancellationFeePct || 25)}% of total campaign fee owed if terminated post-execution prior to deliverable hand-off.</div>
      </div>

      {/* Section 12: Governing Law & Dispute Resolution */}
      <div style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#0f172a", borderBottom: "1.5px solid #0f172a", paddingBottom: "3px", marginTop: "14px", marginBottom: "8px" }}>
        12. GOVERNING LAW &amp; ALTERNATIVE DISPUTE RESOLUTION (ADR)
      </div>
      <div style={{ border: "1px solid #cbd5e1", borderRadius: "6px", padding: "10px", fontSize: "10px", marginBottom: "14px", backgroundColor: "#ffffff", lineHeight: "1.6" }}>
        This agreement shall be governed by and construed in accordance with the laws of the Islamic Republic of Pakistan. In the event of any dispute or claim, the parties shall first attempt to resolve the matter through 14 calendar days of good-faith negotiation. If unresolved: (a) Disputes equal to or below PKR 500,000 shall proceed to summary determination in competent local courts; (b) Disputes exceeding PKR 500,000 shall be referred to binding arbitration by a sole arbitrator in Pakistan under the <strong>Arbitration Act 1940</strong> of Pakistan. The prevailing party shall recover reasonable legal fees and arbitration costs.
      </div>

      {/* Section 11: Signature execution log */}
      <div style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#0f172a", borderBottom: "1.5px solid #0f172a", paddingBottom: "3px", marginTop: "18px", marginBottom: "8px" }}>
        11. ETO 2002 BILATERAL SIGNATURE AUDIT LOG &amp; CRYPTOGRAPHIC VERIFICATION
      </div>
      <div style={{ display: "flex", gap: "16px", marginTop: "10px" }}>
        <div style={{ flex: 1, border: "1px solid #cbd5e1", borderRadius: "6px", padding: "10px", textAlign: "center", backgroundColor: "#ffffff" }}>
          <div style={{ fontSize: "10px", fontWeight: "800", textTransform: "uppercase", color: "#475569" }}>PARTY A (INITIATOR SIGNATURE)</div>
          {initiatorSign ? (
            <div>
              <div style={{ height: "55px", display: "flex", alignItems: "center", justifyContent: "center", margin: "6px 0" }}>
                <img src={initiatorSign.signatureImageUrl} alt="Party A Sig" style={{ maxHeight: "50px", maxWidth: "160px", objectFit: "contain" }} />
              </div>
              <div style={{ fontSize: "9px", color: "#475569" }}>
                <div>Signer: {contract.initiator.name} ({contract.initiator.email})</div>
                <div>Signed for and on behalf of {(contract.initiator as any).agencyName || contract.initiator.name}</div>
                <div>IP: {initiatorSign.ipAddress} | Device: {parseUserAgentString(initiatorSign.userAgent || initiatorSign.deviceFingerprint)}</div>
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
              <div style={{ fontSize: "9px", color: "#475569" }}>
                <div>Signer: {contract.respondentName} ({contract.respondentEmail})</div>
                <div>Signed for and on behalf of {contract.respondentCompany || contract.respondentName}</div>
                <div>Verified Email OTP: ✓ Verified | IP: {respondentSign.ipAddress}</div>
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
        <div>This agreement is a tamper-evident legal record stored in SignCollab Vault under Pakistan ETO 2002 Ordinance standards.</div>
        <div style={{ fontFamily: "monospace", fontWeight: "bold", marginTop: "2px" }}>DOCUMENT SHA-256 HASH: <span style={{ color: "#2563eb" }}>{contract.documentHash || "COMPUTING INTEGRITY HASH..."}</span></div>
      </div>
    </div>
  );
};
