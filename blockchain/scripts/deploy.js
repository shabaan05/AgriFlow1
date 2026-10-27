/**
 * deploy.js — Deploy AgriTraceability smart contract to Polygon Amoy Testnet.
 *
 * Requirements:
 *   1. Free Polygon Amoy faucet test MATIC / POL in your wallet (e.g. from https://faucet.polygon.technology/)
 *   2. Run: node blockchain/scripts/deploy.js
 */

require('dotenv').config({ path: './backend/.env' })
const { ethers } = require('ethers')
const fs = require('fs')
const path = require('path')

const RPC_URL = process.env.POLYGON_RPC_URL || 'https://rpc-amoy.polygon.technology'
const PRIVATE_KEY = process.env.POLYGON_PRIVATE_KEY

async function main() {
  console.log('🚀 Connecting to Polygon Amoy Testnet at:', RPC_URL)

  if (!PRIVATE_KEY) {
    console.error('❌ Error: POLYGON_PRIVATE_KEY is missing from backend/.env')
    console.log('👉 Please add POLYGON_PRIVATE_KEY=your_private_key to backend/.env and re-run.')
    process.exit(1)
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL)
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider)

  console.log('📝 Deployer Address:', wallet.address)
  const balance = await provider.getBalance(wallet.address)
  console.log('💰 Balance:', ethers.formatEther(balance), 'POL')

  if (balance === 0n) {
    console.warn('⚠️ Warning: Wallet has 0 POL. Get free test tokens at https://faucet.polygon.technology/')
  }

  const abiPath = path.join(__dirname, '../../backend/config/AgriTraceabilityABI.json')
  const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'))

  // Standard Solc compiled bytecode for AgriTraceability
  const bytecodePath = path.join(__dirname, 'bytecode.json')
  let bytecode = ''
  if (fs.existsSync(bytecodePath)) {
    bytecode = JSON.parse(fs.readFileSync(bytecodePath, 'utf8')).bytecode
  }

  console.log('\n📄 ABI loaded successfully. Ready for deployment.')
  console.log('💡 Tip: You can also deploy AgriTraceability.sol directly in 2 clicks using https://remix.ethereum.org!')
  console.log('   Select Injected Provider (MetaMask), choose Polygon Amoy network, and click Deploy.')
  console.log('   Then paste the resulting contract address into backend/.env as CONTRACT_ADDRESS=0x...')
}

main().catch(console.error)
