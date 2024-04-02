import type {
    CommandInteractionOptionResolver,
    ChatInputCommandInteraction,
    StringSelectMenuInteraction,
} from 'discord.js'
import type { ExtendedInteraction } from '../interfaces/extendedInteraction'
import type { Event } from '../interfaces/events'
import type { OWGClient } from '../interfaces/owgClient'
import type { Command } from '../types/command'

const interactionCreate: Event = {
    event: 'interactionCreate',
    once: false,
    run: async (
        ...args: unknown[]
    ) => {
        const interaction = args[0] as ChatInputCommandInteraction | StringSelectMenuInteraction;
        const client = args[1] as OWGClient;
        if (interaction.isChatInputCommand()) {
            if (interaction.isCommand()) {
                const command = client.commands.get(interaction.commandName)
                if (!command) {
                    return interaction.reply("This command was not found.")
                }
                if (command.developer && interaction.user.id !== '372840998918684672') {
                    return interaction.reply({
                        content: "This command is only for the developer.",
                        ephemeral: true,
                    })
                }

                const isSubcommand = interaction.options.getSubcommand(false)
                if (isSubcommand && command.options) {
                    const subcommandFile = client.subCommands.get(
                        `${interaction.command?.name}.${isSubcommand}`
                    ) as Command
                    if (!subcommandFile) {
                        return interaction.reply("This subcommand was not found.")
                    }
                    subcommandFile.run({
                        args: interaction.options as CommandInteractionOptionResolver,
                        client,
                        interaction: interaction as ExtendedInteraction,
                    })
                } else {
                    command.run({
                        args: interaction.options as CommandInteractionOptionResolver,
                        client,
                        interaction: interaction as ExtendedInteraction,
                    })
                }
            }
        }
    },
}

module.exports = interactionCreate