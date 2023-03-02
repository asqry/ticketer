import { Client, Guild, GuildMember, Message, MessageType } from 'discord.js';
import config from '../config';
import utils, { DiscordEmbedType } from '../utils';


export default class MessageCreate {
    client: Client
    enabled: Boolean

    constructor(client: Client) {
        this.client = client
        this.enabled = true;
    }

    async run(message: Message) {
        let client = this.client
        // if (!client.user || !client.application) return;
        if (message.author.bot) return;

    }
}