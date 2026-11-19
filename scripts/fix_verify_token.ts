import "dotenv/config";
import { getSupabaseAdmin } from "../src/lib/supabase/admin";
import crypto from "crypto";

async function main() {
  const supabaseAdmin = getSupabaseAdmin();
  console.log("Connecting via Supabase HTTPS Admin Client...");

  const { data: contracts, error } = await supabaseAdmin
    .from("contracts")
    .select("id, contract_number, verify_token");

  if (error) {
    console.error("Supabase Query Error:", error);
    return;
  }

  const unpopulated = (contracts || []).filter((c: any) => !c.verify_token);
  console.log(`Retrieved ${(contracts || []).length} contracts. ${unpopulated.length} missing verify_token.`);

  for (const contract of unpopulated) {
    const newToken = `v_${crypto.randomUUID()}`;
    const { error: updateError } = await supabaseAdmin
      .from("contracts")
      .update({ verify_token: newToken })
      .eq("id", contract.id);

    if (updateError) {
      console.error(`Error updating ${contract.contract_number}:`, updateError);
    } else {
      console.log(`✓ Contract ${contract.contract_number} updated with verifyToken: ${newToken}`);
    }
  }

  console.log("All existing contracts successfully populated with verifyToken!");
}

main();
