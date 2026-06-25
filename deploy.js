import { createClient, simulator } from "genlayer-js";
import { readFileSync } from "fs";
import { resolve } from "path";
import dotenv from "dotenv";

dotenv.config();

const CONTRACT_PATH = resolve("../contracts/verity.py");

async function deploy() {
  const privateKey = process.env.ACCOUNT_PRIVATE_KEY;
  if (!privateKey) {
    console.error("Error: ACCOUNT_PRIVATE_KEY not set in .env");
    process.exit(1);
  }

  const client = createClient({
    chain: simulator,
    account: { privateKey },
  });

  console.log("Reading contract...");
  const contractCode = readFileSync(CONTRACT_PATH, "utf-8");

  console.log("Deploying VERITYCore to Bradbury...");
  const { address, hash } = await client.deployContract({
    code: contractCode,
    args: [],
  });

  console.log("✓ Deployed!");
  console.log("  Address :", address);
  console.log("  Tx hash :", hash);
  console.log("\nUpdate VITE_CONTRACT_ADDRESS in web/app/.env with:", address);
}

deploy().catch((err) => {
  console.error("Deploy failed:", err);
  process.exit(1);
});
