"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CRYPTO_DATA = {
  eth: {
    name: "Ethereum",
    ticker: "ETH",
    address: "0xF631fd9773740056cd116AA1364E894B448C5CF0",
    color: "#627EEA",
  },
  btc: {
    name: "Bitcoin",
    ticker: "BTC",
    address: "bc1pnu4rw22fqz5v3y6tvmx9ject7pwfayc0mr28ecdn6w3sx6xdrjmsh5tw5k",
    color: "#F7931A",
  },
  sol: {
    name: "Solana",
    ticker: "SOL",
    address: "3mG96WjgDNaj1R8XkxifheoBsoPisVTKwDHFo4ErMeRy",
    color: "#14F195",
  },
};

type CryptoModalProps = {
  selectedCrypto: keyof typeof CRYPTO_DATA | null;
  onClose: () => void;
};

export default function CryptoModal({ selectedCrypto, onClose }: CryptoModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!selectedCrypto) return;
    setCopied(false);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selectedCrypto, onClose]);

  const data = selectedCrypto ? CRYPTO_DATA[selectedCrypto] : null;

  const copy = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.address);
    } catch {
      const input = document.createElement("textarea");
      input.value = data.address;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          className="crypto-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="crypto-card"
            style={{ "--crypto": data.color } as React.CSSProperties}
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            onClick={(event) => event.stopPropagation()}
          >
            <button className="crypto-close" onClick={onClose} aria-label="Close">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <div className="crypto-head">
              <span className="crypto-badge">{data.ticker}</span>
              <div className="min-w-0">
                <div className="crypto-title">Receive {data.name}</div>
                <div className="crypto-sub">Scan or copy the address below</div>
              </div>
            </div>

            <div className="crypto-qr">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=0&data=${data.address}`}
                alt={`${data.name} address QR code`}
                className="h-full w-full"
              />
            </div>

            <button
              className={`crypto-address ${copied ? "is-copied" : ""}`}
              onClick={copy}
            >
              <span className="crypto-address-text">{data.address}</span>
              <span className="crypto-copy-chip">
                {copied ? (
                  <>
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="11" height="11" rx="2" />
                      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                    </svg>
                    Copy
                  </>
                )}
              </span>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
