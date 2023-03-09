import 'dotenv/config'
import Discord, { Client } from 'discord.js';
import express, { Request, Response, Router } from 'express'
import { Document, Model } from 'mongoose';
import utils, { HttpCode } from '../../utils';
import guild, { Guild } from '../models/guild'
import rs from "random-string"
import panel, { Panel } from '../models/panel';
const router: Router = express.Router();

interface ApiGuild {
    id: string
}

interface ApiConfig {
    value: string,
    editedBy: string
}


interface ApiTicket {
    id: string
    type: number
    panelId: string
    channelId: string
    ownerId: string
    adjustable: boolean
    claimable: boolean
}
interface ApiPanel {
    id: string
    guildId: string
    embedChannel: string
    ticketParentChannel: string
    defaultRole: string
    embedMessage: string
    raisedRole?: string
    color: string
    name: string
    image?: string
    createdBy: string
    tickets: ApiTicket[]
}

interface ApiPanelEdit extends ApiPanel {
    editedBy: string
}

// function isApiPanel(obj: any): obj is ApiPanel {
//     return obj !== undefined
// }

function generateId(): string {

    let id = rs({ length: 12, special: false, numeric: true, letters: true })
    return id;
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

router.get('/:id/panels', async (req: Request, res: Response) => {
    let isAuthed: boolean = await auth(req);
    const guildId: string = req.params.id

    if (!isAuthed) return utils.apiResponse(HttpCode.UNAUTHORIZED, res)
    if (!guildId) return utils.apiResponse(HttpCode.BAD_REQUEST, res)

    const apiGuild: Guild | null = await guild.findOne({ id: guildId })

    if (!apiGuild) return utils.apiResponse(HttpCode.NOT_FOUND, res, { message: 'Guild does not exist.' })

    const apiPanels = await panel.find({ guildId: guildId })
    if (!apiPanels || apiPanels.length <= 0) return utils.apiResponse(HttpCode.NOT_FOUND, res, { message: `No panels exist for guild ${apiGuild.id}.` })

    return utils.apiResponse(HttpCode.OK, res, apiPanels)
})

router.get('/:id/panels/:panelId', async (req: Request, res: Response) => {
    let isAuthed: boolean = await auth(req);
    const guildId: string = req.params.id
    const panelId: string = req.params.panelId

    if (!isAuthed) return utils.apiResponse(HttpCode.UNAUTHORIZED, res)
    if (!guildId) return utils.apiResponse(HttpCode.BAD_REQUEST, res)

    const apiGuild: Guild | null = await guild.findOne({ id: guildId })
    if (!apiGuild) return utils.apiResponse(HttpCode.NOT_FOUND, res, { message: 'Guild does not exist.' })

    const apiPanel = await panel.findOne({ guildId: guildId, id: panelId })
    if (!apiPanel) return utils.apiResponse(HttpCode.NOT_FOUND, res, { message: 'Panel does not exist.' })

    return utils.apiResponse(HttpCode.OK, res, apiPanel)
})

router.post('/:id/panels/create', async (req: Request, res: Response) => {
    let isAuthed: boolean = await auth(req);
    const guildId: string = req.params.id
    const payload: ApiPanel = req.body
    const panelId = generateId()

    if (!isAuthed) return utils.apiResponse(HttpCode.UNAUTHORIZED, res)
    if (!guildId) return utils.apiResponse(HttpCode.BAD_REQUEST, res)
    if (!payload || !payload.embedChannel || !payload.ticketParentChannel || !payload.createdBy) return utils.apiResponse(HttpCode.BAD_REQUEST, res)

    const apiGuild: Guild | null = await guild.findOne({ id: guildId })

    if (!apiGuild) return utils.apiResponse(HttpCode.NOT_FOUND, res, { message: 'Guild does not exist.' })
    if (!apiGuild.support_team_role) return utils.apiResponse(HttpCode.BAD_REQUEST, res, { message: 'You must set the support_team_role option' })

    payload.id = panelId
    payload.guildId = apiGuild.id
    if (!payload.defaultRole) payload.defaultRole = apiGuild.support_team_role

    let newPanel = new panel(payload)

    newPanel.save().then((document) => {
        utils.apiResponse(HttpCode.OK, res, document)
        res.locals.socket.emit("panel_create", { ...payload })
    }).catch(err => {
        utils.apiResponse(HttpCode.INTERNAL_SERVER_ERROR, res, err)
    })
})

router.patch('/:id/panels/:panelId', async (req: Request, res: Response) => {
    let isAuthed: boolean = await auth(req);
    const guildId: string = req.params.id
    const panelId: string = req.params.panelId
    const payload: ApiPanelEdit = req.body

    if (!isAuthed) return utils.apiResponse(HttpCode.UNAUTHORIZED, res)
    if (!guildId) return utils.apiResponse(HttpCode.BAD_REQUEST, res)
    if (!panelId) return utils.apiResponse(HttpCode.BAD_REQUEST, res)
    if (!payload || !payload.editedBy) return utils.apiResponse(HttpCode.BAD_REQUEST, res)

    const apiGuild: Guild | null = await guild.findOne({ id: guildId })

    if (!apiGuild) return utils.apiResponse(HttpCode.NOT_FOUND, res, { message: 'Guild does not exist.' })
    if (!apiGuild.support_team_role) return utils.apiResponse(HttpCode.BAD_REQUEST, res, { message: 'You must set the support_team_role option' })

    const apiPanel = await panel.findOne({ guildId: guildId, id: panelId })
    if (!apiPanel) return utils.apiResponse(HttpCode.NOT_FOUND, res, { message: 'Panel does not exist.' })

    let oldApiPanel = JSON.stringify(apiPanel)

    Object.entries(payload).forEach(entry => {
        apiPanel[entry[0]] = entry[1]
    })

    apiPanel.save().then((document) => {
        utils.apiResponse(HttpCode.OK, res, document)
        res.locals.socket.emit("panel_edit", { id: panelId, guildId: guildId, editedBy: payload.editedBy, data: { oldValue: JSON.parse(oldApiPanel), newValue: apiPanel, changedEntries: Object.keys(payload).filter((x: string) => x !== "editedBy") } })
    }).catch(err => {
        utils.apiResponse(HttpCode.INTERNAL_SERVER_ERROR, res, err)
    })
})

router.delete('/:id/panels/:panelId', async (req: Request, res: Response) => {
    let isAuthed: boolean = await auth(req);
    const guildId: string = req.params.id
    const panelId: string = req.params.panelId

    if (!isAuthed) return utils.apiResponse(HttpCode.UNAUTHORIZED, res)
    if (!guildId) return utils.apiResponse(HttpCode.BAD_REQUEST, res)
    if (!panelId) return utils.apiResponse(HttpCode.BAD_REQUEST, res)

    const apiGuild: Guild | null = await guild.findOne({ id: guildId })

    if (!apiGuild) return utils.apiResponse(HttpCode.NOT_FOUND, res, { message: 'Guild does not exist.' })

    const apiPanel = await panel.findOne({ guildId: guildId, id: panelId })
    if (!apiPanel) return utils.apiResponse(HttpCode.NOT_FOUND, res, { message: 'Panel does not exist.' })

    apiPanel.deleteOne({ guildId: guildId, id: panelId }).then((document) => {
        utils.apiResponse(HttpCode.OK, res, document)
        res.locals.socket.emit("panel_delete", apiPanel)
    }).catch(err => {
        utils.apiResponse(HttpCode.INTERNAL_SERVER_ERROR, res, err)
    })


})


module.exports = router;