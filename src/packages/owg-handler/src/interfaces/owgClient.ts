import type { Collection } from 'discord.js'
import type { BotActivity } from './botActivity'
import type { Command } from '../types/command'

export interface OWGClient {
    botToken: string
    commands: Collection<string, Command>
    subCommands: Collection<string, unknown>
    events: Collection<string, unknown>
    guildId?: string
    dbEngine?: string
    activity?: BotActivity
}