import type { ClientEvents } from 'discord.js'

export class OWGEvent<Key extends keyof ClientEvents> {
    constructor(
        public event: Key,
        public run: (...args: ClientEvents[Key]) => unknown
    ) { }

    public get eventName(): string {
        return this.event
    }

    public get listener(): (...args: ClientEvents[Key]) => unknown {
        return this.run
    }
}