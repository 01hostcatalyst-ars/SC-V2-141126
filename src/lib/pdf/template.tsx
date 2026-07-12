import React from "react";
import { getCompanyConfig } from "@/lib/config";

interface PDFTemplateProps {
  contract: any;
}

export const ContractPDFTemplate: React.FC<PDFTemplateProps> = ({ contract }) => {
  const company = getCompanyConfig();
  const getRemainingAmount = () => {
    return Number(contract.totalAmount || 0) - Number(contract.advancePayment || 0);
  };

  const formatUsageType = (type: any) => {
    if (Array.isArray(type)) {
      return type.map((t) => t.replace(/_/g, " ")).join(", ");
    }
    if (typeof type === 'string') {
      return type.replace(/_/g, " ");
    }
    return "N/A";
  };

  const getSignatureByRole = (role: string) => {
    return contract.signatures?.find((s: any) => s.signerRole === role);
  };

  const respondentSign = getSignatureByRole(
    contract.contractType === "BRAND_TO_CREATOR" || contract.contractType === "AGENCY_TO_CREATOR"
      ? "CREATOR"
      : "BRAND"
  );
  
  const initiatorSign = getSignatureByRole(
    contract.initiator.role
  );

  return (
    <div style={{ padding: "40px", fontFamily: "Arial, sans-serif", color: "#111", fontSize: "14px", lineHeight: "1.5" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "between", alignItems: "center", borderBottom: "2px solid #333", paddingBottom: "20px", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "24px", margin: "0", fontWeight: "bold" }}>{company.name}</h1>
          <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#666" }}>{company.legalInfo}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <h4 style={{ margin: "0", fontSize: "14px", fontWeight: "bold" }}>MUTUAL COLLABORATION AGREEMENT</h4>
          <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#333", fontWeight: "bold" }}>No: {contract.contractNumber}</p>
        </div>
      </div>

      {/* Parties Info */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <div style={{ flex: 1, padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", color: "#666" }}>Party A (Initiator)</h3>
          <p style={{ margin: "2px 0" }}><strong>Name:</strong> {contract.initiator.name}</p>
          <p style={{ margin: "2px 0" }}><strong>Email:</strong> {contract.initiator.email}</p>
          {contract.initiator.phone && <p style={{ margin: "2px 0" }}><strong>Phone:</strong> {contract.initiator.phone}</p>}
          {contract.initiator.instagramHandle && <p style={{ margin: "2px 0" }}><strong>Instagram:</strong> {contract.initiator.instagramHandle}</p>}
        </div>

        <div style={{ flex: 1, padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", color: "#666" }}>Party B (Respondent)</h3>
          <p style={{ margin: "2px 0" }}><strong>Name:</strong> {contract.respondentName}</p>
          <p style={{ margin: "2px 0" }}><strong>Email:</strong> {contract.respondentEmail}</p>
          {contract.respondentPhone && <p style={{ margin: "2px 0" }}><strong>Phone:</strong> {contract.respondentPhone}</p>}
          {contract.respondentCompany && <p style={{ margin: "2px 0" }}><strong>Company/IG:</strong> {contract.respondentCompany}</p>}
        </div>
      </div>

      {contract.brandName && (
        <div style={{ marginBottom: "20px", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#fcfcfc" }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", color: "#666" }}>Client Brand & Campaign Info</h3>
          <div style={{ display: "flex", gap: "40px", fontSize: "13px" }}>
            <p style={{ margin: "2px 0" }}><strong>Brand:</strong> {contract.brandName} {contract.brandHandle ? `(${contract.brandHandle})` : ""}</p>
            {contract.campaignName && <p style={{ margin: "2px 0" }}><strong>Campaign/Product:</strong> {contract.campaignName}</p>}
          </div>
        </div>
      )}

      {contract.creatorName && (
        <div style={{ marginBottom: "20px", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#fcfcfc" }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", color: "#666" }}>Creator Details</h3>
          <div style={{ display: "flex", gap: "40px", fontSize: "13px" }}>
            <p style={{ margin: "2px 0" }}><strong>Creator:</strong> {contract.creatorName} {contract.creatorHandle ? `(${contract.creatorHandle})` : ""}</p>
          </div>
        </div>
      )}

      {/* Deliverables */}
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: "bold", borderBottom: "1px solid #eee", paddingBottom: "6px", marginBottom: "10px" }}>Campaign Deliverables</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ background: "#f9f9f9", borderBottom: "1px solid #ddd" }}>
              <th style={{ textAlign: "left", padding: "8px" }}>Deliverable Type</th>
              <th style={{ textAlign: "center", padding: "8px" }}>Quantity</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Retention / Duration</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Requirement Brief</th>
            </tr>
          </thead>
          <tbody>
            {contract.deliverables?.map((d: any) => (
              <tr key={d.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "8px" }}>{d.type.replace(/_/g, " ")}</td>
                <td style={{ padding: "8px", textAlign: "center" }}>{d.quantity}</td>
                <td style={{ padding: "8px" }}>{d.duration || "N/A"}</td>
                <td style={{ padding: "8px" }}>{d.notes || "None"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Usage Rights */}
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: "bold", borderBottom: "1px solid #eee", paddingBottom: "6px", marginBottom: "10px" }}>Usage Rights & Platform Scope</h3>
        <p style={{ margin: "4px 0" }}><strong>Platforms Allowed:</strong> {contract.platformsAllowed.join(", ")}</p>
        <p style={{ margin: "4px 0" }}><strong>Usage Scope:</strong> {formatUsageType(contract.usageType)}</p>
        <p style={{ margin: "4px 0" }}><strong>Usage Duration:</strong> {contract.usageRightsDuration.replace(/_/g, " ")}</p>
      </div>

      {/* Financial Terms */}
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: "bold", borderBottom: "1px solid #eee", paddingBottom: "6px", marginBottom: "10px" }}>Financial Compensation</h3>
        <p style={{ margin: "4px 0" }}><strong>Total Campaign Value:</strong> PKR {Number(contract.totalAmount).toLocaleString()}</p>
        <p style={{ margin: "4px 0" }}><strong>Advance Payout:</strong> PKR {Number(contract.advancePayment || 0).toLocaleString()} {contract.advancePaymentDate ? `(Due: ${new Date(contract.advancePaymentDate).toLocaleDateString()})` : ""}</p>
        <p style={{ margin: "4px 0" }}><strong>Remaining Payout:</strong> PKR {getRemainingAmount().toLocaleString()} {contract.remainingPaymentDate ? `(Due: ${new Date(contract.remainingPaymentDate).toLocaleDateString()})` : ""}</p>
        <p style={{ margin: "4px 0" }}><strong>Payment Method:</strong> {contract.paymentMethod ? contract.paymentMethod.replace(/_/g, " ") : "Not Specified"}</p>
        {contract.bankAccountIban && <p style={{ margin: "4px 0" }}><strong>Bank Account IBAN:</strong> {contract.bankAccountIban}</p>}
        {contract.mobileWalletNumber && <p style={{ margin: "4px 0" }}><strong>Mobile Wallet Account:</strong> {contract.mobileWalletNumber}</p>}
      </div>

      {/* Revision, Safeguards & Penalties */}
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: "bold", borderBottom: "1px solid #eee", paddingBottom: "6px", marginBottom: "10px" }}>Delivery Terms, Safeguards & Penalties</h3>
        <p style={{ margin: "4px 0" }}><strong>Delivery Deadline:</strong> {contract.deliveryTimeframeDays} Days after mutual execution</p>
        <p style={{ margin: "4px 0" }}><strong>Revision Rounds Included:</strong> {contract.revisionRounds} rounds</p>
        <p style={{ margin: "4px 0" }}><strong>Late Payment Penalty (Charged to Brand):</strong> {Number(contract.latePaymentPenaltyPct)}% per day delay</p>
        <p style={{ margin: "4px 0" }}><strong>Late Delivery Penalty (Charged to Creator):</strong> {Number(contract.lateContentPenaltyPct)}% per day delay</p>
        <p style={{ margin: "4px 0" }}><strong>Unauthorized Brand Usage Penalty:</strong> {Number(contract.unauthorizedUsagePenaltyPct || 50)}% of total contract fee per violation outside agreed platforms/duration/scope</p>
        <p style={{ margin: "4px 0" }}><strong>Non-Delivery Advance Refund:</strong> {contract.advanceRefundable !== false ? `Advance Payout is 100% Refundable within ${contract.advanceRefundTimeframeDays || 7} business days of non-delivery notice` : "Non-refundable advance"}</p>
        <p style={{ margin: "4px 0" }}><strong>Pre-Delivery Cancellation Fee:</strong> {Number(contract.cancellationFeePct || 25)}% of total fee owed if terminated after execution prior to content delivery</p>
        
        <p style={{ margin: "4px 0" }}><strong>Content Exclusivity:</strong> {contract.exclusivityClause ? `Required (${contract.exclusivityDuration || "Active"})${contract.exclusivityCompetitors ? ` - Restricted Competitors: ${contract.exclusivityCompetitors}` : ""}` : "Not Required"}</p>

        {contract.confidentialityRequired && (
          <p style={{ margin: "4px 0" }}><strong>Confidentiality / Product Embargo (NDA):</strong> Strictly confidential until {contract.embargoDate ? new Date(contract.embargoDate).toLocaleDateString() : "official launch"}. {contract.earlyDisclosurePenalty ? `Early disclosure penalty: PKR ${Number(contract.earlyDisclosurePenalty).toLocaleString()}` : ""}</p>
        )}

        <p style={{ margin: "4px 0" }}><strong>Copyright Terms:</strong> {contract.contentOwnership}</p>
      </div>

      {/* Signature execution log */}
      <div style={{ display: "flex", gap: "20px", marginTop: "40px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
        <div style={{ flex: 1, textAlign: "center" }}>
          <p style={{ margin: "0", fontSize: "11px", color: "#666" }}>PARTY A (Initiator Signature)</p>
          {initiatorSign ? (
            <div style={{ margin: "10px 0" }}>
              <img src={initiatorSign.signatureImageUrl} alt="Party A Sig" style={{ maxWidth: "150px", maxHeight: "60px" }} />
              <p style={{ margin: "4px 0 0 0", fontSize: "10px", color: "#333" }}>IP: {initiatorSign.ipAddress}</p>
              <p style={{ margin: "2px 0 0 0", fontSize: "9px", color: "#666" }}>Signed: {new Date(initiatorSign.signedAt).toUTCString()}</p>
            </div>
          ) : (
            <p style={{ margin: "15px 0", fontStyle: "italic", color: "#888" }}>Pending Signature</p>
          )}
        </div>

        <div style={{ flex: 1, textAlign: "center" }}>
          <p style={{ margin: "0", fontSize: "11px", color: "#666" }}>PARTY B (Respondent Signature)</p>
          {respondentSign ? (
            <div style={{ margin: "10px 0" }}>
              <img src={respondentSign.signatureImageUrl} alt="Party B Sig" style={{ maxWidth: "150px", maxHeight: "60px" }} />
              <p style={{ margin: "4px 0 0 0", fontSize: "10px", color: "#333" }}>IP: {respondentSign.ipAddress}</p>
              <p style={{ margin: "2px 0 0 0", fontSize: "9px", color: "#666" }}>Signed: {new Date(respondentSign.signedAt).toUTCString()}</p>
            </div>
          ) : (
            <p style={{ margin: "15px 0", fontStyle: "italic", color: "#888" }}>Pending Signature</p>
          )}
        </div>
      </div>

      {/* Evidentiary integrity footer */}
      <div style={{ borderTop: "2px solid #333", marginTop: "40px", paddingTop: "15px", textAlign: "center", fontSize: "9px", color: "#666" }}>
        <p style={{ margin: "0 0 4px 0" }}>This document is a legally binding electronic record generated by {company.name} and executed under the guidelines of Pakistan&apos;s Electronic Transactions Ordinance (ETO 2002).</p>
        <p style={{ margin: "0" }}>Document SHA-256 integrity hash: <strong>{contract.documentHash || "Awaiting Verification"}</strong></p>
      </div>
    </div>
  );
};
