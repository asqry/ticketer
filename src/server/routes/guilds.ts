import 'dotenv/config'
import Discord, { Client } from 'discord.js';
import express, { Request, Response, Router } from 'express'
import { Document, Model } from 'mongoose';
import utils, { HttpCode } from '../../utils';
import guild, { Guild } from '../models/guild'
const router: Router = express.Router();

interface ApiGuild {
    id: string
}

interface ApiConfig {
    value: string,
    editedBy: string
}

async function auth(req: Request): Promise<boolean> {
    let authKey = req.headers['x-auth-token']
    if (!authKey || authKey !== process.env.TOKEN) {
        return false;
    }

    return true;
}

router.get("/", async (req: Request, res: Response) => {
    let isAuthed: boolean = await auth(req);

    if (!isAuthed) return utils.apiResponse(HttpCode.UNAUTHORIZED, res)

    utils.apiResponse(HttpCode.NOT_FOUND, res)
})

router.get('/:id', async (req: Request, res: Response) => {
    let isAuthed: boolean = await auth(req);
    const guildId: string = req.params.id

    if (!isAuthed) return utils.apiResponse(HttpCode.UNAUTHORIZED, res)
    if (!guildId) return utils.apiResponse(HttpCode.BAD_REQUEST, res)

    const apiGuild: Model<Guild> | null = await guild.findOne({ id: guildId })

    if (!apiGuild) return utils.apiResponse(HttpCode.NOT_FOUND, res, { message: 'Guild does not exist.' })

    utils.apiResponse(HttpCode.OK, res, apiGuild)

})

router.get('/:id/config/:option', async (req: Request, res: Response) => {
    let isAuthed: boolean = await auth(req);
    const guildId: string = req.params.id
    const option: string = req.params.option.toLowerCase()

    if (!isAuthed) return utils.apiResponse(HttpCode.UNAUTHORIZED, res)
    if (!guildId) return utils.apiResponse(HttpCode.BAD_REQUEST, res)
    if (!option) return utils.apiResponse(HttpCode.BAD_REQUEST, res)


    const apiGuild = await guild.findOne({ id: guildId })
    if (!apiGuild) return utils.apiResponse(HttpCode.NOT_FOUND, res, { message: 'Guild does not exist.' })
    if (!apiGuild[option]) return utils.apiResponse(HttpCode.NOT_FOUND, res, { message: 'Config option does not exist.' })

    let data: any = {}
    data[option] = apiGuild[option]


    utils.apiResponse(HttpCode.OK, res, { ...data })

})

router.get('/:id/config', async (req: Request, res: Response) => {
    let isAuthed: boolean = await auth(req);
    const guildId: string = req.params.id

    if (!isAuthed) return utils.apiResponse(HttpCode.UNAUTHORIZED, res)
    if (!guildId) return utils.apiResponse(HttpCode.BAD_REQUEST, res)


    const apiGuild = await guild.findOne({ id: guildId })
    if (!apiGuild) return utils.apiResponse(HttpCode.NOT_FOUND, res, { message: 'Guild does not exist.' })

    let mentions: any = {
        'role': '<@&[id]>',
        'channel': '<#[id]>'
    }

    let keys: string[] = Object.keys(apiGuild.toJSON()).filter(x => x.endsWith("_role") || x.endsWith("_channel"))

    let map = keys.map(key => ({ key, value: apiGuild[key] != null ? mentions[key.split("_")[key.split("_").length - 1]].replace(/\[id\]/gim, apiGuild[key]) : 'not set' }))

    utils.apiResponse(HttpCode.OK, res, { map })

})

router.patch('/:id/config/:option', async (req: Request, res: Response) => {
    let isAuthed: boolean = await auth(req);
    const payload: ApiConfig = req.body;
    const guildId: string = req.params.id
    const option: string = req.params.option

    if (!isAuthed) return utils.apiResponse(HttpCode.UNAUTHORIZED, res)
    if (!guildId) return utils.apiResponse(HttpCode.BAD_REQUEST, res)
    if (!option) return utils.apiResponse(HttpCode.BAD_REQUEST, res)
    if (!payload || !payload.value || !payload.editedBy) return utils.apiResponse(HttpCode.BAD_REQUEST, res)


    const apiGuild = await guild.findOne({ id: guildId })
    if (!apiGuild) return utils.apiResponse(HttpCode.NOT_FOUND, res, { message: 'Guild does not exist.' })



    let oldApiGuild = apiGuild.toJSON();

    apiGuild[option] = payload.value
    apiGuild.save().then((document: Document) => {
        utils.apiResponse(HttpCode.OK, res, document)

        res.locals.socket.emit("guild_option_edit", { guildId: apiGuild.id, data: { option: option, oldValue: oldApiGuild[option], newValue: apiGuild[option], editedBy: payload.editedBy, } })

    }).catch(err => {
        utils.apiResponse(HttpCode.INTERNAL_SERVER_ERROR, res, err)
    })
})

router.post('/create', async (req: Request, res: Response) => {
    let isAuthed: boolean = await auth(req);
    const payload: ApiGuild = req.body;
    const client: Client = res.locals.client
    const apiGuild: Model<Guild> | null = await guild.findOne({ id: payload.id })

    if (!isAuthed) return utils.apiResponse(HttpCode.UNAUTHORIZED, res)

    if (apiGuild) return utils.apiResponse(HttpCode.BAD_REQUEST, res, { message: 'Guild already exists.' })

    if (!payload || !payload.id) return utils.apiResponse(HttpCode.BAD_REQUEST, res)

    let discordGuild: Discord.Guild | undefined = client.guilds.cache.get(payload.id)
    if (!discordGuild) return utils.apiResponse(HttpCode.BAD_REQUEST, res, { message: 'Client is not in the guild.' })

    let newGuild = new guild<Guild>({
        id: payload.id,
        name: discordGuild.name,
        ownerId: discordGuild.ownerId
    })

    if (!newGuild) return utils.apiResponse(HttpCode.BAD_REQUEST, res)


    newGuild.save().then((document: Document) => {
        utils.apiResponse(HttpCode.OK, res, document)
    }).catch(err => {
        utils.apiResponse(HttpCode.INTERNAL_SERVER_ERROR, res, err)
    })

})

router.delete('/delete/:id', async (req: Request, res: Response) => {
    let isAuthed: boolean = await auth(req);
    const guildId: string = req.params.id

    if (!isAuthed) return utils.apiResponse(HttpCode.UNAUTHORIZED, res)

    if (!guildId) return utils.apiResponse(HttpCode.BAD_REQUEST, res)

    const apiGuild: Model<Guild> | null = await guild.findOne({ id: guildId })

    if (!apiGuild) return utils.apiResponse(HttpCode.NOT_FOUND, res, { message: 'Guild does not exist.' })

    apiGuild.deleteOne({ id: guildId }).then(() => {
        utils.apiResponse(HttpCode.OK, res)
    }).catch(err => {
        return utils.apiResponse(HttpCode.INTERNAL_SERVER_ERROR, res, { message: 'Failed to delete guild.' })
    })
})



module.exports = router;