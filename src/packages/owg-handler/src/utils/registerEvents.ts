import type { Event } from '../interfaces/events'
import type { OWGClient } from '../structures/client-structure'
import { LoggerServices } from './enums/loggerServices'
import { Logger } from './internalLogger'
import type { RestEvents } from 'discord.js'

export function registerEvent(
    client: OWGClient,
    event: Event,
    run: (...args: unknown[]) => void
) {
    Logger.info("🎭 Registering events...", { service: LoggerServices.Events })
    if (event.rest) {
        const handler = event.once ? client.rest.once : client.rest.on
        handler.call(client.rest, event.event as keyof RestEvents, run)
    } else {
        const handler = event.once ? client.once : client.on
        handler.call(client, event.event, run)
    }
    Logger.info("🎭 Registered events!", { service: LoggerServices.Events })
}