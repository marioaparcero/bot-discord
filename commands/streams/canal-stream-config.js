/**
 * @author thxmasdev
 */
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { GuildConfig } = require('../../database/models');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('canal-stream-config')
        .setDescription('Configura las opciones de notificaciones de streams.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(sub =>
            sub.setName('mensaje')
                .setDescription('Personaliza el mensaje de notificación. Usa $link y $user como variables.')
                .addStringOption(opt =>
                    opt.setName('texto')
                        .setDescription('Ej: 🚨 $user está en directo! Míralo aquí: $link  |  Vacío = restablecer')
                        .setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('ver')
                .setDescription('Muestra la configuración actual del servidor.')),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const sub = interaction.options.getSubcommand();
        const guildId = interaction.guildId;

        // ── SUBCOMANDO: mensaje ──────────────────────────────────────────────
        if (sub === 'mensaje') {
            const texto = interaction.options.getString('texto') || null;

            await GuildConfig.findOneAndUpdate(
                { guildId },
                { customMessage: texto, updatedAt: new Date() },
                { upsert: true, new: true },
            );

            const preview = texto
                ? texto
                    .replace(/\$link/g, 'https://twitch.tv/ejemplo')
                    .replace(/\$user/g, '@EjemploUser')
                : null;

            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(texto ? 0x00FF88 : 0xFFAA00)
                        .setTitle(texto ? '✅ Mensaje personalizado configurado' : '🔄 Mensaje restablecido')
                        .setDescription(
                            texto
                                ? `**Plantilla guardada:**\n\`\`\`\n${texto}\n\`\`\`\n**Preview:**\n${preview}`
                                : 'Se usará el mensaje por defecto:\n```\n🚨ATENCIÓN🚨 @User está en directo: https://twitch.tv/username\n```',
                        )
                        .addFields(
                            { name: '🔧 Variables disponibles', value: '`$link` → URL del stream\n`$user` → Mención de Discord del streamer (si está vinculado)', inline: false },
                        )
                        .setFooter({ text: 'Usa /canal-stream-config ver para ver la configuración completa' })
                        .setTimestamp(),
                ],
            });
        }

        // ── SUBCOMANDO: ver ──────────────────────────────────────────────────
        if (sub === 'ver') {
            const config = await GuildConfig.findOne({ guildId });

            const notificationChannel = config?.notificationChannelId
                ? `<#${config.notificationChannelId}>`
                : '❌ No configurado — usa `/canal-stream-id`';

            const customMsg = config?.customMessage
                ? `\`\`\`\n${config.customMessage}\n\`\`\``
                : '*Mensaje por defecto* (`🚨ATENCIÓN🚨 @User está en directo: $link`)';

            const preview = config?.customMessage
                ? config.customMessage
                    .replace(/\$link/g, 'https://twitch.tv/ejemplo')
                    .replace(/\$user/g, '@EjemploUser')
                : null;

            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle('⚙️ Configuración de Stream Notifier')
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .addFields(
                    { name: '📢 Canal de notificaciones', value: notificationChannel, inline: false },
                    { name: '💬 Plantilla de mensaje', value: customMsg, inline: false },
                );

            if (preview) {
                embed.addFields({ name: '👁️ Preview del mensaje', value: preview, inline: false });
            }

            embed
                .addFields({ name: '🔧 Variables disponibles', value: '`$link` → URL del stream\n`$user` → Mención de Discord del streamer', inline: false })
                .setFooter({ text: 'Usa /canal-stream-config mensaje para personalizar' })
                .setTimestamp();

            return interaction.editReply({ embeds: [embed] });
        }
    },
};
