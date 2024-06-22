const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('antiguedad')
        .setDescription('Muestra información detallada sobre la antigüedad de un usuario en el servidor')
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('El usuario del que quieres saber la antigüedad (deja en blanco para ti mismo)')
                .setRequired(false)),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('usuario') || interaction.user;
        const member = await interaction.guild.members.fetch(targetUser.id);

        if (!member) {
            return interaction.reply({ content: 'No se pudo encontrar al usuario en este servidor.', ephemeral: true });
        }

        const joinedAt = member.joinedAt;
        const createdAt = targetUser.createdAt;
        const now = new Date();

        function formatDuration(duration) {
            const years = Math.floor(duration / (365.25 * 24 * 60 * 60 * 1000));
            const months = Math.floor((duration % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));
            const days = Math.floor((duration % (30.44 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
            const hours = Math.floor((duration % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

            let durationString = '';
            if (years > 0) durationString += `${years} año${years !== 1 ? 's' : ''} `;
            if (months > 0) durationString += `${months} mes${months !== 1 ? 'es' : ''} `;
            if (days > 0) durationString += `${days} día${days !== 1 ? 's' : ''} `;
            if (hours > 0) durationString += `${hours} hora${hours !== 1 ? 's' : ''}`;
            return durationString.trim() || 'Menos de una hora';
        }

        const joinDuration = formatDuration(now - joinedAt);
        const accountAge = formatDuration(now - createdAt);

        // Calcular posición de antigüedad
        const sortedMembers = await interaction.guild.members.fetch();
        const membersSortedByJoinDate = sortedMembers.sort((a, b) => a.joinedAt - b.joinedAt);
        const position = membersSortedByJoinDate.map(m => m.id).indexOf(targetUser.id) + 1;

        // Obtener roles del usuario
        const roles = member.roles.cache
            .filter(role => role.id !== interaction.guild.id)
            .sort((a, b) => b.position - a.position)
            .map(role => role.toString())
            .slice(0, 10); // Limitar a 10 roles para evitar exceder el límite de caracteres

        const embed = new EmbedBuilder()
            .setColor(member.displayHexColor || '#0099ff')
            .setTitle(`Perfil de Antigüedad de ${targetUser.username}`)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '🗓️ Se unió el', value: `<t:${Math.floor(joinedAt.getTime() / 1000)}:F>`, inline: true },
                { name: '⏳ Tiempo en el servidor', value: joinDuration, inline: true },
                { name: '🏆 Posición de antigüedad', value: `#${position} de ${interaction.guild.memberCount}`, inline: true },
                { name: '🎂 Cuenta creada el', value: `<t:${Math.floor(createdAt.getTime() / 1000)}:F>`, inline: true },
                { name: '🧓 Edad de la cuenta', value: accountAge, inline: true },
                { name: `🎭 Roles [${roles.length}]`, value: roles.join(' ') || 'Ninguno' }
            )
            .setFooter({ text: `ID: ${targetUser.id} | Solicitado por ${interaction.user.tag}` })
            .setTimestamp();

        // Agregar información de permisos si el usuario que ejecuta el comando tiene permiso para ver auditorías
        if (interaction.member.permissions.has(PermissionFlagsBits.ViewAuditLog)) {
            const keyPermissions = [
                PermissionFlagsBits.Administrator,
                PermissionFlagsBits.ManageGuild,
                PermissionFlagsBits.ModerateMembers,
                PermissionFlagsBits.ManageRoles,
                PermissionFlagsBits.ManageChannels,
                PermissionFlagsBits.ManageMessages
            ];

            const userPermissions = keyPermissions
                .filter(perm => member.permissions.has(perm))
                .map(perm => Object.keys(PermissionFlagsBits).find(key => PermissionFlagsBits[key] === perm))
                .join(', ');

            if (userPermissions) {
                embed.addFields({ name: '🔑 Permisos clave', value: userPermissions });
            }
        }

        await interaction.reply({ embeds: [embed] });
    },
};