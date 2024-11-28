import { Types ,PrismaClient } from "@prisma/client"
import { Router } from "express"
import { z } from "zod"
import { verifyToken } from "../middlewares/verifyToken"

const prisma = new PrismaClient()
const router = Router()

const roomSchema = z.object({
    number: z.number(),
    type: z.nativeEnum(Types).optional(),
    size: z.number(),
    hotelId: z.number(),
    price: z.number(),
})

router.get('/', async (req, res) => {
    try{
        const rooms = await prisma.room.findMany()
        res.json(rooms)
    }
    catch(err){
        res.json({ error: "Erro ao buscar os quartos" })
    }
})

router.post("/", verifyToken, async (req, res) => {

    const valida = roomSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ error: valida.error })
        return
    }

    try{
        const room = await prisma.room.create({
            data: valida.data
        })
        res.json(room)
    }catch(err){
        res.status(500).json({ error: "Erro ao criar o quarto" })
    }
})

router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params

    try{
        await prisma.room.delete({
            where: { id: Number(id) }
        })
        res.json({ message: "Quarto deletado" })
    } catch(err){
        res.status(500).json({ error: "Erro ao deletar o quarto" })
    }
})

export default router