import 'dotenv/config'
import { Client, Guild, GuildMember, GuildTextBasedChannel, TextChannel } from 'discord.js';
import utils, { DiscordEmbedType, Log } from '../utils';
import { Commands } from '../commands';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import config from '../config';


export default class GuildCreate {
    client: Client
    enabled: Boolean

    constructor(client: Client) {
        this.client = client
        this.enabled = true
    }

    async run(guild: Guild) {
        let baseURL = process.env.API_URL
        let client = this.client
        if (!client.user || !client.application) return;

        let payload: AxiosRequestConfig = {
            method: 'POST',
            baseURL,
            url: '/guilds/create',
            data: JSON.stringify({
                id: guild.id
            }),
            headers: {
                'x-auth-token': process.env.TOKEN,
                'Content-Type': 'application/json'
            }
        }

        axios(payload).then(async (response: AxiosResponse) => {
            let guildOwner: GuildMember = await guild.fetchOwner({ force: true })

            let systemChannel: TextChannel | undefined = guild.systemChannel ? guild.systemChannel : await utils.getSystemChannel(guild, client)

            if (!systemChannel) return;

            systemChannel?.send({ content: utils.formatMessage(config.messages.welcome_embed_content, guildOwner, guild, client), embeds: [utils.embed(DiscordEmbedType.SUCCESS, utils.formatMessage(config.messages.welcome_embed_description, guildOwner, guild, client))] })

        }).catch(err => {
            console.log(err.response.data)
        })
    }
}