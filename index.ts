import express from "express"
import routesHotel from "./Routes/hotels"
import routesUsers from "./Routes/users"
import routesRooms from "./Routes/rooms"
import routesLogin from "./Routes/login"
import routesReservations from "./Routes/reservations"

const app = express()
const port = 3000

app.use(express.json())

app.use("/users", routesUsers)
app.use("/hotels", routesHotel)
app.use("/rooms", routesRooms)
app.use("/login", routesLogin)
app.use("/reservations", routesReservations)

app.get('/', (req, res) => {
    res.send("API de reservas")
})

app.listen(port, () =>{
    console.log(`Servidor rodando na porta: ${port}`)
})