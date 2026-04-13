/**
 * @author thxmasdev
 */
const {
    SlashCommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    ComponentType,
} = require('discord.js');
const { Streamer } = require('../../database/models');

// ── Constantes ─────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 8;

const PLATFORM = {
    twitch: {
        key: 'twitch',
        label: 'Twitch',
        emoji: '🟣',
        color: 0x9146FF,
        baseUrl: 'https://twitch.tv',
    },
    kick: {
        key: 'kick',
        label: 'Kick',
        emoji: '🟢',
        color: 0x53FC18,
        baseUrl: 'https://kick.com',
    },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatStreamerLine(s) {
    const { baseUrl } = PLATFORM[s.platform];
    const name = s.displayName || s.username;
    const url = `${baseUrl}/${s.username}`;
    const status = s.isLive ? '🔴 **EN VIVO**' : '⚫ Offline';
    const discord = s.discordUserId ? ` · <@${s.discordUserId}>` : '';
    return `${status} · [**${name}**](${url})${discord}`;
}

/**
 * Embed de selección de plataforma (pantalla inicial).
 */
function buildSelectorEmbed(twitchList, kickList, guild) {
    const liveCount = [...twitchList, ...kickList].filter(s => s.isLive).length;

    return new EmbedBuilder()
        .setColor(0x5865F2)
        .setAuthor({
            name: `${guild.name} · Streamers monitoreados`,
            iconURL: guild.iconURL({ dynamic: true }) ?? undefined,
        })
        .setTitle('📡 Lista de streamers')
        .setDescription(
            '**Seleccioná una plataforma para ver los streamers.**\n\n' +
            `🟣 **Twitch** — ${twitchList.length} streamer${twitchList.length !== 1 ? 's' : ''}\n` +
            `🟢 **Kick** — ${kickList.length} streamer${kickList.length !== 1 ? 's' : ''}\n\n` +
            (liveCount > 0
                ? `🔴 **${liveCount}** en vivo ahora mismo`
                : '⚫ Ninguno en vivo en este momento')
        )
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setFooter({ text: `Total: ${twitchList.length + kickList.length} streamers` })
        .setTimestamp();
}

/**
 * Embed de una página de streamers para una plataforma.
 */
function buildPageEmbed(list, platformKey, page, guild) {
    const meta = PLATFORM[platformKey];
    const totalPages = Math.max(1, Math.ceil(list.length / ITEMS_PER_PAGE));
    const start = page * ITEMS_PER_PAGE;
    const slice = list.slice(start, start + ITEMS_PER_PAGE);
    const liveInSlice = list.filter(s => s.isLive).length;

    return new EmbedBuilder()
        .setColor(meta.color)
        .setAuthor({
            name: `${guild.name} · Streamers monitoreados`,
            iconURL: guild.iconURL({ dynamic: true }) ?? undefined,
        })
        .setTitle(`${meta.emoji} Streamers de ${meta.label}`)
        .setDescription(
            slice.length > 0
                ? slice.map(formatStreamerLine).join('\n')
                : '_No hay streamers en esta plataforma._'
        )
        .setFooter({
            text: `Página ${page + 1} de ${totalPages}  ·  ${list.length} streamer${list.length !== 1 ? 's' : ''}  ·  ${liveInSlice} en vivo`,
            iconURL: guild.iconURL({ dynamic: true }) ?? undefined,
        })
        .setTimestamp();
}

// ── Filas de botones ───────────────────────────────────────────────────────────

/** Fila de selección de plataforma. */
function buildSelectorRow(twitchCount, kickCount) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('sl_twitch')
            .setLabel(`Twitch (${twitchCount})`)
            .setEmoji('🟣')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(twitchCount === 0),
        new ButtonBuilder()
            .setCustomId('sl_kick')
            .setLabel(`Kick (${kickCount})`)
            .setEmoji('🟢')
            .setStyle(ButtonStyle.Success)
            .setDisabled(kickCount === 0),
        new ButtonBuilder()
            .setCustomId('sl_close')
            .setLabel('Cerrar')
            .setEmoji('✖️')
            .setStyle(ButtonStyle.Danger),
    );
}

/** Fila de paginación dentro de una plataforma. */
function buildPaginationRow(page, totalPages) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('pg_first')
            .setEmoji('⏮️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === 0),
        new ButtonBuilder()
            .setCustomId('pg_prev')
            .setLabel('Anterior')
            .setEmoji('◀️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === 0),
        new ButtonBuilder()
            .setCustomId('pg_counter')
            .setLabel(`${page + 1} / ${totalPages}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
        new ButtonBuilder()
            .setCustomId('pg_next')
            .setLabel('Siguiente')
            .setEmoji('▶️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === totalPages - 1),
        new ButtonBuilder()
            .setCustomId('pg_last')
            .setEmoji('⏭️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === totalPages - 1),
    );
}

/** Fila de navegación (volver + cerrar) al ver una plataforma. */
function buildNavRow() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('pg_back')
            .setLabel('← Volver')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('sl_close')
            .setLabel('Cerrar')
            .setEmoji('✖️')
            .setStyle(ButtonStyle.Danger),
    );
}

// ── Comando ───────────────────────────────────────────────────────────────────

module.exports = {
    data: new SlashCommandBuilder()
        .setName('canal-stream-list')
        .setDescription('Muestra la lista de streamers monitoreados en este servidor.'),

    async execute(interaction) {
        await interaction.deferReply();

        const guildId = interaction.guildId;
        const streamers = await Streamer.find({ guildId }).sort({ isLive: -1, username: 1 });

        const twitchList = streamers.filter(s => s.platform === 'twitch');
        const kickList   = streamers.filter(s => s.platform === 'kick');

        // ── Sin streamers ──────────────────────────────────────────────────────
        if (streamers.length === 0) {
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xFFAA00)
                        .setTitle('📋 Lista de streamers')
                        .setDescription(
                            '**No hay ningún streamer registrado en este servidor.**\n\n' +
                            'Un administrador puede agregar streamers con `/canal-stream-add`.'
                        )
                        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                        .setTimestamp(),
                ],
            });
        }

        // ── Estado mutable de la sesión ────────────────────────────────────────
        let currentPlatform = null; // 'twitch' | 'kick' | null (selector)
        let currentPage = 0;

        const reply = await interaction.editReply({
            embeds: [buildSelectorEmbed(twitchList, kickList, interaction.guild)],
            components: [buildSelectorRow(twitchList.length, kickList.length)],
        });

        // ── Collector ──────────────────────────────────────────────────────────
        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: i => i.customId.startsWith('sl_') || i.customId.startsWith('pg_'),
            time: 5 * 60 * 1_000,
        });

        const showSelector = async (btnInt) => {
            currentPlatform = null;
            currentPage = 0;
            await btnInt.update({
                embeds: [buildSelectorEmbed(twitchList, kickList, interaction.guild)],
                components: [buildSelectorRow(twitchList.length, kickList.length)],
            });
        };

        const showPlatform = async (btnInt) => {
            const list = currentPlatform === 'twitch' ? twitchList : kickList;
            const totalPages = Math.max(1, Math.ceil(list.length / ITEMS_PER_PAGE));
            const rows = [buildNavRow()];
            if (totalPages > 1) rows.unshift(buildPaginationRow(currentPage, totalPages));
            await btnInt.update({
                embeds: [buildPageEmbed(list, currentPlatform, currentPage, interaction.guild)],
                components: rows,
            });
        };

        collector.on('collect', async btnInt => {
            // Solo el autor navega
            if (btnInt.user.id !== interaction.user.id) {
                return btnInt.reply({
                    content: '⚠️ Solo quien ejecutó el comando puede navegar la lista.',
                    ephemeral: true,
                });
            }

            const id = btnInt.customId;

            // Cerrar
            if (id === 'sl_close') {
                collector.stop('closed');
                return btnInt.update({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0x36393F)
                            .setDescription('✖️ Lista cerrada.')
                            .setTimestamp(),
                    ],
                    components: [],
                });
            }

            // Seleccionar plataforma
            if (id === 'sl_twitch') { currentPlatform = 'twitch'; currentPage = 0; return showPlatform(btnInt); }
            if (id === 'sl_kick')   { currentPlatform = 'kick';   currentPage = 0; return showPlatform(btnInt); }

            // Volver al selector
            if (id === 'pg_back') return showSelector(btnInt);

            // Paginación
            if (currentPlatform) {
                const list = currentPlatform === 'twitch' ? twitchList : kickList;
                const totalPages = Math.max(1, Math.ceil(list.length / ITEMS_PER_PAGE));
                if (id === 'pg_first') currentPage = 0;
                else if (id === 'pg_prev') currentPage = Math.max(0, currentPage - 1);
                else if (id === 'pg_next') currentPage = Math.min(totalPages - 1, currentPage + 1);
                else if (id === 'pg_last') currentPage = totalPages - 1;
                return showPlatform(btnInt);
            }
        });

        collector.on('end', async (_collected, reason) => {
            if (reason === 'closed') return;
            // Timeout → deshabilitar todos los botones
            try {
                const disabledRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('sl_expired')
                        .setLabel('Sesión expirada')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                );
                await interaction.editReply({ components: [disabledRow] });
            } catch { /* mensaje eliminado */ }
        });
    },
};
