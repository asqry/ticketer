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
    embedChannelId: string
    ticketParentId: string
    defaultRoleId?: string
    raisedRoleId?: string
    color?: string
    name?: string
    image?: string
    tickets: Ticket[]
}

const data: Schema = new Schema<Panel>({
    id: String,
    guildId: String,
    embedChannelId: String,
    ticketParentId: String,
    defaultRoleId: String,
    raisedRoleId: String,
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