import { OWGClient } from '@owg/handler';
import 'dotenv/config';
import { ActivityType, Partials } from 'discord.js';


export const client = new OWGClient({
    token: process.env.BOT_TOKEN ?? '',
    botOptions: {
        intents: [3276799],
        partials: [
            Partials.Channel,
            Partials.GuildMember,
            Partials.GuildScheduledEvent,
            Partials.Message,
            Partials.Reaction,
            Partials.User,
            Partials.ThreadMember,
        ],
    },
    guildId: process.env.GUILD_ID ?? '',
    activity: {
        name: 'with yo\' momma',
        type: ActivityType.Playing
    }
})
client.start();