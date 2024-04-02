import type {
    ChatInputApplicationCommandData,
    PermissionResolvable,
} from 'discord.js'
import type { RunFunction } from './runFunction'

export type Command = {
    permissions?: PermissionResolvable[]
    cooldown?: number
    run: RunFunction
    developer: boolean
} & ChatInputApplicationCommandData