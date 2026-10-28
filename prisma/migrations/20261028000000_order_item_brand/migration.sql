-- Marca de cada ítem del pedido, guardada como texto (igual que productName).
ALTER TABLE "OrderItem" ADD COLUMN "brandName" TEXT;

-- Los ítems que ya existen toman la marca actual de su producto.
UPDATE "OrderItem" oi
SET "brandName" = b."name"
FROM "Product" p
JOIN "Brand" b ON b."id" = p."brandId"
WHERE oi."productId" = p."id" AND oi."brandName" IS NULL;
