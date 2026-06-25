# Deployment Guide — VERITY

This guide covers deploying the contract to Bradbury and hosting the frontend on Vercel.

---

## Prerequisites

- Node.js ≥ 18
- Python ≥ 3.12
- A funded Bradbury testnet account
- A GitHub account
- A Vercel account

---

## Step 1 — Fund your Bradbury account

Visit the GenLayer testnet faucet and request GEN tokens:

```
https://testnet-faucet.genlayer.foundation
```

You need GEN to pay for the deployment transaction and for subsequent `submit_source` calls.

---

## Step 2 — Set up environment

```bash
git clone https://github.com/Siriron/verity-genlayer.git
cd verity-genlayer
cp .env.example .env
```

Edit `.env` and set your private key:

```
ACCOUNT_PRIVATE_KEY=0xyour_private_key_here
```

**Security:** `.env` is in `.gitignore`. Never commit your private key.

---

## Step 3 — Install dependencies

```bash
# Root (deploy scripts)
npm install
```

---

## Step 4 — Deploy the contract to Bradbury

```bash
npm run deploy:bradbury
```

This will:
1. Read `contracts/verity.py`
2. Deploy it to Bradbury via `genlayer-js`
3. Print the contract address and transaction hash

**Expected output:**
```
Reading contract...
Deploying VERITYCore to Bradbury...
✓ Deployed!
  Address : 0xd1Dbf820eD19E7371EA72aB57a159263391A543C
  Tx hash : 0xf1f374bf...

Update VITE_CONTRACT_ADDRESS in web/app/.env with: 0xd1Dbf820eD19E7371EA72aB57a159263391A543C
```

The transaction passes through consensus (`Committing → Accepted → Finalized`). Wait for `Accepted` before interacting with the contract.

---

## Step 5 — Verify the deployment

Visit the Bradbury explorer and confirm the contract is `Accepted`:

```
https://explorer-bradbury.genlayer.com/address/0xd1Dbf820eD19E7371EA72aB57a159263391A543C
```

---

## Step 6 — Run the frontend locally

```bash
cd web/app
npm install
npm run dev
```

The app connects to Bradbury's public RPC by default. No additional configuration is needed.

Open `http://localhost:5173` in your browser.

---

## Step 7 — Deploy to Vercel

### Option A — Vercel CLI

```bash
cd web/app
npx vercel --prod
```

### Option B — Vercel Dashboard

1. Push the repository to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repository
4. Set the following build settings:

| Setting | Value |
|---|---|
| Framework Preset | Vite |
| Root Directory | `web/app` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

5. Click **Deploy**

Vercel will auto-deploy on every push to `main`.

---

## Environment Variables (Vercel)

No environment variables are required for the default Bradbury deployment — the contract address is hardcoded in `src/lib/genlayer.ts`.

If you redeploy the contract to a new address, update `CONTRACT_ADDRESS` in `web/app/src/lib/genlayer.ts` and redeploy the frontend.

Optionally, you can use a Vercel environment variable:

```
VITE_CONTRACT_ADDRESS=0xyour_new_address
```

And update `genlayer.ts` to read from it:
```typescript
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0xd1Dbf820…'
```

---

## Troubleshooting

### `invalid_contract: trailing characters`
The contract header format is strict. Line 1 must be the `# { "Depends": ... }` line. No other `#` comment lines between the Depends line and the code.

### Transaction stuck in `Committing`
This is normal — Bradbury consensus takes time. Wait 2–5 minutes. If it does not advance, check the explorer for validator errors.

### `FETCH_ERROR` in summary
The validator could not retrieve the URL. The source is still stored with default scores. Ensure the URL is publicly accessible and returns a 200 status.

### Frontend shows no sources
The RPC may be temporarily unavailable. The dashboard polls every 15 seconds — wait a moment and it will refresh automatically.
