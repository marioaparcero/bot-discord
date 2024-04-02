import type { Event } from '../interfaces/events'
import type { OWGClient } from '../structures/client-structure'
import { registerCommands } from './registerCommands'
import { registerEvent } from './registerEvents'
import { loadFiles, loadInternalFiles } from './loadFiles'
import { Logger } from './internalLogger'
import { LoggerServices } from './enums/loggerServices'

export async function loadEvents(client: OWGClient) {
    await client.events.clear()
    Logger.info('🎭 Loading events...', { service: LoggerServices.Events })
    const eventFiles = await loadFiles('events')
    if (eventFiles.length < 1) {
        Logger.info(
            "🎭 Didn't found any defined events, charging the internal ones...",
            { service: LoggerServices.Events }
        )
        const internalEvents = await loadInternalFiles('events')

        for (const file of internalEvents) {
            const event: Event = require(file)

            const run = (...args: unknown[]) => event.run(...args, client)

            client.events.set(event.event, event.run)

            registerEvent(client, event, run)
        }
        Logger.info(`🎭 Loaded ${internalEvents.length} events!`, {
            service: LoggerServices.Events,
        })
    } else {
        for (const file of eventFiles) {
            const event: Event = require(file)

            const run = (...args: unknown[]) => event.run(...args, client)

            client.events.set(event.event, event.run)

            registerEvent(client, event, run)
        }
        Logger.info(`🎭 Loaded ${eventFiles.length} events!`, {
            service: LoggerServices.Events,
        })
    }
}

export async function loadCommands(client: OWGClient) {
    Logger.info('📦 Loading commands...', { service: LoggerServices.Commands })
    await client.commands.clear()
    await client.subCommands.clear()

    const slashCommands: unknown[] = []
    const commandFiles = await loadFiles('commands')

    for (const file of commandFiles) {
        const command = require(file)

        if (command.subCommand) {
            client.subCommands.set(command.subCommand, command)
            continue
        }

        if (!command.name) {
            continue
        }

        client.commands.set(command.name, command)
        slashCommands.push(command)
    }
    Logger.info(`📦 Loaded ${commandFiles.length} commands!`, {
        service: LoggerServices.Commands,
    })

    await registerCommands(client, slashCommands)
}