import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { verifyToken } from "../middlewares/verifyToken";

const prisma = new PrismaClient();
const router = Router();

const reservationSchema = z.object({
  descricao: z.string(),
  qtdDias: z.number(),
  userId: z.number(),
  roomId: z.number(),
  hotelId: z.number(),
});

router.get("/", async (req, res) => {
  try {
    const reservations = await prisma.reservations.findMany({
      where: {
        deleted: false,
      },
      select: {
        id: true,
        descricao: true,
        qtdDias: true,
        userId: true,
        hotelId: true,
        roomId: true,
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
    res.json(reservations);
  } catch (err) {
    res.json({ error: "Erro ao buscar as reservas" });
  }
});

///

router.put("/:id", verifyToken, async (req, res): Promise<void> => {
  const { id } = req.params;
  const { qtdDias } = req.body;

  if (!qtdDias || qtdDias <= 0) {
    res.json("A quantidade de dias precisa ser maior que 0.");
    return;
  }

  try {
    const reservaExistente = await prisma.reservations.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!reservaExistente) {
      res.json("Reserva não encontrada.");
      return;
    }

    const reservaAtualizada = await prisma.reservations.update({
      where: {
        id: parseInt(id),
      },
      data: {
        qtdDias: qtdDias,
      },
    });

    res.json(reservaAtualizada);
  } catch (error) {
    console.error(error);
    res.json("Erro ao atualizar a reserva.");
  }
});

///

router.get("/deleted", async (req, res) => {
  try {
    const reservations = await prisma.reservations.findMany({
      where: {
        deleted: true,
      },
    });
    res.json(reservations);
  } catch (err) {
    res.json({ error: "Erro ao buscar as reservas deletadas" });
  }
});

router.post("/", verifyToken, async (req, res) => {
  const valida = reservationSchema.safeParse(req.body);
  if (!valida.success) {
    res.status(400).json({ error: valida.error });
    return;
  }

  const searchRoom = await prisma.room.findFirst({
    where: {
      id: valida.data.roomId,
    },
  });

  if (searchRoom?.disponivel == false) {
    res.status(400).json({ error: "Quarto ja está reservado" });
    return;
  }

  try {
    const reservation = await prisma.reservations.create({
      data: valida.data,
    });

    const room = await prisma.room.update({
      where: {
        id: valida.data.roomId,
      },

      data: {
        disponivel: false,
      },
    });

    res.json(reservation);
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar a reserva" });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const reservation = await prisma.reservations.findFirst({
      where: {
        id: Number(id),
      },
    });

    await prisma.room.update({
      where: {
        id: reservation?.roomId,
      },

      data: {
        disponivel: true,
      },
    });

    await prisma.reservations.update({
      data: {
        deleted: true,
      },
      where: {
        id: Number(id),
      },
    });

    res.json({ message: "Reserva deletada" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao deletar a reserva" });
  }
});

export default router;
