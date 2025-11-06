const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('usuario')
        .setDescription('Muestra información del usuario y sus roles.')
        .addUserOption(option =>
            option
                .setName('miembro')
                .setDescription('Selecciona un usuario (opcional)')
                .setRequired(false)
        ),
    async execute(interaction) {
        // Obtener el usuario especificado o el que ejecutó el comando
        const user = interaction.options.getUser('miembro') || interaction.user;
        const member = interaction.guild.members.cache.get(user.id);

        // Obtener roles del miembro (excepto @everyone)
        const roles = member.roles.cache
            .filter(role => role.id !== interaction.guild.id)
            .map(role => role.toString())
            .join(', ') || 'Sin roles';

        // Crear el embed
        const embed = new EmbedBuilder()
            .setColor(0x00AE86)
            .setTitle(`Información de ${user.username}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '🪪 Usuario', value: `${user.tag}`, inline: true },
                { name: '🆔 ID', value: `${user.id}`, inline: true },
                { name: '📅 Cuenta creada', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>` },
                { name: '👥 Roles', value: roles }
            )
            .setFooter({ text: `Comando ejecutado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        // Enviar el embed
        await interaction.reply({ embeds: [embed] });
    },
};
