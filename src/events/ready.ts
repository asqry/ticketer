import { Client, Collection, Guild, GuildResolvable, Role, TextChannel } from 'discord.js';
import utils, { Log } from '../utils';
import { Commands } from '../commands';


export default class Ready {
    client: Client
    enabled: Boolean

    constructor(client: Client) {
        this.client = client
        this.enabled = true
    }

    // async msgCheck(client: Client): Promise<void> {

    //     let guilds: Collection<string, Guild> | undefined = client.guilds.cache
    //     if (!guilds) return;

    //     guilds.forEach(async (guild: Guild) => {
    //         utils.patchPanelMessages(guild, client)
    //     })
    // }

    async run() {
        let client: Client = this.client
        if (!client.user || !client.application) return;

        await client.application.commands.set(Commands)


        utils.log(Log.SUCCESS, `${client.user.tag} is online, running in ${client.guilds.cache.size} server${client.guilds.cache.size == 1 ? '' : 's'}!`)

        // setInterval(async () => (await this.msgCheck(client)), 10000)
    }
}