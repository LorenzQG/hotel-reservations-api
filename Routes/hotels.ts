import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { verifyToken } from "../middlewares/verifyToken";

const prisma = new PrismaClient();
const router = Router();

const hotelSchema = z.object({
  name: z.string(),
});

router.get("/", async (req, res) => {
  try {
    const hotels = await prisma.hotel.findMany({
      select: {
        id: true,
        name: true,
        room: {
          select: {
            id: true,
            number: true,
            type: true,
            size: true,
            price: true,
          },
        },
      },
    });
    res.json(hotels);
  } catch (err) {
    res.json({ error: "Erro ao buscar os hotéis" });
  }
});

router.post("/", verifyToken, async (req, res) => {
  const valida = hotelSchema.safeParse(req.body);
  if (!valida.success) {
    res.status(400).json({ error: valida.error });
    return;
  }

  try {
    const hotel = await prisma.hotel.create({
      data: valida.data,
    });
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar o hotel" });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  const valida = hotelSchema.safeParse(req.body);
  if (!valida.success) {
    res.status(400).json({ error: valida.error });
    return;
  }

  try {
    const hotel = await prisma.hotel.update({
      where: { id: Number(id) },
      data: valida.data,
    });
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar o hotel" });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.hotel.delete({
      where: { id: Number(id) },
    });
    res.json({ message: "Hotel deletada" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao deletar o hotel" });
  }
});

export default router;
