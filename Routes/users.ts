import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";

const prisma = new PrismaClient();
const router = Router();

const userSchema = z.object({
    name: z.string(),
    email: z.string(),
    cpf: z.string().length(11),
    password: z.string()
})

function validaSenha(senha: string) {

    const mensa: string[] = []

    // .length: retorna o tamanho da string (da senha)
    if (senha.length < 8) {
        mensa.push("Erro... senha deve possuir, no mínimo, 8 caracteres")
    }  
    // contadores
    let pequenas = 0
    let grandes = 0
    let numeros = 0
    let simbolos = 0

    // senha = "abc123"
    // letra = "a"  
    // percorre as letras da variável senha
    for (const letra of senha) {
      // expressão regular
        if ((/[a-z]/).test(letra)) {
            pequenas++
        }
        else if ((/[A-Z]/).test(letra)) {
            grandes++
        }
        else if ((/[0-9]/).test(letra)) {
            numeros++
        } else {
            simbolos++
        }
    }

    if (pequenas == 0) {
        mensa.push("Erro... senha deve possuir letra(s) minúscula(s)")
    }

    if (grandes == 0) {
        mensa.push("Erro... senha deve possuir letra(s) maiúscula(s)")
    }

    if (numeros == 0) {
        mensa.push("Erro... senha deve possuir número(s)")
    }

    if (simbolos == 0) {
        mensa.push("Erro... senha deve possuir símbolo(s)")
    }

    return mensa
}


router.get("/", async (req, res) => {
    try{
        const users = await prisma.user.findMany();
        res.status(200).json(users);
    }
    catch(error){
        res.status(400).json({ error: "Erro ao buscar usuários" });
    }
})

router.post("/", async (req, res) => {
    const valida = userSchema.safeParse(req.body)

    if (!valida.success) {
        res.status(400).json({ error: valida.error })
        return 
    }

    const erros = validaSenha(valida.data.password)
    if (erros.length > 0) {
        res.status(400).json({ error: erros.join("; ") })
        return
    }

    const salt = bcrypt.genSaltSync(12);
    const hash = bcrypt.hashSync(valida.data.password, salt)

    try {
        const user = await prisma.user.create({
            data: { ...valida.data, password: hash }
        })
        res.status(201).json(user)
    } catch (error) {
        res.status(400).json(error)
    }
})

router.patch('/:id', async (req, res) =>{
    const { id } = req.params
    const { password, newPassword } = req.body

    if (!password || !newPassword) {
        res.status(400).json({ error: "Campos não preenchidos corretamente" })
        return
    }

    const user = await prisma.user.findUnique({
        where: { id: Number(id) }
    })

    if (!user) {
        res.status(400).json({ error: "Usuário não encontrado" })
        return
    }

    if (!bcrypt.compareSync(password, user.password)) {
        res.status(400).json({ error: "Senha atual incorreta" })
        return
    }

    const erros = validaSenha(newPassword)
    if (erros.length > 0) {
        res.status(400).json({ error: erros.join("; ") })
        return
    }

    const salt = bcrypt.genSaltSync(12)
    const hash = bcrypt.hashSync(newPassword, salt)

    try {
        await prisma.user.update({
            where: { id: Number(id) },
            data: { password: hash }
        })
        res.json({ message: "Senha alterada com sucesso" })
    } catch (error) {
        res.status(400).json({ error: "Erro ao alterar a senha" })
    }

})

router.delete('/:id', async (req, res) => {
    const { id } = req.params

    try{
        await prisma.user.delete({
            where: { id: Number(id) }
        })
        res.json({ message: "Usuario deletado" })
    } catch(err){
        res.status(500).json({ error: "Erro ao deletar o usuario" })
    }
})

export default router