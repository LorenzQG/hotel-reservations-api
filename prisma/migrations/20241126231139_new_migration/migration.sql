/*
  Warnings:

  - Added the required column `qtdDias` to the `Reservations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `Reservations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Reservations` ADD COLUMN `qtdDias` INTEGER NOT NULL,
    ADD COLUMN `total` DECIMAL(10, 2) NOT NULL;
