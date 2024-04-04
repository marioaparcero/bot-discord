const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Limpia el chat de un canal de texto.')
        .addIntegerOption(option =>
            option.setName('cantidad')
                .setDescription('Número de mensajes a eliminar.')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(
            ([PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ManageChannels]).bitfield
        ),
    async execute(interaction) {
        const cantidad = interaction.options.getInteger('cantidad');

        try {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages) || !interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
                return interaction.reply('No tienes permiso para usar este comando.');
            }
            if (cantidad) {
                if (cantidad < 1 || cantidad > 100) {
                    return interaction.reply('Debes introducir un número entre 1 y 100.');
                }
                await interaction.channel.bulkDelete(cantidad);
                await interaction.reply(`Se han eliminado ${cantidad} mensajes.`);
            } else {
                // If no amount is provided, delete all messages
                const fetched = await interaction.channel.messages.fetch({ limit: 100 });
                await interaction.channel.bulkDelete(fetched);
                await interaction.reply('Se han eliminado todos los mensajes.');
            }
        } catch (error) {
            if (error.code === 50034) {
                return await interaction.reply('Hay mensajes más antiguos a 14 días.');
            }
            console.error(error);
            await interaction.reply('No se pudo eliminar los mensajes.');
        }
    }
}