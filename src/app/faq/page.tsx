import { prisma } from "@/lib/prisma";
import FaqClient from "./faq-client";

export default async function FaqPage() {
  const faqs = await prisma.faq.findMany({ where: { active: true }, orderBy: { position: "asc" } });
  return <FaqClient faqs={faqs} />;
}
