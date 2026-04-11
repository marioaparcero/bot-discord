/**
 * @author thxmasdev
 * @description Comando /play — busca música estilo YouTube y la reproduce.
 */

const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
} = require('discord.js');

const { buildPlayerEmbed, fmt } = require('../../utils/playerEmbed');
const { setPlayerData, getPlayerData } = require('../../utils/playerStore');

// ─── Colores ──────────────────────────────────────────────────────────────────
const C = { main: 0x5865F2, success: 0x57F287, error: 0xED4245 };

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Busca y reproduce música desde YouTube, Spotify y más.')
        .addStringOption(opt =>
            opt
                .setName('busqueda')
                .setDescription('Nombre de la canción, artista o URL de YouTube/Spotify/playlist')
                .setRequired(true),
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const query = interaction.options.getString('busqueda');
        const member = interaction.member;
        const vc = member.voice?.channel;

        // ── Verificaciones básicas ────────────────────────────────────────────
        if (!vc) {
            return interaction.editReply({ embeds: [errEmbed('🔇 Tenés que estar en un canal de voz.')] });
        }

        const perms = vc.permissionsFor(interaction.client.user);
        if (!perms.has('Connect') || !perms.has('Speak')) {
            return interaction.editReply({ embeds: [errEmbed('❌ No tengo permisos para conectarme al canal de voz.')] });
        }

        // ── Player ────────────────────────────────────────────────────────────
        const lavalink = interaction.client.lavalink;
        let player = lavalink.getPlayer(interaction.guildId);

        if (!player) {
            player = lavalink.createPlayer({
                guildId: interaction.guildId,
                voiceChannelId: vc.id,
                textChannelId: interaction.channelId,
                selfDeaf: true,
                selfMute: false,
                volume: 80,
            });
        }

        if (!player.connected) await player.connect();

        // ── Búsqueda ──────────────────────────────────────────────────────────
        const isUrl = /^https?:\/\//i.test(query);
        let res;

        try {
            res = await player.search(
                { query, source: isUrl ? undefined : 'ytsearch' },
                interaction.user,
            );
        } catch (e) {
            console.error('[/play] Error de búsqueda:', e);
            return interaction.editReply({
                embeds: [errEmbed('❌ No pude conectarme a Lavalink. ¿Está el servidor corriendo?')],
            });
        }

        if (!res || res.loadType === 'empty' || res.loadType === 'error') {
            return interaction.editReply({
                embeds: [errEmbed(`🔍 Sin resultados para **${query}**.\nProbá con otro nombre o pegá un link directo.`)],
            });
        }

        // ── Playlist / Álbum ──────────────────────────────────────────────────
        if (res.loadType === 'playlist') {
            await player.queue.add(res.tracks);
            if (!player.playing && !player.paused) await player.play({ paused: false });

            const pl = res.playlist;
            const embed = new EmbedBuilder()
                .setColor(C.main)
                .setAuthor({ name: '📀  Playlist agregada  •  OWGalaxy Music' })
                .setTitle(pl?.name ?? 'Playlist')
                .setDescription(
                    `> 🎵 **${res.tracks.length} temas** agregados a la cola.\n` +
                    (pl?.selectedTrack >= 0 ? `> ▶️ Empezando desde el tema #${pl.selectedTrack + 1}` : ''),
                )
                .setThumbnail(pl?.thumbnail ?? res.tracks[0]?.info?.artworkUrl ?? null)
                .setFooter({ text: `Pedido por ${interaction.user.username}  •  thxmasdev` })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
            await sendOrUpdatePlayer(player, interaction);
            return;
        }

        // ── Resultados múltiples (búsqueda por texto) ─────────────────────────
        if (res.loadType === 'search' && res.tracks.length > 1 && !isUrl) {
            const top = res.tracks.slice(0, 5);

            // Numeritos bonitos
            const nums = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];

            const searchEmbed = new EmbedBuilder()
                .setColor(C.main)
                .setAuthor({ name: '🔎  Resultados de búsqueda  •  OWGalaxy Music' })
                .setTitle(`"${query.length > 50 ? query.slice(0, 47) + '…' : query}"`)
                .setDescription(
                    top.map((t, i) =>
                        `${nums[i]} **[${t.info.title.length > 55 ? t.info.title.slice(0, 52) + '…' : t.info.title}](${t.info.uri})**\n` +
                        `> 👤 ${t.info.author}  •  ⏱️ \`${fmt(t.info.duration)}\``,
                    ).join('\n\n'),
                )
                .setFooter({ text: 'Seleccioná una canción o elegí "Poner todas"  •  thxmasdev' })
                .setTimestamp();

            const menu = new StringSelectMenuBuilder()
                .setCustomId('search_select')
                .setPlaceholder('🎵 Elegí una canción...')
                .addOptions([
                    ...top.map((t, i) => ({
                        label: t.info.title.slice(0, 100),
                        description: `${t.info.author.slice(0, 50)}  •  ${fmt(t.info.duration)}`,
                        value: String(i),
                        emoji: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'][i],
                    })),
                    {
                        label: 'Poner las 5 primeras canciones',
                        description: 'Agregar todos los resultados a la cola',
                        value: 'all',
                        emoji: '▶️',
                    },
                ]);

            const reply = await interaction.editReply({
                embeds: [searchEmbed],
                components: [new ActionRowBuilder().addComponents(menu)],
            });

            // Guardar tracks para el collector
            setPlayerData(interaction.guildId, 'searchResults', top);

            const collector = reply.createMessageComponentCollector({
                time: 30_000,
                filter: i => i.user.id === interaction.user.id,
            });

            collector.on('collect', async i => {
                await i.deferUpdate();
                const tracks = getPlayerData(interaction.guildId, 'searchResults') ?? top;
                const sel = i.values[0];

                const chosen = sel === 'all' ? tracks : [tracks[parseInt(sel)]];
                await player.queue.add(chosen);
                if (!player.playing && !player.paused) await player.play({ paused: false });

                const first = chosen[0];
                const okEmbed = new EmbedBuilder()
                    .setColor(C.success)
                    .setAuthor({ name: sel === 'all' ? '🎶  Canciones agregadas  •  OWGalaxy Music' : '✅  Agregado a la cola  •  OWGalaxy Music' })
                    .setDescription(
                        sel === 'all'
                            ? `> Se agregaron **${tracks.length} canciones** a la cola.`
                            : `> **[${first.info.title}](${first.info.uri})**\n> 👤 ${first.info.author}  •  ⏱️ \`${fmt(first.info.duration)}\``,
                    )
                    .setThumbnail(first.info.artworkUrl ?? null)
                    .setFooter({ text: `Pedido por ${interaction.user.username}  •  thxmasdev` });

                await i.editReply({ embeds: [okEmbed], components: [] });
                await sendOrUpdatePlayer(player, interaction);
                collector.stop('selected');
            });

            collector.on('end', (_, reason) => {
                if (reason !== 'selected') {
                    interaction.editReply({
                        embeds: [errEmbed('⏰ Se acabó el tiempo de selección.')],
                        components: [],
                    }).catch(() => { });
                }
            });

            return;
        }

        // ── Track único / URL directa ─────────────────────────────────────────
        const track = res.tracks[0];
        await player.queue.add(track);
        if (!player.playing && !player.paused) await player.play({ paused: false });

        const inQueue = (player.queue.tracks?.length ?? 0) > 1 || player.playing;

        const singleEmbed = new EmbedBuilder()
            .setColor(C.main)
            .setAuthor({ name: inQueue ? '📋  Agregado a la cola  •  OWGalaxy Music' : '🎵  Reproduciendo  •  OWGalaxy Music' })
            .setDescription(
                `> **[${track.info.title}](${track.info.uri})**\n` +
                `> 👤 ${track.info.author}  •  ⏱️ \`${fmt(track.info.duration)}\``,
            )
            .setThumbnail(track.info.artworkUrl ?? null)
            .setFooter({ text: `Pedido por ${interaction.user.username}  •  thxmasdev` });

        await interaction.editReply({ embeds: [singleEmbed] });

        if (!inQueue) await sendOrUpdatePlayer(player, interaction);
    },
};

// ─── Helper: enviar o actualizar el embed del player ──────────────────────────

async function sendOrUpdatePlayer(player, interaction) {
    const data = buildPlayerEmbed(player);
    if (!data) return;

    const ref = getPlayerData(player.guildId, 'playerMessage');
    if (ref && ref.channelId === interaction.channelId) {
        try {
            const ch = await interaction.client.channels.fetch(ref.channelId);
            const msg = await ch.messages.fetch(ref.messageId);
            await msg.edit(data);
            return;
        } catch { /* mensaje borrado → enviar uno nuevo */ }
    }

    const msg = await interaction.followUp({ ...data, fetchReply: true });
    setPlayerData(player.guildId, 'playerMessage', {
        channelId: interaction.channelId,
        messageId: msg.id,
    });
}

// ─── Embed de error ───────────────────────────────────────────────────────────
function errEmbed(desc) {
    return new EmbedBuilder()
        .setColor(0xED4245)
        .setDescription(desc)
        .setFooter({ text: 'OWGalaxy Music  •  dev: thxmasdev' });
}
