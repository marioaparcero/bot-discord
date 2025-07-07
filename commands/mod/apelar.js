const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const settings = require('../../settings.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('apelar')
        .setDescription('Envía una apelación al staff del servidor'),
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('apelarModal')
            .setTitle('Formulario de Apelación');

        const motivoInput = new TextInputBuilder()
            .setCustomId('motivo')
            .setLabel('¿Por qué te silenciaron/banearon?')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const razonInput = new TextInputBuilder()
            .setCustomId('razon')
            .setLabel('¿Por qué debe aceptarse tu apelación?')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const extraInput = new TextInputBuilder()
            .setCustomId('extra')
            .setLabel('¿Hay algo más que le gustaría que sepamos?')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(motivoInput),
            new ActionRowBuilder().addComponents(razonInput),
            new ActionRowBuilder().addComponents(extraInput)
        );

        await interaction.showModal(modal);
    },
};