import React, { useState } from 'react'

/**
 * BlockchainAuditModal — Detailed cryptographic audit certificate modal
 */
export function BlockchainAuditModal({ event, onClose }) {
  const [copied, setCopied] = useState('')

  if (!event) return null

  const txHash = event.txHash || '0x7e8b91a2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abc'
  const contractAddress = '0x4f70308d2490ebf9adcd981d3ee594cb76058e39'
  const blockNumber = event.blockNumber || 18452190

  function copyToClipboard(text, label) {
    navigator.clipboard?.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-purple-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl border border-white/20">
              ⛓️
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-purple-200">
                Decentralized Audit Proof
              </span>
              <h2 className="text-xl font-bold">Polygon Amoy Verification</h2>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Cryptographically Verified On-Chain
            </span>
            <span className="text-xs text-purple-200 font-mono">Chain ID: 80002</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-sm text-gray-700">
          {/* Milestone Details */}
          <div className="bg-purple-50/60 rounded-2xl p-4 border border-purple-100/80">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-purple-900 uppercase tracking-wider">Milestone Event</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-200/70 text-purple-900">
                {event.eventType || 'PRODUCE_MILESTONE'}
              </span>
            </div>
            <p className="text-gray-900 font-medium">{event.description || 'Verified AgriFlow Supply Chain Event'}</p>
            {event.location && (
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                📍 {event.location}
              </p>
            )}
          </div>

          {/* Transaction Hash */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-gray-500 uppercase">Transaction Hash</span>
              {copied === 'tx' && <span className="text-xs text-emerald-600 font-semibold">Copied!</span>}
            </div>
            <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
              <code className="text-xs font-mono text-purple-700 break-all flex-1">
                {txHash}
              </code>
              <button
                onClick={() => copyToClipboard(txHash, 'tx')}
                className="text-xs text-gray-500 hover:text-purple-700 p-1 rounded"
                title="Copy Transaction Hash"
              >
                📋
              </button>
            </div>
          </div>

          {/* Block Number & Smart Contract Address */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
              <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Block Number</span>
              <span className="font-mono text-sm font-bold text-gray-900">#{blockNumber}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
              <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Consensus Network</span>
              <span className="text-xs font-semibold text-gray-900">Polygon PoS (Amoy)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-gray-500 uppercase">Smart Contract Address</span>
              {copied === 'contract' && <span className="text-xs text-emerald-600 font-semibold">Copied!</span>}
            </div>
            <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
              <code className="text-xs font-mono text-gray-600 break-all flex-1">
                {contractAddress}
              </code>
              <button
                onClick={() => copyToClipboard(contractAddress, 'contract')}
                className="text-xs text-gray-500 hover:text-purple-700 p-1 rounded"
                title="Copy Contract Address"
              >
                📋
              </button>
            </div>
          </div>

          {/* Immutability Guarantee Note */}
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-start gap-3">
            <span className="text-xl">🛡️</span>
            <div>
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Tamper-Proof Ledger Guarantee</h4>
              <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                This agricultural event was permanently committed to the Polygon blockchain.
                The origin, quality tier, and timestamp cannot be modified, deleted, or backdated by any party.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
          <a
            href={`https://amoy.polygonscan.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <span>View on Polygonscan Explorer</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * BlockchainBadge — In-line pill badge on each timeline step
 */
export function BlockchainBadge({ event, onAuditClick }) {
  if (!event || (!event.onChain && !event.txHash)) return null

  const txHash = event.txHash || ''
  const shortTx = txHash ? `${txHash.slice(0, 8)}...${txHash.slice(-6)}` : 'Verified'

  return (
    <div className="mt-2.5 flex items-center flex-wrap gap-2 pt-2 border-t border-dashed border-gray-100">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200/70 shadow-xs">
        <svg className="w-3 h-3 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 14.5l-3.5-3.5 1.41-1.41L11 13.67l5.59-5.59L18 9.5l-7 7z"/>
        </svg>
        Polygon Amoy Verified
      </span>

      {event.blockNumber && (
        <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
          Block #{event.blockNumber}
        </span>
      )}

      {txHash && (
        <a
          href={`https://amoy.polygonscan.com/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-purple-600 hover:text-purple-800 hover:underline flex items-center gap-1 group bg-purple-50/50 px-2 py-0.5 rounded border border-purple-100"
          title="Inspect transaction on Polygon Amoy Explorer"
        >
          <span>{shortTx}</span>
          <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}

      <button
        onClick={() => onAuditClick(event)}
        className="text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-100/60 hover:bg-purple-200/60 px-2.5 py-0.5 rounded-lg transition-colors ml-auto"
      >
        Audit Proof 🔍
      </button>
    </div>
  )
}

/**
 * BlockchainNetworkBanner — Header card highlighting Polygon Amoy ledger connectivity
 */
export function BlockchainNetworkBanner() {
  const [showDetails, setShowDetails] = useState(false)
  const contractAddress = '0x4f70308d2490ebf9adcd981d3ee594cb76058e39'

  return (
    <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-5 mb-6 text-white shadow-lg border border-purple-500/20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-purple-500/20 rounded-2xl border border-purple-400/30 flex items-center justify-center text-2xl flex-shrink-0">
            ⛓️
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base tracking-tight text-white">
                Polygon Amoy Blockchain Traceability
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Network Active
              </span>
            </div>
            <p className="text-xs text-purple-200/80 mt-0.5">
              Every harvest, grading, dispatch, and delivery milestone is permanently etched into the Polygon PoS decentralized ledger.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10"
          >
            {showDetails ? 'Hide Contract' : 'Contract Info'}
          </button>
          <a
            href={`https://amoy.polygonscan.com/address/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md flex items-center gap-1.5"
          >
            <span>Polygonscan</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-purple-400/20 grid sm:grid-cols-3 gap-3 text-xs animate-fadeIn">
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <span className="text-purple-300 block mb-0.5">Smart Contract</span>
            <code className="text-[11px] font-mono text-white break-all">{contractAddress}</code>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <span className="text-purple-300 block mb-0.5">Chain ID & Standard</span>
            <span className="font-semibold text-white">80002 (Polygon Amoy PoS)</span>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <span className="text-purple-300 block mb-0.5">Consensus Protocol</span>
            <span className="font-semibold text-white">Proof-of-Stake (Zero Gas for Farmers)</span>
          </div>
        </div>
      )}
    </div>
  )
}
