"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type Faq = { id: string; question: string; answer: string };

export default function FaqClient({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold text-white">Preguntas frecuentes</h1>
      <p className="mt-2 text-sm text-muted-foreground">Todo lo que necesitás saber antes de comprar.</p>

      <div className="mt-10 flex flex-col gap-3">
        {faqs.length === 0 && (
          <p className="text-center text-muted-foreground py-12">Próximamente...</p>
        )}
        {faqs.map((f) => (
          <div key={f.id} className="glass rounded-xl border border-white/10 overflow-hidden">
            <button
              onClick={() => setOpen(open === f.id ? null : f.id)}
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <span className="text-sm font-semibold text-white">{f.question}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open === f.id ? "rotate-180" : ""}`} />
            </button>
            {open === f.id && (
              <div className="border-t border-white/5 px-5 py-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{f.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
