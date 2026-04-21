/**
 * Evento messageCreate — Sistema AFK
 * @author thxmasdev
 * @description Gestiona el sistema AFK:
 *   1. Si el autor del mensaje está AFK → lo saca del AFK y muestra cuánto tiempo estuvo.
 *   2. Si el mensaje menciona a alguien que está AFK → avisa al canal con el motivo.
 */

const { Events, EmbedBuilder } = require('discord.js');

// ── Utilidades ────────────────────────────────────────────────────────────────

/**
 * Formatea una duración en ms a un string legible (ej: "2h 30m 15s").
 * @param {number} ms
 * @returns {string}
 */
function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours   = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const partes = [];
    if (hours   > 0) partes.push(`${hours}h`);
    if (minutes > 0) partes.push(`${minutes}m`);
    partes.push(`${seconds}s`);

    return partes.join(' ');
}

// ── Módulo ────────────────────────────────────────────────────────────────────

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Ignorar bots y mensajes fuera de guilds
        if (message.author.bot || !message.guild) return;

        const client   = message.client;
        const afkUsers = client.afkUsers;

        // Asegurarse de que el Map existe
        if (!afkUsers) return;

        const ahora = Date.now();

        // ── 1. El autor del mensaje estaba AFK → sacarlo ──────────────────────
        if (afkUsers.has(message.author.id)) {
            const datos = afkUsers.get(message.author.id);

            // Solo desactivar AFK si el mensaje es del mismo servidor donde se activó
            if (datos.guildId === message.guild.id) {
                afkUsers.delete(message.author.id);

                const duracion = formatDuration(ahora - datos.desde);

                // Restaurar nickname
                const member = await message.guild.members.fetch(message.author.id).catch(() => null);
                if (member && member.manageable) {
                    const nickActual = member.nickname ?? member.user.username;
                    if (nickActual.startsWith('[AFK]')) {
                        await member.setNickname(nickActual.replace(/^\[AFK\] ?/, '')).catch(() => null);
                    }
                }

                // Embed de bienvenida de vuelta
                const embedVuelta = new EmbedBuilder()
                    .setColor(0x57F287)
                    .setAuthor({
                        name: `${message.author.displayName || message.author.username} | AFK terminado`,
                        iconURL: message.author.displayAvatarURL({ dynamic: true }),
                    })
                    .setTitle('✅  ¡Bienvenido de vuelta!')
                    .setDescription(
                        `> **${message.author}** ha vuelto del AFK.\n` +
                        `> **Motivo que tenía:** ${datos.motivo}\n` +
                        `> **Tiempo AFK:** \`${duracion}\``
                    )
                    .setThumbnail(message.author.displayAvatarURL({ dynamic: true, size: 256 }))
                    .setFooter({
                        text: 'Sistema AFK • thxmasdev',
                        iconURL: client.user.displayAvatarURL(),
                    })
                    .setTimestamp();

                const msg = await message.channel.send({ embeds: [embedVuelta] });

                // Auto-borrar el aviso después de 8 segundos para no llenar el chat
                setTimeout(() => msg.delete().catch(() => null), 8_000);
            }
        }

        // ── 2. Alguien mencionó a un usuario AFK ─────────────────────────────
        if (message.mentions.users.size > 0) {
            for (const [userId, mentionedUser] of message.mentions.users) {
                // Ignorar si es el propio autor o un bot
                if (userId === message.author.id || mentionedUser.bot) continue;

                if (afkUsers.has(userId)) {
                    const datos = afkUsers.get(userId);

                    // Solo avisar si el AFK fue activado en el mismo servidor
                    if (datos.guildId !== message.guild.id) continue;

                    const tiempoAFK = formatDuration(ahora - datos.desde);

                    const embedMencion = new EmbedBuilder()
                        .setColor(0xFEE75C)
                        .setAuthor({
                            name: `${mentionedUser.displayName || mentionedUser.username} | Está en AFK`,
                            iconURL: mentionedUser.displayAvatarURL({ dynamic: true }),
                        })
                        .setTitle('💤  Este usuario está AFK')
                        .setDescription(
                            `> **Usuario:** ${mentionedUser}\n` +
                            `> **Motivo:** ${datos.motivo}\n` +
                            `> **Lleva:** \`${tiempoAFK}\` en AFK\n` +
                            `> **Desde:** <t:${Math.floor(datos.desde / 1000)}:R>`
                        )
                        .setThumbnail(mentionedUser.displayAvatarURL({ dynamic: true, size: 256 }))
                        .setFooter({
                            text: 'Sistema AFK • thxmasdev',
                            iconURL: client.user.displayAvatarURL(),
                        })
                        .setTimestamp();

                    const msg = await message.channel.send({ embeds: [embedMencion] });

                    // Auto-borrar después de 10 segundos
                    setTimeout(() => msg.delete().catch(() => null), 10_000);
                }
            }
        }
    },
};
