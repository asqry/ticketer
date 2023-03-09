import { ActionRow, ActionRowBuilder, APIEmoji, APIMessageComponentEmoji, ButtonBuilder, ButtonComponent, ButtonStyle, Client, Guild, GuildBasedChannel, Message, TextChannel } from "discord.js"
import utils, { DiscordEmbedType, Log } from "../utils"
import { ApiTicket, Panel, Ticket } from "../server/models/panel"
import axios, { AxiosRequestConfig } from "axios"

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

    async setMessageId(message: Message): Promise<void> {
        let payload: AxiosRequestConfig = {
            method: "PATCH",
            baseURL: process.env.API_URL,
            url: `/guilds/${this.guild.id}/panels/${this.panel.id}`,
            data: JSON.stringify({ embedMessage: message.id }),
            headers: {
                'x-auth-token': process.env.TOKEN,
            }
        }

        axios(payload).then(response => {
            console.log(response)
        }).catch(err => {
            utils.log(Log.ERROR, err)
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

    async findOldMessage(channel: TextChannel): Promise<Message | null> {
        if (!this.messageId) return null;
        let message: Message | undefined = await channel.messages.fetch(this.messageId)
        if (!message) return null

        return message
    }

    async sendEmbed(): Promise<void> {
        let channel: GuildBasedChannel | null = this.channel()
        if (!channel) return utils.log(Log.ERROR, "Couldn't find the panel channel")
        let oldMessage = await this.findOldMessage(channel as TextChannel)

        let embed = [utils.embed(DiscordEmbedType.NEUTRAL, `*Click a button below to open a ticket*\n_**${this.tickets.length}** available ticket types_`, { title: this.name, color: this.color, image: { url: this.imageUrl ? this.imageUrl : "" } })]


        let row = new ActionRowBuilder<ButtonBuilder>().addComponents(this.buildButtons())

        let emb: any = { embeds: embed };
        if (this.buildButtons().length > 0) emb.components = [row];

        if (!oldMessage) (channel as TextChannel).send(emb).then(async (m: Message) => await this.setMessageId(m))

        if (oldMessage && oldMessage?.deletable && oldMessage.embeds !== emb.embeds || oldMessage?.components && oldMessage.components !== emb.components) {
            oldMessage.delete().then(() => {
                (channel as TextChannel).send(emb).then(async (m: Message) => await this.setMessageId(m))
            }).catch(err => {
                // utils.log(Log.ERROR, err)
            })
        }

    }


}