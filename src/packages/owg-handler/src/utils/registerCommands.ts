import type { OWGClient } from '../structures/client-structure'
import { LoggerServices } from './enums/loggerServices'
import { Logger } from './internalLogger'
import type { ApplicationCommandData } from 'discord.js'

export async function registerCommands(
    client: OWGClient,
    slashCommands: unknown[]
) {
    Logger.info('📦 Registering commands...', {
        service: LoggerServices.Commands,
    })
    if (client.application) {
        try {
            await client.application.commands.set(slashCommands as ApplicationCommandData[])
            Logger.info('📦 Registered commands!', {
                service: LoggerServices.Commands,
            })
        } catch (err) {
            Logger.error('❌ Error registering commands.', {
                service: LoggerServices.Commands,
            })
        }
    }
}