-- CreateEnum
CREATE TYPE "SaleStatus" AS ENUM ('DRAFT', 'CHECKOUT_PENDING', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Sale" (
    "sale_id" TEXT NOT NULL,
    "operator_id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "status" "SaleStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotal_in_cents" INTEGER NOT NULL,
    "discount_in_cents" INTEGER NOT NULL,
    "total_in_cents" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("sale_id")
);

-- CreateTable
CREATE TABLE "SaleItem" (
    "sale_item_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price_in_cents" INTEGER NOT NULL,
    "sale_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SaleItem_pkey" PRIMARY KEY ("sale_item_id")
);

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "Sale"("sale_id") ON DELETE RESTRICT ON UPDATE CASCADE;
