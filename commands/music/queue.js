/**
 * @author thxmasdev
 * @description Comando /queue — muestra la cola paginada.
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { fmt } = require('../../utils/playerEmbed');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Muestra la cola de reproducción actual.')
        .addIntegerOption(opt =>
            opt.setName('pagina').setDescription('Página de la cola').setRequired(false).setMinValue(1),
        ),

    async execute(interaction) {
        const player = interaction.client.lavalink.getPlayer(interaction.guildId);

        if (!player || (!player.playing && !player.paused)) {
            return interaction.reply({ embeds: [errEmbed('No hay nada reproduciendo.')], ephemeral: true });
        }

        const queue    = player.queue.tracks ?? [];
        const current  = player.queue.current;
        const page     = (interaction.options.getInteger('pagina') ?? 1) - 1;
        const perPage  = 10;
        const total    = queue.length;
        const maxPages = Math.max(1, Math.ceil(total / perPage));

        if (page >= maxPages) {
            return interaction.reply({
                embeds   : [errEmbed(`Solo hay **${maxPages}** página(s) en la cola.`)],
                ephemeral: true,
            });
        }

        const items = queue.slice(page * perPage, page * perPage + perPage);

        const nums = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setAuthor({ name: '📋  Cola de reproducción  •  OWGalaxy Music' })
            .setDescription(
                [
                    current
                        ? `**▶️ Reproduciendo:**\n> [${current.info.title}](${current.info.uri})  •  \`${fmt(current.info.duration)}\`\n`
                        : '',
                    items.length > 0
                        ? `**Próximas canciones:**\n` +
                          items.map((t, i) =>
                              `${nums[i] ?? `\`${page * perPage + i + 1}.\``} [${t.info.title}](${t.info.uri})\n> 👤 ${t.info.author}  •  ⏱️ \`${fmt(t.info.duration)}\``,
                          ).join('\n\n')
                        : '> _Cola vacía — usá `/play` para agregar canciones._',
                ].join('\n'),
            )
            .setFooter({ text: `Página ${page + 1}/${maxPages}  •  ${total} tema(s) en cola  •  thxmasdev` })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    },
};

function errEmbed(desc) {
    return new EmbedBuilder().setColor(0xED4245).setDescription(`❌ ${desc}`)
        .setFooter({ text: 'OWGalaxy Music  •  dev: thxmasdev' });
}
