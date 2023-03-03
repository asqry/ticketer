import { Schema, model } from 'mongoose'
import config from '../../config'

export interface Ticket {
    id: string
    type: number
    panelId: string
    channelId: string
    ownerId: string
    claimeeId: string
    adjustable: boolean
    raised: boolean
    claimable: boolean
    claimed: boolean
}

export interface Panel {
    id: string
    guildId: string
    embedChannel: string
    ticketParentChannel: string
    defaultRole?: string
    raisedRole?: string
    color?: string
    name?: string
    image?: string
    tickets: Ticket[]
}

const data: Schema = new Schema<Panel>({
    id: String,
    guildId: String,
    embedChannel: String,
    ticketParentChannel: String,
    defaultRole: String,
    raisedRole: String,
    color: {
        type: String,
        default: config.branding.embed.colors.neutral
    },
    name: {
        type: String,
        default: "Ticket Panel"
    },
    image: {
        type: String
    },
    tickets: []
})

const panelsModel = model('panel', data)

export default panelsModel