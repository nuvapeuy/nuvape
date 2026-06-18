"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { ProductCard } from "@/components/product-card";
import { type MockProduct, flagLabel } from "@/lib/mock-data";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Search, SlidersHorizontal, ChevronDown, X, Plus, Minus } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { toast } from "sonner";

const MAX_PRICE = 3000;

type CategoryMeta = { name: string; productCount: number };

export default function CatalogoClient({ products, allCategories = [] }: { products: MockProduct[]; allCategories?: CategoryMeta[] }) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [brands, setBrands] = useState<string[]>([]);
  const [flavors, setFlavors] = useState<string[]>([]);
  const [flags, setFlags] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const ALL_BRANDS = Array.from(new Set(products.map((p) => p.brand)));
  const ALL_FLAVORS = Array.from(new Set(products.flatMap((p) => p.flavors)));
  const ALL_FLAGS = Array.from(new Set(products.flatMap((p) => p.flags)));

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (q && !`${p.name} ${p.brand} ${p.flavors.join(" ")}`.toLowerCase().includes(q)) return false;
      if (brands.length && !brands.includes(p.brand)) return false;
      if (flavors.length && !p.flavors.some((f) => flavors.includes(f))) return false;
      if (flags.length && !p.flags.some((f) => flags.includes(f))) return false;
      if (selectedCategories.length && !p.categories?.some((c) => selectedCategories.includes(c))) return false;
      if (p.price > maxPrice) return false;
      if (onlyInStock && p.stock === 0) return false;
      return true;
    });
  }, [query, brands, flavors, flags, selectedCategories, maxPrice, onlyInStock, products]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-white">Catálogo</h1>
      <p className="mt-1 text-sm text-muted-foreground">{filtered.length} productos</p>

      <div className="glass mt-6 flex max-w-md items-center gap-2 rounded-full px-4 py-2.5">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar sabores, marcas o productos"
          className="border-none bg-transparent p-0 shadow-none focus-visible:ring-0"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit">
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className="glass mb-3 flex w-full items-center justify-between rounded-2xl px-5 py-3 text-sm font-semibold text-white lg:hidden"
          >
            <span className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" /> Filtros</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
          </button>
          <div className={`glass rounded-2xl p-5 ${filtersOpen ? "block" : "hidden"} lg:block`}>
            {allCategories.length > 0 && (
              <FilterGroup title="Categoría">
                {allCategories.map((c) => (
                  c.productCount > 0 ? (
                    <FilterCheckbox
                      key={c.name}
                      label={c.name}
                      checked={selectedCategories.includes(c.name)}
                      onChange={() => toggle(selectedCategories, setSelectedCategories, c.name)}
                    />
                  ) : (
                    <div key={c.name} className="flex items-center gap-2">
                      <Checkbox disabled />
                      <span className="text-sm text-[#C9A84C] font-medium">{c.name} <span className="text-[10px] font-normal opacity-80">— Próximamente</span></span>
                    </div>
                  )
                ))}
              </FilterGroup>
            )}
            <FilterGroup title="Marca">
              {ALL_BRANDS.map((b) => (
                <FilterCheckbox key={b} label={b} checked={brands.includes(b)} onChange={() => toggle(brands, setBrands, b)} />
              ))}
            </FilterGroup>
            <FilterGroup title="Sabores">
              {ALL_FLAVORS.map((f) => (
                <FilterCheckbox key={f} label={f} checked={flavors.includes(f)} onChange={() => toggle(flavors, setFlavors, f)} />
              ))}
            </FilterGroup>
            <FilterGroup title="Etiquetas especiales">
              {ALL_FLAGS.map((f) => (
                <FilterCheckbox key={f} label={flagLabel(f)} checked={flags.includes(f)} onChange={() => toggle(flags, setFlags, f)} />
              ))}
            </FilterGroup>
            <FilterGroup title="Precio máximo">
              <div className="px-1">
                <Slider
                  min={0}
                  max={MAX_PRICE}
                  step={100}
                  value={[maxPrice]}
                  onValueChange={(v) => setMaxPrice(Array.isArray(v) ? v[0] : v)}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Hasta ${maxPrice.toLocaleString("es-AR")}
                </p>
              </div>
            </FilterGroup>
            <FilterGroup title="Disponibilidad">
              <FilterCheckbox label="Solo con stock" checked={onlyInStock} onChange={() => setOnlyInStock(!onlyInStock)} />
            </FilterGroup>
          </div>
        </aside>

        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {filtered.length === 0 && (
              <p className="col-span-full py-20 text-center text-muted-foreground">
                No hay productos que coincidan con los filtros.
              </p>
            )}
          </div>

          <div id="promociones">
            <h2 className="mb-4 text-xl font-bold text-white">🎁 Promociones vigentes</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <PromoCard
                title="Pack x3"
                description="Llevate 3 ELFBAR Ice King 40K a elección"
                totalPrice={3300}
                unitPrice={1100}
                qty={3}
                badge="AHORRÁS $150"
                image="/promos/Elfbar PROMO X3.png"
                availableProducts={products.filter((p) => p.stock > 0)}
              />
              <PromoCard
                title="Pack x5"
                description="Llevate 5 ELFBAR Ice King 40K a elección"
                totalPrice={5000}
                unitPrice={1000}
                qty={5}
                badge="AHORRÁS $750"
                image="/promos/Elfbar PROMO X3.png"
                availableProducts={products.filter((p) => p.stock > 0)}
              />
            </div>
          </div>

          <FlavorQuiz products={products.filter((p) => p.stock > 0)} />
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="mb-3 text-xs font-semibold tracking-wide text-white uppercase">{title}</p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function FilterCheckbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <Label className="flex items-center gap-2 text-sm font-normal text-muted-foreground hover:text-white">
      <Checkbox checked={checked} onCheckedChange={onChange} />
      {label}
    </Label>
  );
}

type PromoCardProps = {
  title: string;
  description: string;
  totalPrice: number;
  unitPrice: number;
  qty: number;
  badge: string;
  image: string;
  availableProducts: MockProduct[];
};

function PromoCard({ title, description, totalPrice, unitPrice, qty, badge, image, availableProducts }: PromoCardProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<MockProduct[]>([]);
  const addItem = useCartStore((s) => s.addItem);

  const add = (p: MockProduct) => {
    const alreadySelected = selected.filter((s) => s.id === p.id).length;
    if (selected.length < qty && alreadySelected < p.stock) {
      setSelected((prev) => [...prev, p]);
    }
  };

  const remove = (index: number) => {
    setSelected((prev) => prev.filter((_, i) => i !== index));
  };

  const confirm = () => {
    const flavors = selected.map((p) => p.name.replace(/ 40K$/i, "")).join(", ");
    addItem({
      productId: `promo-${qty}-${Date.now()}`,
      name: `${title} — ${flavors}`,
      slug: "",
      price: totalPrice,
      imageUrl: image,
      stock: 999,
    });
    toast.success(`${title} agregado al carrito.`);
    setOpen(false);
    setSelected([]);
  };

  return (
    <>
      <div className="glass relative flex items-center gap-5 overflow-hidden rounded-2xl p-5">
        <div className="relative h-28 w-28 shrink-0">
          <Image src={image} alt={title} fill className="object-contain" />
        </div>
        <div className="flex-1">
          <span className="inline-block rounded-full bg-[var(--neon-green)]/10 px-2.5 py-0.5 text-[11px] font-bold text-[var(--neon-green)] ring-1 ring-[var(--neon-green)]/30">
            {badge}
          </span>
          <h3 className="mt-1 text-lg font-bold text-white">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
          <p className="mt-2 text-2xl font-extrabold text-[var(--neon-purple)]">${totalPrice.toLocaleString("es-AR")}</p>
          <button
            onClick={() => { setSelected([]); setOpen(true); }}
            className="mt-3 w-full rounded-lg bg-[var(--neon-purple)] py-2 text-sm font-semibold text-white hover:bg-[var(--neon-purple)]/90 transition-colors"
          >
            Armar pack
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="glass w-full max-w-md rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{title} — elegí {qty} sabores</h3>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Seleccionados */}
            <div className="mb-4 flex flex-wrap gap-2 min-h-[36px]">
              {selected.map((p, i) => (
                <span key={i} className="flex items-center gap-1 rounded-full bg-[var(--neon-purple)]/20 px-3 py-1 text-xs text-white ring-1 ring-[var(--neon-purple)]/40">
                  {p.name}
                  <button onClick={() => remove(i)}><X className="h-3 w-3" /></button>
                </span>
              ))}
              {selected.length === 0 && <p className="text-xs text-muted-foreground">Ninguno seleccionado aún</p>}
            </div>

            <p className="mb-3 text-xs text-muted-foreground">{selected.length}/{qty} seleccionados</p>

            {/* Lista de productos */}
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {availableProducts.map((p) => {
                const alreadySelected = selected.filter((s) => s.id === p.id).length;
                const isDisabled = selected.length >= qty || alreadySelected >= p.stock;
                const remaining = p.stock - alreadySelected;
                return (
                  <button
                    key={p.id}
                    onClick={() => add(p)}
                    disabled={isDisabled}
                    className="flex items-center gap-3 rounded-xl border border-white/10 p-3 text-left hover:bg-white/5 disabled:opacity-40 transition-colors"
                  >
                    <div className="relative h-10 w-10 shrink-0">
                      <Image src={p.imageUrl} alt={p.name} fill className="object-contain" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{remaining} disponibles</p>
                    </div>
                    <Plus className="h-4 w-4 text-[var(--neon-purple)]" />
                  </button>
                );
              })}
            </div>

            <button
              onClick={confirm}
              disabled={selected.length < qty}
              className="mt-4 w-full rounded-lg bg-[var(--neon-purple)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--neon-purple)]/90 disabled:opacity-40 transition-colors"
            >
              Agregar pack al carrito — ${totalPrice.toLocaleString("es-AR")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Flavor Quiz ────────────────────────────────────────────────────────────

const QUESTIONS = [
  {
    id: "intensity",
    question: "¿Cómo te gusta el sabor?",
    options: [
      { label: "🧊 Fresco y mentolado", value: "menthol" },
      { label: "🍓 Frutal y jugoso",    value: "frutal"  },
      { label: "🍬 Dulce y cremoso",    value: "sweet"   },
      { label: "🍋 Ácido y cítrico",    value: "citric"  },
    ],
  },
  {
    id: "moment",
    question: "¿Cuándo lo usás más?",
    options: [
      { label: "☀️ De día, saliendo",   value: "day"    },
      { label: "🌙 De noche, relajado", value: "night"  },
      { label: "🏃 Haciendo algo",      value: "active" },
      { label: "🛋️ En casa tranquilo",  value: "home"   },
    ],
  },
  {
    id: "nicotine",
    question: "¿Qué tan intenso lo querés?",
    options: [
      { label: "💨 Suave",     value: "low"    },
      { label: "⚡ Moderado",  value: "medium" },
      { label: "🔥 Intenso",   value: "high"   },
    ],
  },
];

type Answers = Record<string, string>;

function scoreProduct(p: MockProduct, answers: Answers): number {
  let score = 0;
  const name = p.name.toLowerCase();
  const cats = p.categories.map((c) => c.toLowerCase());
  const flavor = answers.intensity;
  const moment = answers.moment;
  const nicotine = answers.nicotine;

  if (flavor === "menthol" && (cats.includes("mentolados") || name.includes("mint") || name.includes("ice") || name.includes("cool"))) score += 3;
  if (flavor === "frutal"  && (cats.includes("frutales")   || name.includes("berry") || name.includes("mango") || name.includes("grape") || name.includes("peach") || name.includes("water"))) score += 3;
  if (flavor === "sweet"   && (cats.includes("dulces")     || name.includes("cream") || name.includes("cola")  || name.includes("candy") || name.includes("choco"))) score += 3;
  if (flavor === "citric"  && (cats.includes("cítricos")   || name.includes("lemon") || name.includes("lime")  || name.includes("citrus") || name.includes("orange"))) score += 3;

  if ((moment === "day" || moment === "active") && (name.includes("ice") || name.includes("mint") || name.includes("fresh"))) score += 1;
  if ((moment === "night" || moment === "home") && (name.includes("cream") || name.includes("cola") || name.includes("grape"))) score += 1;

  if (nicotine === "high"   && p.nicotineLevel >= 40) score += 2;
  if (nicotine === "medium" && p.nicotineLevel >= 20 && p.nicotineLevel < 40) score += 2;
  if (nicotine === "low"    && p.nicotineLevel < 20)  score += 2;

  if (p.flags.includes("HOT") || p.flags.includes("NEW")) score += 1;

  return score;
}

function FlavorQuiz({ products }: { products: MockProduct[] }) {
  const [started, setStarted]     = useState(false);
  const [step, setStep]           = useState(0);
  const [answers, setAnswers]     = useState<Answers>({});
  const [result, setResult]       = useState<MockProduct | null>(null);
  const addItem = useCartStore((s) => s.addItem);

  function answer(value: string) {
    const q = QUESTIONS[step];
    const newAnswers = { ...answers, [q.id]: value };
    setAnswers(newAnswers);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      const scored = products
        .map((p) => ({ p, score: scoreProduct(p, newAnswers) }))
        .sort((a, b) => b.score - a.score);
      setResult(scored[0]?.p ?? products[0]);
    }
  }

  function restart() {
    setStep(0);
    setAnswers({});
    setResult(null);
    setStarted(false);
  }

  if (!started) {
    return (
      <div className="glass rounded-2xl border border-white/10 p-8 text-center">
        <p className="text-2xl font-extrabold text-white">¿No sabés cuál elegir?</p>
        <p className="mt-2 text-sm text-muted-foreground">Respondé 3 preguntas y te recomendamos el sabor perfecto para vos.</p>
        <button
          onClick={() => setStarted(true)}
          className="mt-6 rounded-xl bg-[var(--neon-purple)] px-8 py-3 text-sm font-bold text-white hover:bg-[var(--neon-purple)]/90 transition-colors glow-purple"
        >
          Empezar quiz 🎯
        </button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="glass rounded-2xl border border-[var(--neon-purple)]/30 p-8">
        <p className="text-center text-xs font-semibold tracking-widest text-[var(--neon-purple)] uppercase">Tu sabor ideal es</p>
        <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row">
          <div className="relative h-40 w-40 shrink-0">
            <div className="absolute inset-0 rounded-full bg-[var(--neon-purple)]/20 blur-2xl" />
            <Image src={result.imageUrl} alt={result.name} fill className="object-contain drop-shadow-[0_0_20px_rgba(176,38,255,0.5)]" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{result.brand}</p>
            <h3 className="mt-1 text-2xl font-extrabold text-white">{result.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{result.puffs.toLocaleString("es-AR")} puffs · {result.nicotineLevel}mg</p>
            <p className="mt-2 text-2xl font-extrabold text-[var(--neon-purple)]">${result.price.toLocaleString("es-AR")}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
              <button
                onClick={() => {
                  addItem({ productId: result.id, name: result.name, slug: result.slug, price: result.price, imageUrl: result.imageUrl, stock: result.stock });
                  toast.success(`${result.name} agregado al carrito.`);
                }}
                className="rounded-xl bg-[var(--neon-purple)] px-6 py-2.5 text-sm font-bold text-white hover:bg-[var(--neon-purple)]/90 transition-colors"
              >
                Agregar al carrito
              </button>
              <button onClick={restart} className="rounded-xl border border-white/10 px-6 py-2.5 text-sm font-medium text-muted-foreground hover:text-white transition-colors">
                Repetir quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const q = QUESTIONS[step];
  return (
    <div className="glass rounded-2xl border border-white/10 p-8">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Pregunta {step + 1} de {QUESTIONS.length}</p>
        <div className="flex gap-1">
          {QUESTIONS.map((_, i) => (
            <div key={i} className={`h-1.5 w-8 rounded-full transition-colors ${i <= step ? "bg-[var(--neon-purple)]" : "bg-white/10"}`} />
          ))}
        </div>
      </div>
      <p className="text-xl font-bold text-white">{q.question}</p>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {q.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => answer(opt.value)}
            className="rounded-xl border border-white/10 px-5 py-4 text-left text-sm font-medium text-white hover:border-[var(--neon-purple)]/60 hover:bg-[var(--neon-purple)]/10 transition-all"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
