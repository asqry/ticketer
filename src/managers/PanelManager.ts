import { Client, Guild } from "discord.js"

export default class PanelManager {
    client: Client
    guild: Guild

    constructor(client: Client, guild: Guild) {
        this.client = client
        this.guild = guild
    }
}