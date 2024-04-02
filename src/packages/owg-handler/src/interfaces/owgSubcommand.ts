import type {
    CommandInteraction,
    CommandInteractionOptionResolver,
} from 'discord.js'
import type { OWGClient } from '../structures/client-structure'

export interface OWGSubCommand {
    subCommand: string
    run: ({
        client,
        interaction,
        args,
    }: {
        client: OWGClient
        interaction: CommandInteraction
        args?: CommandInteractionOptionResolver
    }) => Promise<void>
}