import { Schema, model } from 'mongoose'

interface Ticket {
    id: string
    channelId: string
    parentId: string
    ownerId: string
    raisable: boolean
    raised: boolean
}

interface Panel {
    id: string
    guildId: string
    defaultRoleId: string
    raisedRoleId?: string
    tickets: Ticket[]
}

const data: Schema = new Schema<Panel>({
    id: {
        required: true
    },
    guildId: {
        required: true
    },
    defaultRoleId: {
        required: true
    },
    raisedRoleId: {
        required: false
    },
    tickets: {
        required: true,
        default: []
    }
})

const panelsModel = model('panel', data)

export default panelsModel