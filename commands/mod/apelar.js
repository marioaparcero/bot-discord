const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const settings = require('../../settings.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('apelar')
        .setDescription('Envía una apelación al staff del servidor')
        .addStringOption(option =>
            option.setName('motivo')
            .setDescription('Explica el motivo de tu apelación')
            .setRequired(true)),
    async execute(interaction) {
        const motivo = interaction.options.getString('motivo');
        const canalModeracionId = settings.canalApelaciones;

        const embed = new EmbedBuilder()
            .setTitle('Nueva apelación')
            .setDescription(`- __**Usuario**__: <@${interaction.user.id}>\n- __**Motivo**__: ${motivo}`)
            .setColor(0x00AE86)
            // .addFields({ name: 'Usuario', value: `<@${interaction.user.id}>`, inline: true })
            // { name: 'ID', value: interaction.user.id, inline: true })
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            })
            .setFooter({
                text: `User ID: ${interaction.user.id}`
            })
            .setTimestamp();

        // Envía el embed al canal privado de moderación
        const canal = await interaction.client.channels.fetch(canalModeracionId);
        const mensaje = await canal.send({ embeds: [embed] });

        // Agrega las reacciones
        await mensaje.react('✅');
        await mensaje.react('❌');
        await mensaje.react('❔');

        // Confirma al usuario
        await interaction.reply({ content: 'Tu apelación ha sido enviada al staff. ¡Gracias!', ephemeral: true });
    },
};