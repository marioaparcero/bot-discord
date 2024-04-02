import type { Command } from '../types/command'

export class OWGCommand {
    constructor(commandOptions: Command) {
        Object.assign(this, commandOptions)
    }
}