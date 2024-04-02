import { ActivityType, Client, type ClientOptions, Collection } from 'discord.js';
import type { Command } from '../types/command';
import type { BotActivity } from '../interfaces/botActivity';
import { Logger } from '../utils/internalLogger';
import { loadCommands, loadEvents } from '../utils/loadFunctions';

export class OWGClient extends Client {
    readonly botToken: string;
    readonly commands: Collection<string, Command> = new Collection();
    readonly subCommands: Collection<string, unknown> = new Collection();
    readonly events = new Collection();
    readonly guildId?: string;
    readonly activity?: BotActivity;

    constructor(config: { token: string, botOptions: ClientOptions, guildId?: string, activity?: BotActivity }) {
        super(config.botOptions);
        this.botToken = config.token;
        this.guildId = config.guildId;
        this.activity = config.activity;
    }

    async start() {
        this.on('ready', async () => {
            Logger.info("🤓☝️ The bot is up and ready!.", { service: 'Client Structure' })
            this.user?.setActivity({
                name: this.activity?.name ?? 'with the code',
                type: this.activity?.type ?? ActivityType.Playing
            })
        })
        Logger.info("🤖 Starting the bot...", {
            service: 'Client Structure',
        })
        await this.loadCommands();
        await this.loadEvents();
        await this.login(this.botToken);
    }

    private async loadCommands() {
        await loadCommands(this);
    }

    private async loadEvents() {
        await loadEvents(this);
    }
}