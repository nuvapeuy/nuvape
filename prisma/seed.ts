import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Crear marca ELFBAR
  const elfbar = await prisma.brand.upsert({
    where: { slug: "elfbar" },
    update: {},
    create: { name: "ELFBAR", slug: "elfbar" },
  });

  // Crear flags
  const flagsData = [
    { name: "HOT", label: "🔥 HOT", color: "#ff3355" },
    { name: "SUMMER_EDITION", label: "SUMMER EDITION", color: "#39ff88" },
    { name: "NEW", label: "NEW", color: "#39ff88" },
    { name: "TOP_SELLER", label: "TOP SELLER", color: "#b026ff" },
  ];
  for (const f of flagsData) {
    await prisma.flag.upsert({ where: { name: f.name }, update: {}, create: f });
  }

  // Crear sabores
  const flavorsData = ["Blue Razz Ice", "Watermelon Ice", "Grape Ice", "Mango", "Mint", "Peach", "Black Mint"];
  for (const name of flavorsData) {
    await prisma.flavor.upsert({ where: { name }, update: {}, create: { name } });
  }

  // Productos
  const products = [
    {
      slug: "blue-razz-ice-40k",
      name: "Blue Razz ICE 40K",
      description: "Frambuesa azul helada con 5 niveles de frío ajustable. Pantalla digital integrada.",
      price: 1150,
      puffs: 40000,
      nicotineLevel: 5,
      stock: 7,
      imageUrl: "/products/BlueRazzICE.png",
      flags: [] as string[],
      flavors: ["Blue Razz Ice"],
    },
    {
      slug: "watermelon-ice-40k",
      name: "Watermelon ICE 40K",
      description: "Sandía jugosa con un final helado refrescante. Pantalla digital integrada.",
      price: 1150,
      puffs: 40000,
      nicotineLevel: 5,
      stock: 7,
      imageUrl: "/products/WatermelonICE.png",
      flags: [] as string[],
      flavors: ["Watermelon Ice"],
    },
    {
      slug: "grape-ice-40k",
      name: "Grape ICE 40K",
      description: "Uva intensa con toque helado y 5 niveles de frío ajustable.",
      price: 1150,
      puffs: 40000,
      nicotineLevel: 5,
      stock: 20,
      imageUrl: "/products/GrapeICE.png",
      flags: ["HOT"],
      flavors: ["Grape Ice"],
    },
    {
      slug: "mango-magic-40k",
      name: "Mango Magic 40K",
      description: "Mango tropical dulce y cremoso con pantalla digital integrada.",
      price: 1150,
      puffs: 40000,
      nicotineLevel: 5,
      stock: 20,
      imageUrl: "/products/MangoMAGIC.png",
      flags: ["HOT"],
      flavors: ["Mango"],
    },
    {
      slug: "miami-mint-40k",
      name: "Miami Mint 40K",
      description: "Menta fresca y refrescante, ideal para los amantes del hielo.",
      price: 1150,
      puffs: 40000,
      nicotineLevel: 5,
      stock: 20,
      imageUrl: "/products/MiamiMINT.png",
      flags: ["HOT"],
      flavors: ["Mint"],
    },
    {
      slug: "peach-plus-40k",
      name: "Peach + 40K",
      description: "Durazno dulce y jugoso con un toque vibrante.",
      price: 1150,
      puffs: 40000,
      nicotineLevel: 5,
      stock: 20,
      imageUrl: "/products/PeachPlus.png",
      flags: [] as string[],
      flavors: ["Peach"],
    },
    {
      slug: "black-mint-40k",
      name: "Black Mint 40K",
      description: "Menta negra intensa con sabor profundo y refrescante.",
      price: 1150,
      puffs: 40000,
      nicotineLevel: 5,
      stock: 6,
      imageUrl: "/products/BlackMINT.png",
      flags: ["SUMMER_EDITION"],
      flavors: ["Black Mint"],
    },
  ];

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: { stock: p.stock, price: p.price },
      create: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        price: p.price,
        puffs: p.puffs,
        nicotineLevel: p.nicotineLevel,
        stock: p.stock,
        brandId: elfbar.id,
        images: { create: [{ url: p.imageUrl, position: 0 }] },
      },
    });

    // Flags
    for (const flagName of p.flags) {
      const flag = await prisma.flag.findUnique({ where: { name: flagName } });
      if (flag) {
        await prisma.productFlag.upsert({
          where: { productId_flagId: { productId: product.id, flagId: flag.id } },
          update: {},
          create: { productId: product.id, flagId: flag.id },
        });
      }
    }

    // Flavors
    for (const flavorName of p.flavors) {
      const flavor = await prisma.flavor.findUnique({ where: { name: flavorName } });
      if (flavor) {
        await prisma.productFlavor.upsert({
          where: { productId_flavorId: { productId: product.id, flavorId: flavor.id } },
          update: {},
          create: { productId: product.id, flavorId: flavor.id },
        });
      }
    }

    console.log(`✓ ${p.name}`);
  }

  console.log("\n✅ Seed completado.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
