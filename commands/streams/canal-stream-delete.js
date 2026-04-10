/**
 * @author thxmasdev
 */
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { Streamer } = require('../../database/models');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('canal-stream-delete')
        .setDescription('Elimina un streamer de la lista de notificaciones.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(opt =>
            opt.setName('username')
                .setDescription('Nombre de usuario del streamer a eliminar')
                .setRequired(true))
        .addStringOption(opt =>
            opt.setName('plataforma')
                .setDescription('Plataforma donde está registrado el streamer')
                .setRequired(true)
                .addChoices(
                    { name: '🟣 Twitch', value: 'twitch' },
                    { name: '🟢 Kick', value: 'kick' },
                )),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const username = interaction.options.getString('username').trim().toLowerCase();
        const platform = interaction.options.getString('plataforma');
        const guildId = interaction.guildId;

        const streamer = await Streamer.findOneAndDelete({ guildId, username, platform });

        if (!streamer) {
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xFFAA00)
                        .setTitle('⚠️ No encontrado')
                        .setDescription(`No se encontró el streamer **${username}** en **${platform}** en la lista de este servidor.`)
                        .setFooter({ text: 'Usa /canal-stream-list para ver los streamers registrados.' }),
                ],
            });
        }

        const platformEmoji = platform === 'twitch' ? '🟣' : '🟢';

        return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(0xFF4444)
                    .setTitle(`${platformEmoji} Streamer eliminado`)
                    .setDescription(`Se ha dejado de monitorear a **${streamer.displayName || username}** en **${platform.charAt(0).toUpperCase() + platform.slice(1)}**.`)
                    .addFields(
                        { name: '👤 Usuario', value: streamer.displayName || username, inline: true },
                        { name: '🌐 Plataforma', value: platform.charAt(0).toUpperCase() + platform.slice(1), inline: true },
                    )
                    .setFooter({ text: `Eliminado por ${interaction.user.tag}` })
                    .setTimestamp(),
            ],
        });
    },
};
