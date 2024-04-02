import type {
    ApplicationCommandOption,
    CommandInteraction,
    CommandInteractionOptionResolver,
    PermissionResolvable,
} from 'discord.js'
import type { OWGClient } from '../structures/client-structure'

export interface OWGCommand {
    name: string
    description: string
    permissions?: PermissionResolvable[]
    defaultMemberPermissions?: PermissionResolvable[]
    options?: ApplicationCommandOption[]
    cooldown?: number
    developer?: boolean
    run?: ({
        client,
        interaction,
        args,
    }: {
        client: OWGClient
        interaction: CommandInteraction
        args?: CommandInteractionOptionResolver
    }) => Promise<void>
}