/**
 * @author thxmasdev
 * @description Embed del reproductor con diseño premium y barra de progreso.
 */

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// ─── Paleta de colores ────────────────────────────────────────────────────────
const COLOR = {
    playing : 0x5865F2, // Blurple
    paused  : 0xFEE75C, // Amarillo
    error   : 0xED4245, // Rojo
    success : 0x57F287, // Verde
    info    : 0x5865F2,
};

/**
 * Construye el embed del reproductor con botones de control.
 * @param {import('lavalink-client').Player} player
 * @returns {{ embeds: EmbedBuilder[], components: ActionRowBuilder[] } | null}
 */
function buildPlayerEmbed(player) {
    const track = player.queue?.current;
    if (!track) return null;

    const isPaused   = player.paused;
    const repeatMode = player.repeatMode ?? 'off'; // 'off' | 'track' | 'queue'
    const position   = player.position ?? 0;

    // ── Duración & progreso ───────────────────────────────────────────────────
    const isStream = track.info.isStream;
    const durMs    = track.info.duration;
    const durFmt   = isStream ? '🔴 EN VIVO' : fmt(durMs);
    const posFmt   = isStream ? '🔴 EN VIVO' : fmt(position);
    const progressBar = isStream
        ? '`' + '▬'.repeat(17) + ' 🔴 LIVE`'
        : `\`${buildBar(position, durMs)}\``;

    // ── Thumbnail ─────────────────────────────────────────────────────────────
    const thumbnail =
        track.info.artworkUrl ||
        (track.info.identifier
            ? `https://img.youtube.com/vi/${track.info.identifier}/hqdefault.jpg`
            : null);

    // ── Repeat icon ───────────────────────────────────────────────────────────
    const repeatIcon  = { off: '➡️', track: '🔂', queue: '🔁' }[repeatMode];
    const repeatLabel = { off: 'Desactivada', track: 'Canción', queue: 'Cola' }[repeatMode];

    // ── Título truncado ───────────────────────────────────────────────────────
    const titleRaw = track.info.title ?? 'Sin título';
    const title    = titleRaw.length > 60 ? titleRaw.slice(0, 57) + '…' : titleRaw;

    // ── Autor del pedido ──────────────────────────────────────────────────────
    const requester = track.requester
        ? `<@${track.requester.id}>`
        : 'Desconocido';

    // ── Build embed ───────────────────────────────────────────────────────────
    const embed = new EmbedBuilder()
        .setColor(isPaused ? COLOR.paused : COLOR.playing)
        .setAuthor({
            name: isPaused
                ? '⏸️  Pausado  •  OWGalaxy Music'
                : '▶️  Reproduciendo ahora  •  OWGalaxy Music',
        })
        .setTitle(title)
        .setURL(track.info.uri)
        .setDescription(
            `> 🎤 **${track.info.author ?? 'Desconocido'}**\n` +
            `> 📡 Pedido por ${requester}`,
        )
        .addFields(
            {
                name : '⏱️ Tiempo',
                value: `\`${posFmt} / ${durFmt}\``,
                inline: true,
            },
            {
                name : '🔊 Volumen',
                value: `\`${player.volume ?? 80}%\``,
                inline: true,
            },
            {
                name : '📋 En cola',
                value: `\`${player.queue.tracks?.length ?? 0} tema(s)\``,
                inline: true,
            },
            {
                name : `${repeatIcon} Repetición`,
                value: `\`${repeatLabel}\``,
                inline: true,
            },
            {
                name : '\u200b',
                value: progressBar,
            },
        )
        .setFooter({ text: 'OWGalaxy Music  •  dev: thxmasdev' })
        .setTimestamp();

    if (thumbnail) embed.setThumbnail(thumbnail);

    // ── Fila 1: controles principales ─────────────────────────────────────────
    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('music_previous')
            .setEmoji('⏮️')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('music_pause')
            .setEmoji(isPaused ? '▶️' : '⏸️')
            .setStyle(isPaused ? ButtonStyle.Success : ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('music_skip')
            .setEmoji('⏭️')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('music_stop')
            .setEmoji('⏹️')
            .setStyle(ButtonStyle.Danger),
    );

    // ── Fila 2: controles extra ───────────────────────────────────────────────
    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('music_shuffle')
            .setEmoji('🔀')
            .setLabel('Mezclar')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('music_repeat')
            .setEmoji(repeatIcon)
            .setLabel('Repetir')
            .setStyle(repeatMode !== 'off' ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('music_queue')
            .setEmoji('📋')
            .setLabel('Cola')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('music_vol_down')
            .setEmoji('🔉')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('music_vol_up')
            .setEmoji('🔊')
            .setStyle(ButtonStyle.Secondary),
    );

    return { embeds: [embed], components: [row1, row2] };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Barra de progreso estilo YouTube: ▬▬▬🔘▬▬▬▬▬
 */
function buildBar(position, duration, len = 17) {
    if (!duration || duration === 0) return '▬'.repeat(len);
    const pos = Math.min(Math.floor((position / duration) * len), len - 1);
    return '▬'.repeat(pos) + '🔘' + '▬'.repeat(len - 1 - pos);
}

/**
 * Formatea milisegundos → mm:ss o hh:mm:ss
 */
function fmt(ms) {
    if (!ms || ms <= 0) return '0:00';
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${pad(m)}:${pad(sec)}`;
    return `${m}:${pad(sec)}`;
}

function pad(n) { return String(n).padStart(2, '0'); }

module.exports = { buildPlayerEmbed, fmt };
