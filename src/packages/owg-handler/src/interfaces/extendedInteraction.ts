import type { CommandInteraction, GuildMember } from 'discord.js'

export interface ExtendedInteraction extends CommandInteraction {
    member: GuildMember
}