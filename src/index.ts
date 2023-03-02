import { ActivityType, Client } from 'discord.js'
import fs from "fs"
import express, { Application, NextFunction, Request, Response } from "express"
import mongoose from 'mongoose'
import cors from 'cors'
import { Server } from 'socket.io'
import { io, Socket } from 'socket.io-client'

import 'dotenv/config'
import utils, { Log } from './utils'
import auditLogger from './auditLogger'

const app: Application = express()
const client: Client = new Client({ intents: ['Guilds', 'GuildMembers', 'GuildPresences', 'GuildMessages', 'MessageContent'], presence: { activities: [{ name: 'New Tickets', type: ActivityType.Watching }] } })
const ios: Server = new Server(6789)

const socket: Socket = io(process.env.SOCKET_URL as string)

const loadEvents = (): void => {
    fs.readdir(`${__dirname}/events`, (er, files) => {
        if (er) return utils.log(Log.ERROR, er.message)


        if (files.length == 0) return utils.log(Log.ERROR, "No events found.")

        files.forEach(file => {
            const ev = require(`${__dirname}/events/${file}`).default
            const event = new ev(client),
                eventname = file.slice(file.lastIndexOf('/') + 1, file.length - 3);

            if (!event.enabled) return;

            utils.log(Log.SUCCESS, `Loaded ${eventname} Event!`)
            client.on(eventname, async (...args) => event.run(...args))

        })
    })
}

loadEvents()

app.use(cors())
app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(express.json());


app.use((req: Request, res: Response, next: NextFunction) => {
    res.locals.client = client
    res.locals.socket = socket
    next()
})

ios.on("connection", s => {
    utils.log(Log.NEUTRAL, "New socket connection")

    s.on("guild_option_edit", async (data) => {
        await auditLogger.logConfigEdit(client, data)
    })
})

app.use('/guilds', require("./server/routes/guilds"))

app.listen(process.env.SERVER_PORT, () => {
    mongoose.set('strictQuery', true)
    mongoose.connect(process.env.MONGO_URI as string, {}, () => {
        utils.log(Log.SUCCESS, `DB connected to ${mongoose.connection.host}:${mongoose.connection.port}`)
    })
    utils.log(Log.SUCCESS, `Listening to http://localhost:${process.env.SERVER_PORT}`)
})

process.on('exit', () => {
    client.destroy()
    socket.close()
    ios.close()
})

client.login(process.env.TOKEN)
