import 'dotenv/config'
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { ChannelType, Client, ColorResolvable, EmbedBuilder, Guild, GuildBasedChannel, GuildMember, GuildTextBasedChannel, PermissionFlagsBits, resolveColor, Role, TextChannel, VoiceChannel } from "discord.js";
import { Response } from "express";
import config from "./config";
import { Panel } from './server/models/panel';
import PanelManager from './managers/PanelManager';

export enum Log {
    ERROR = 'error',
    WARNING = 'warning',
    SUCCESS = 'success',
    NEUTRAL = 'neutral'
}

export enum DiscordEmbedType {
    ERROR = 'error',
    WARNING = 'warning',
    SUCCESS = 'success',
    NEUTRAL = 'neutral'
}

export enum HttpCode {
    INTERNAL_SERVER_ERROR = 502,
    NOT_FOUND = 404,
    UNAUTHORIZED = 401,
    BAD_REQUEST = 400,
    OK = 200,
}

export interface DiscordEmbedField {
    name: string
    value: string
    inline?: boolean | false
}

export interface DiscordEmbedImage {
    url: string,
}

export interface DiscordEmbedOptions {
    thumbnail?: string
    timestamp?: string
    title?: string
    image?: DiscordEmbedImage
    color?: string
    fields?: DiscordEmbedField[]
    footer?: string
}



export default {
    configValues: {
        async getTextChannel(guild: Guild, value: string): Promise<TextChannel | undefined> {
            let baseURL = process.env.API_URL
            let payload: AxiosRequestConfig = {
                method: "GET",
                baseURL,
                url: `/guilds/${guild.id}/config/${value.toLowerCase()}`,
                headers: {
                    'x-auth-token': process.env.TOKEN,
                    'Content-Type': 'application/json'
                }
            }

            let ch: TextChannel;

            try {
                let response = await axios(payload)

                let g = guild
                if (!g.available) return;
                let c = g.channels.cache.get(response.data.data.data[value])
                if (!c) return;

                ch = c as TextChannel

                return ch

            } catch (err) {
                console.log(err)
            }
        },
        async getRole(guild: Guild, value: string): Promise<Role | undefined> {
            let baseURL = process.env.API_URL
            let payload: AxiosRequestConfig = {
                method: "GET",
                baseURL,
                url: `/guilds/${guild.id}/config/${value.toLowerCase()}`,
                headers: {
                    'x-auth-token': process.env.TOKEN,
                    'Content-Type': 'application/json'
                }
            }

            let rl: Role;

            try {
                let response = await axios(payload)

                let g = guild
                if (!g.available) return;
                let r = g.roles.cache.get(response.data.data.data[value])
                if (!r) return;

                rl = r as Role

                return rl

            } catch (err) {
                console.log(err)
            }
        }
    },

    apiResponse(status: HttpCode, res: Response, payload?: Object): Response {
        let codes = {
            '502': 'Internal Server Error',
            '404': 'Not Found',
            '401': 'Unauthorized',
            '400': 'Bad Request',
            '200': 'OK'
        }

        if (!payload) return res.status(status).send({ successful: status === HttpCode.OK ? true : false, data: { message: codes[status], data: null } });


        return res.status(status).send({ successful: status === HttpCode.OK ? true : false, data: { message: codes[status], data: payload } });

    },

    log(type: Log, message: any): void {
        let prefixes = {
            'error': '⛔',
            'warning': '⚠️',
            'success': '✅',
            'neutral': '✔️',
        }
        console.log(prefixes[type], message)
    },

    embed(type: DiscordEmbedType, description?: string, options?: DiscordEmbedOptions): Object {


        let builder: any = {
            title: config.branding.embed.titles[type],
            description,
            color: resolveColor(config.branding.embed.colors[type] as ColorResolvable)
        }

        if (options?.thumbnail) builder.thumbnail = { url: options.thumbnail }
        if (options?.footer) builder.footer = { text: options.thumbnail }
        if (options?.timestamp) builder.timestamp = options.timestamp
        if (options?.title) builder.title = options.title
        if (options?.fields) builder.fields = options.fields
        if (options?.image) builder.image = options.image
        if (options?.color) builder.color = resolveColor(options.color as ColorResolvable)

        return EmbedBuilder.from(builder);
    },

    formatMessage(message: string, member: GuildMember | any, guild: Guild | any, client: Client | any): string {
        let msg: string = message

        let placeholders: any = {
            'g': guild,
            'u': member,
            'c': client,
            'cu': client.user
        }

        let matches = message.match(/\%\w+\_\w+/gim)
        if (!matches) return message;

        matches?.forEach(match => {
            let entryValue: string = match.split("_")[1]
            let entryKey: string = match.split("_")[0].split('%')[1]
            let regex = new RegExp(match, "gim")


            msg = msg.replace(regex, `${placeholders[entryKey][entryValue]}`)

        })

        return msg;

    },

    getSystemChannel(guild: Guild, client: Client): TextChannel | undefined {
        // return guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText).last();
        return guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText && channel.permissionsFor(guild.members.cache.find(m => m.id === client.user?.id) as GuildMember).has(PermissionFlagsBits.SendMessages)).first() as TextChannel
    },

    patchPanelMessages(guild: Guild, client: Client): void {
        let payload: AxiosRequestConfig = {
            method: "GET",
            baseURL: process.env.API_URL,
            url: `/guilds/${guild.id}/panels`,
            headers: {
                'x-auth-token': process.env.TOKEN,
            }
        }

        axios(payload).then(response => {
            let data: Panel[] = response.data.data.data
            if (!data || data.length <= 0) console.log(`Guild ${guild.id} has no panels. Tried to patch but couldn't.`)

            data.forEach(async (panel: Panel) => {
                if (!panel.embedMessage) {
                    let pm = new PanelManager(client, guild, panel)
                    await pm.sendEmbed()
                }
                if (panel.embedMessage) return
            })


        }).catch(err => {
            console.log(`Guild ${guild.id} has no panels. Tried to patch but couldn't.`)
        })
    }
}