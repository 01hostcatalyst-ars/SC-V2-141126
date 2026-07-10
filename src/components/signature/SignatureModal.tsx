"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Checkbox } from "@/components/ui/Checkbox";
import { SignatureCanvas } from "./SignaturePad";

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (signatureB64: string, fingerprint: string) => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [consent, setConsent] = useState(false);
  const [signatureData, setSignatureData] = useState("");

  const handleSignatureSave = async (base64Png: string) => {
    if (!consent) {
      alert("Please review and accept the electronic agreement consent checkbox.");
      return;
    }

    // Capture simple client-side device identifier/fingerprint
    const fingerprint = window.navigator.userAgent + "-" + screen.width + "x" + screen.height;
    
    onConfirm(base64Png, fingerprint);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Execute Electronic Signature">
      <div className="flex flex-col gap-5 text-left py-2">
        <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 text-xs text-blue-400 leading-relaxed font-medium">
          ⚖️ <strong>Legal Consent:</strong> By checking the box below and signing, you agree that this signature constitutes a legally binding electronic execution under Pakistan&apos;s Electronic Transactions Ordinance (ETO 2002).
        </div>

        <Checkbox
          id="electronic-consent"
          label="I consent to execute this campaign agreement electronically and confirm that all details provided are accurate."
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />

        <div className="flex flex-col gap-2 mt-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Draw Signature Below
          </label>
          <SignatureCanvas onSave={handleSignatureSave} />
        </div>
      </div>
    </Modal>
  );
};
