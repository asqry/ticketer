import 'dotenv/config'
import { Client, Guild, GuildMember, User } from 'discord.js';
import utils, { DiscordEmbedType, Log } from '../utils';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import config from '../config';


export default class GuildDelete {
    client: Client
    enabled: Boolean

    constructor(client: Client) {
        this.client = client
        this.enabled = true
    }

    async run(guild: Guild) {
        let baseURL = process.env.API_URL + '/guilds'
        let client = this.client
        if (!client.user || !client.application) return;

        let payload: AxiosRequestConfig = {
            method: 'DELETE',
            baseURL,
            url: '/delete/' + guild.id,
            headers: {
                'x-auth-token': process.env.TOKEN,
            }
        }

        axios(payload).then(async (response: AxiosResponse) => {

            const guildOwner: User | undefined = client.users.cache.get(guild.ownerId)
            if (!guildOwner) return;

            guildOwner.send({ embeds: [utils.embed(DiscordEmbedType.SUCCESS, utils.formatMessage(config.messages.goodbye_embed_description, guildOwner, guild, client), { title: utils.formatMessage(config.messages.goodbye_embed_content, guildOwner, guild, client) })] }).catch(err => {
                utils.log(Log.WARNING, "Couldn't message the Guild Owner.")
            })
        }).catch(err => {
            utils.log(Log.NEUTRAL, err)
        })
    }
}