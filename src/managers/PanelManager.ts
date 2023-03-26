import 'dotenv/config'
import { ActionRow, ActionRowBuilder, APIEmoji, APIMessageComponentEmoji, ButtonBuilder, ButtonComponent, ButtonStyle, Client, Guild, GuildBasedChannel, Message, TextChannel } from "discord.js"
import utils, { DiscordEmbedType, Log } from "../utils"
import { ApiTicket, Panel, Ticket } from "../server/models/panel"
import axios, { AxiosRequestConfig } from "axios"


enum MakePayloadMethod {
    GET = "GET",
    POST = "POST",
    PATCH = "PATCH"
}

export default class PanelManager {
    client: Client
    guild: Guild
    panel: Panel

    constructor(client: Client, guild: Guild, panel: Panel) {
        this.client = client
        this.guild = guild
        this.panel = panel
    }

    channel(): GuildBasedChannel | null {
        let channel = this.guild.channels.cache.get(this.panel.embedChannel)
        if (!channel) return null;
        return channel;
    }

    get name(): string {
        return this.panel.name
    }

    get color(): string {
        return this.panel.color
    }

    get imageUrl(): string | undefined {
        return this.panel.image
    }

    get tickets(): ApiTicket[] {
        return this.panel.ticketTypes
    }

    get messageId(): string | null {
        return this.panel.embedMessage
    }


    makePayload(method: MakePayloadMethod, endpoint: string, data?: Object): AxiosRequestConfig {
        let baseURL = process.env.API_URL
        return {
            method,
            baseURL,
            url: `/guilds/${this.panel.guildId}${endpoint}`,
            headers: {
                'x-auth-token': process.env.TOKEN,
                'Content-Type': 'application/json',
                'x-anonymous': 1
            },
            data: JSON.stringify(data)
        }
    }

    async setMessageId(message: Message): Promise<void> {
        axios(this.makePayload(MakePayloadMethod.PATCH, `/panels/${this.panel.id}`, { embedMessage: message.id })).then(response => {
            console.log(response)
        }).catch(err => {
            utils.log(Log.ERROR, err.response.data)
        })
    }

    buildButtons(): ButtonBuilder[] {
        let t: ButtonBuilder[] = []
        this.tickets.forEach((ticket: ApiTicket) => {
            let bb = new ButtonBuilder()
            bb.setStyle(ButtonStyle.Secondary).setCustomId(`open-${this.panel.id}-${ticket.type}-${ticket.name}`).setEmoji(ticket.emoji).setLabel(ticket.name)

            t.push(bb)
        })

        return t;
    }

    // async findOldMessage(channel: TextChannel): Promise<Message | null> {
    //     if (!this.messageId) return null;
    //     channel.messages.fetch()
    //     let message: Message | undefined = await channel.messages.fetch(this.messageId)
    //     if (!message) return null;

    //     return message
    // }

    async sendEmbed(): Promise<void> {
        let channel: GuildBasedChannel | null = this.channel()
        if (!channel) return utils.log(Log.ERROR, "Couldn't find the panel channel")
        let embed = [utils.embed(DiscordEmbedType.NEUTRAL, `*Click a button below to open a ticket*\n_**${this.tickets.length}** available ticket types_`, { title: this.name, color: this.color, image: { url: this.imageUrl ? this.imageUrl : "" } })]
        let row = new ActionRowBuilder<ButtonBuilder>().addComponents(this.buildButtons())

        let emb: any = { embeds: embed };
        if (this.buildButtons().length > 0) emb.components = [row];

        if (!this.messageId) return;
        (channel as TextChannel).messages.fetch(this.messageId).then((oldMessage: Message) => {
            if (!oldMessage) {
                (channel as TextChannel).send(emb).then(async (m: Message) => await this.setMessageId(m))

                return
            }

            oldMessage.delete().then(() => {
                (channel as TextChannel).send(emb).then(async (m: Message) => await this.setMessageId(m))
            }).catch(err => {
                utils.log(Log.ERROR, err)
            })

        }).catch(err => {
            console.log("no old message");
            (channel as TextChannel).send(emb).then(async (m: Message) => await this.setMessageId(m))

            return;
        })




    }


}