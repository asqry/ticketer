import { Schema, model } from 'mongoose'


export interface Guild {
    id: string
    name: string
    ownerId: string
    updates_channel?: string
    audit_log_channel?: string
    member_role?: string
}

const data: Schema = new Schema<Guild>({
    id: String,
    name: String,
    ownerId: String,
    updates_channel: { type: String, default: null, required: false },
    audit_log_channel: { type: String, default: null, required: false },
    member_role: { type: String, default: null, required: false }
})

const guildsModel = model('guild', data)

export default guildsModel