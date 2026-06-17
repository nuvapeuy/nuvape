"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "nuvape_age_verified_at";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function AgeGate() {
  const [open, setOpen] = useState(false);
  const [exited, setExited] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const verifiedAt = Number(stored);
      if (!Number.isNaN(verifiedAt) && Date.now() - verifiedAt < THIRTY_DAYS_MS) {
        return;
      }
    }
    setOpen(true);
  }, []);

  function confirm() {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setOpen(false);
  }

  function exit() {
    setExited(true);
    window.location.href = "https://www.google.com";
  }

  return (
    <AnimatePresence>
      {open && !exited && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(176,38,255,0.12),transparent_60%)]" />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="glass-strong relative mx-4 w-full max-w-md rounded-2xl p-8 text-center"
          >
            <p className="text-xs font-medium tracking-[0.3em] text-[var(--neon-purple)] uppercase glow-text-purple">
              NUVAPE
            </p>
            <h1 className="mt-4 text-2xl font-semibold text-white">
              ¿Eres mayor de 18 años?
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Este contenido es exclusivo para adultos. Debes confirmar tu edad para continuar.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={confirm}
                className="glow-purple rounded-xl bg-[var(--neon-purple)] px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Sí, soy mayor de edad
              </button>
              <button
                onClick={exit}
                className="rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5"
              >
                Salir
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
