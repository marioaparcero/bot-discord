const { Events, EmbedBuilder } = require('discord.js');
const settings = require('../settings.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isModalSubmit()) return;
        if (interaction.customId !== 'apelarModal') return;

        const motivo = interaction.fields.getTextInputValue('motivo');
        const razon = interaction.fields.getTextInputValue('razon');
        const extra = interaction.fields.getTextInputValue('extra') || 'N/A';

        const canalModeracionId = settings.canalApelaciones;

        const embed = new EmbedBuilder()
            .setTitle('Nueva apelación :scales:')
            .setDescription(
                `👤 **Usuario**: <@${interaction.user.id}>\n` +
                `1. **¿Por qué te silenciaron/banearon?**:\n${motivo}\n\n` +
                `2. **¿Por qué cree que su apelación debe ser aceptada?**:\n${razon}\n\n` +
                `3. **¿Algo más?**:\n${extra}`
            )
            .setColor(0x00AE86)
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            })
            .setFooter({
                text: `User ID: ${interaction.user.id}`
            })
            .setTimestamp();

        try {
            const canal = await interaction.client.channels.fetch(canalModeracionId);
            const mensaje = await canal.send({ embeds: [embed] });
            await mensaje.react('✅');
            await mensaje.react('❌');
            await mensaje.react('❔');
        } catch (e) {
            console.error(e);
        }

        await interaction.reply({ content: 'Tu apelación ha sido enviada al staff. ¡Gracias!', ephemeral: true });
    },
};