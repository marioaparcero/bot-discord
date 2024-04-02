import type { ActivityType } from 'discord.js'

export interface BotActivity {
    type:
    | ActivityType.Playing
    | ActivityType.Streaming
    | ActivityType.Listening
    | ActivityType.Watching
    | ActivityType.Competing
    | undefined
    name: string
}