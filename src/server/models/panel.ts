import { Schema, model } from 'mongoose'
import config from '../../config'


export enum TicketType {
    NORMAL_UNRAISABLE_UNCLAIMABLE = 1,
    NORMAL_UNRAISABLE_CLAIMABLE = 2,
    NORMAL_RAISABLE_UNCLAIMABLE = 3,
    NORMAL_RAISABLE_CLAIMABLE = 4,
    ADMIN_UNRAISABLE_UNCLAIMABLE = 5,
    ADMIN_UNRAISABLE_CLAIMABLE = 6,
    ADMIN_RAISABLE_UNCLAIMABLE = 7,
    ADMIN_RAISABLE_CLAIMABLE = 8
}
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

export interface ApiTicket {
    emoji: string,
    name: string,
    type: TicketType
}

export interface Panel {
    id: string
    guildId: string
    embedChannel: string
    ticketParentChannel: string
    defaultRole?: string
    raisedRole?: string
    embedMessage: string
    color: string
    name: string
    image?: string
    ticketTypes: ApiTicket[]
    tickets: Ticket[]
}

const data: Schema = new Schema<Panel>({
    id: String,
    guildId: String,
    embedChannel: String,
    ticketParentChannel: String,
    defaultRole: String,
    raisedRole: String,
    embedMessage: String,
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
    ticketTypes: [],
    tickets: []
})

const panelsModel = model('panel', data)

export default panelsModel