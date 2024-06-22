const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // Verificar si la interacción es un comando de barra
        if (!interaction.isChatInputCommand()) return;

        try {
            // Obtener el canal de logs usando el ID
            const logChannel = await interaction.guild.channels.fetch('1215470038891495424');

            if (!logChannel) {
                console.error('Canal de logs no encontrado');
                return;
            }

            // Obtener el canal donde se usó el comando
            const channelUsed = interaction.channel;

            // Crear el embed
            const embed = new EmbedBuilder()
                .setColor('Random')
                .setTitle('CommandLog')
                .setDescription(`Comando usado: /${interaction.commandName}`)
                .addFields(
                    { name: 'Usuario', value: `<@${interaction.user.id}>`, inline: true },
                    { name: 'ID del Usuario', value: interaction.user.id, inline: true },
                    { name: 'Canal', value: channelUsed.name, inline: true },
                    { name: 'ID del Canal', value: channelUsed.id, inline: true }
                )
                .setTimestamp();

            // Agregar las opciones del comando al embed, si las hay
            if (interaction.options.data.length > 0) {
                const optionsField = interaction.options.data
                    .map(option => `${option.name}: ${option.value}`)
                    .join('\n');
                embed.addFields({ name: 'Opciones', value: optionsField });
            }

            // Enviar el embed al canal de logs
            await logChannel.send({ embeds: [embed] });

        } catch (error) {
            console.error(`Error al ejecutar el comando ${interaction.commandName}:`, error);
        }
    },
};