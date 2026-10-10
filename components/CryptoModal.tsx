"use client";

import { motion, AnimatePresence } from "framer-motion";

const CRYPTO_DATA = {
  eth: {
    name: "Ethereum",
    address: "0xF631fd9773740056cd116AA1364E894B448C5CF0",
    color: "#627EEA"
  },
  btc: {
    name: "Bitcoin",
    address: "bc1pnu4rw22fqz5v3y6tvmx9ject7pwfayc0mr28ecdn6w3sx6xdrjmsh5tw5k",
    color: "#F7931A"
  },
  sol: {
    name: "Solana",
    address: "3mG96WjgDNaj1R8XkxifheoBsoPisVTKwDHFo4ErMeRy",
    color: "#14F195"
  }
};

type CryptoModalProps = {
  selectedCrypto: keyof typeof CRYPTO_DATA | null;
  onClose: () => void;
};

export default function CryptoModal({ selectedCrypto, onClose }: CryptoModalProps) {
  if (!selectedCrypto) return null;

  const data = CRYPTO_DATA[selectedCrypto];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-sm rounded-2xl bg-[rgba(14,14,16,0.92)] p-6 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] backdrop-blur-2xl ring-1 ring-white/10"
        >
          <div className="mb-6 text-center">
            <h2 className="mb-2 text-xl font-bold uppercase tracking-widest text-white" style={{ color: data.color }}>
              Send {data.name}
            </h2>
            <div className="mx-auto mb-6 aspect-square w-40 rounded-xl border border-white/10 bg-white p-2.5">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${data.address}`} 
                alt="QR Code"
                className="h-full w-full"
              />
            </div>
            <div className="group relative cursor-pointer" onClick={() => {
              navigator.clipboard.writeText(data.address);
              alert("Address copied to clipboard!");
            }}>
              <p className="break-all font-mono text-xs text-[var(--text-muted)] transition-colors group-hover:text-white">
                {data.address}
              </p>
              <p className="mt-2 text-[0.62rem] uppercase tracking-[0.2em] text-[var(--text-faint)]">Click to copy address</p>
              </div>
              </div>
              <button 
              onClick={onClose}
              className="bio-control bio-control-primary w-full"
              >
              Close
              </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
