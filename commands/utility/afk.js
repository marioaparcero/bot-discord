/**
 * Comando /afk
 * @author thxmasdev
 * @description Permite a un usuario activar el modo AFK con un motivo opcional.
 *              El AFK se desactiva automáticamente cuando el usuario envía un mensaje.
 *              Solo los miembros con el rol definido en config.afkRoleId pueden usarlo.
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { afkRoleId } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Activa el modo AFK. Se desactivará cuando envíes un mensaje.')
        .addStringOption(option =>
            option
                .setName('motivo')
                .setDescription('¿Por qué te vas AFK? (opcional)')
                .setRequired(false)
                .setMaxLength(200)
        ),

    async execute(interaction) {
        // ── Verificación de rol ───────────────────────────────────────────────
        const member = interaction.member;
        if (!member.roles.cache.has(afkRoleId)) {
            const embedDenegado = new EmbedBuilder()
                .setColor(0xED4245)
                .setAuthor({
                    name: `${interaction.user.displayName || interaction.user.username} | Sin permisos`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
                })
                .setTitle('🚫  No puedes usar este comando')
                .setDescription(
                    `> No tienes el rol necesario para activar el modo AFK.\n` +
                    `> Habla con un administrador si crees que es un error.`
                )
                .setFooter({
                    text: 'Sistema AFK • thxmasdev',
                    iconURL: interaction.client.user.displayAvatarURL(),
                })
                .setTimestamp();

            return interaction.reply({ embeds: [embedDenegado], ephemeral: true });
        }

        const motivo = interaction.options.getString('motivo') ?? '`Sin motivo especificado`';
        const usuario = interaction.user;
        const ahora = Date.now();

        // Guardar en el Map del cliente
        if (!interaction.client.afkUsers) {
            interaction.client.afkUsers = new Map();
        }

        interaction.client.afkUsers.set(usuario.id, {
            motivo,
            desde: ahora,
            guildId: interaction.guildId,
            username: usuario.username,
        });

        // ── Embed de confirmación AFK ──────────────────────────────────────────
        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setAuthor({
                name: `${usuario.displayName} | Modo AFK activado`,
                iconURL: usuario.displayAvatarURL({ dynamic: true }),
            })
            .setTitle('🌙  Entraste en modo AFK')
            .setDescription(
                `> **Motivo:** ${motivo}\n` +
                `> **Desde:** <t:${Math.floor(ahora / 1000)}:R>\n\n` +
                `Cuando envíes un mensaje en cualquier canal, tu AFK se desactivará automáticamente.`
            )
            .setThumbnail(usuario.displayAvatarURL({ dynamic: true, size: 256 }))
            .setFooter({
                text: 'Sistema AFK • thxmasdev',
                iconURL: interaction.client.user.displayAvatarURL(),
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        // Intentar editar el nick del usuario para mostrar [AFK]
        if (interaction.guild) {
            const afkMember = await interaction.guild.members.fetch(usuario.id).catch(() => null);
            const member = afkMember;
            if (member && member.manageable) {
                const currentNick = member.nickname ?? member.user.username;
                if (!currentNick.startsWith('[AFK]')) {
                    await member.setNickname(`[AFK] ${currentNick}`.slice(0, 32)).catch(() => null);
                }
            }
        }
    },
};
