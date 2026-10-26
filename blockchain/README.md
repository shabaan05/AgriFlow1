# AgriFlow AI — Polygon Amoy Blockchain Integration Guide

This directory contains the Smart Contract and deployment configurations for **AgriFlow AI's Immutable Supply Chain Traceability** on the **Polygon Amoy Testnet (Chain ID: 80002)**.

---

## 📌 Architecture Overview

1. **Smart Contract:** `blockchain/contracts/AgriTraceability.sol`
   - Records crop batches and decentralized lifecycle events (`HARVESTED`, `QUALITY_CHECKED`, `BOOKED`, `PICKUP_SCHEDULED`, `PICKED_UP`, `IN_TRANSIT`, `DELIVERED`, `PAYMENT_RECEIVED`).
   - Generates an immutable cryptographic fingerprint of produce quality, location, and timestamps.
2. **Backend Relayer:** `backend/services/blockchainService.js`
   - Interacts with Polygon Amoy RPC via `ethers.js`.
   - Records transactions on-chain and stores `txHash` and `blockNumber` in MongoDB.
3. **Frontend UI:**
   - Visual **"Polygon Amoy Verified"** badges on Farmer and Buyer Traceability portals.
   - Interactive **"Audit Proof"** modal with block number, contract address, and direct links to the **Polygonscan Explorer** (`https://amoy.polygonscan.com/tx/0x...`).

---

## 🚀 Quick Deployment Guide (Using Remix IDE — 2 Minutes)

Remix IDE is the easiest and most reliable method to deploy and verify the contract:

1. Open **[Remix Ethereum IDE](https://remix.ethereum.org/)**.
2. Create a new file in the `contracts` folder named `AgriTraceability.sol`.
3. Copy and paste the contents of `blockchain/contracts/AgriTraceability.sol`.
4. In the **Solidity Compiler** tab (left sidebar):
   - Select compiler version `0.8.20` or higher.
   - Click **Compile AgriTraceability.sol**.
5. In the **Deploy & Run Transactions** tab:
   - Change Environment to **Injected Provider - MetaMask**.
   - Ensure your MetaMask wallet is connected to **Polygon Amoy Testnet** (Chain ID: `80002`).
     - Network Name: Polygon Amoy Testnet
     - RPC URL: `https://rpc-amoy.polygon.technology`
     - Currency Symbol: `POL`
     - Block Explorer: `https://amoy.polygonscan.com/`
   - Click **Deploy** and confirm the transaction in MetaMask.
6. Copy the deployed contract address (e.g. `0x...`).
7. Update `backend/.env`:
   ```env
   CONTRACT_ADDRESS=your_deployed_contract_address
   POLYGON_PRIVATE_KEY=your_wallet_private_key
   ```

---

## 💧 Getting Free Testnet Faucet Tokens (MATIC / POL)

To deploy or submit test transactions on Polygon Amoy for free:
- **Polygon Official Faucet:** [https://faucet.polygon.technology/](https://faucet.polygon.technology/)
- Select Network: **Polygon Amoy (PoS)**, enter your MetaMask wallet address, and click Submit.

---

## 🔍 Public Verification on Polygonscan

Every event anchored on-chain can be verified by your college examiners and guide directly on Polygonscan:
- Explorer URL: `https://amoy.polygonscan.com/`
- Testnet Chain ID: `80002`
- Consensus Protocol: Proof-of-Stake (PoS)
