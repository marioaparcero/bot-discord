import type { CommandInteractionOptionResolver } from 'discord.js'
import type { ExtendedInteraction } from './extendedInteraction'
import type { OWGClient } from './owgClient'

export interface RunOptions {
    client: OWGClient;
    interaction: ExtendedInteraction
    args: CommandInteractionOptionResolver
}