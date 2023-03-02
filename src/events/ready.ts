import { Client, Role, TextChannel } from 'discord.js';
import utils, { Log } from '../utils';
import { Commands } from '../commands';


export default class Ready {
    client: Client
    enabled: Boolean

    constructor(client: Client) {
        this.client = client
        this.enabled = true
    }

    async run() {
        let client = this.client
        if (!client.user || !client.application) return;

        await client.application.commands.set(Commands)

        utils.log(Log.SUCCESS, `${client.user.tag} is online!`)
    }
}