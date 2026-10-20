-- Flag de activación por marca. Las marcas nuevas nacen inactivas.
ALTER TABLE "Brand" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT false;

-- Las marcas que ya existen (hoy solo ELFBAR) quedan activas para que la tienda no cambie.
UPDATE "Brand" SET "active" = true;
