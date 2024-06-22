const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banear')
        .setDescription('Banea a un usuario del servidor')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario que será baneado')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('razon')
                .setDescription('La razón del ban')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('dias')
                .setDescription('Número de días para el ban temporal (0 para permanente)')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('mensajes')
                .setDescription('Número de días de mensajes para eliminar (0-7)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const userToBan = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('razon') || 'No se proporcionó una razón';
        const days = interaction.options.getInteger('dias') || 0;
        const deleteMessageDays = interaction.options.getInteger('mensajes') || 0;

        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.reply({ content: 'No tienes permiso para banear usuarios.', ephemeral: true });
        }

        const memberToBan = await interaction.guild.members.fetch(userToBan.id).catch(() => null);

        if (memberToBan && !memberToBan.bannable) {
            return interaction.reply({ content: 'No puedo banear a este usuario. Puede que tenga un rol más alto que el mío.', ephemeral: true });
        }

        // Confirmación
        await interaction.reply({ content: `¿Estás seguro de que quieres banear a ${userToBan.tag}? Responde con 'sí' para confirmar.`, ephemeral: true });
        
        const filter = i => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, time: 15000, max: 1 });

        collector.on('collect', async m => {
            if (m.content.toLowerCase() === 'sí' || m.content.toLowerCase() === 'si') {
                try {
                    // Notificar al usuario
                    await userToBan.send(`Has sido baneado de ${interaction.guild.name}. Razón: ${reason}`).catch(() => console.log('No se pudo enviar DM al usuario'));

                    // Banear al usuario
                    await interaction.guild.members.ban(userToBan, { reason: reason, days: deleteMessageDays });

                    // Crear embed para la respuesta y el log
                    const banEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('Usuario Baneado')
                        .setDescription(`${userToBan.tag} ha sido baneado del servidor.`)
                        .addFields(
                            { name: 'Razón', value: reason },
                            { name: 'Duración', value: days > 0 ? `${days} días` : 'Permanente' },
                            { name: 'Baneado por', value: interaction.user.tag }
                        )
                        .setTimestamp();

                    await interaction.followUp({ embeds: [banEmbed] });

                    // Registrar la acción
                    const logChannel = interaction.guild.channels.cache.find(channel => channel.name === 'mod-logs');
                    if (logChannel) {
                        await logChannel.send({ embeds: [banEmbed] });
                    }

                    // Si es un ban temporal, programar el desbaneo
                    if (days > 0) {
                        setTimeout(async () => {
                            await interaction.guild.members.unban(userToBan.id).catch(console.error);
                            if (logChannel) {
                                await logChannel.send(`El ban de ${userToBan.tag} ha expirado y ha sido levantado.`);
                            }
                        }, days * 24 * 60 * 60 * 1000);
                    }

                } catch (error) {
                    console.error(error);
                    await interaction.followUp({ content: 'Hubo un error al intentar banear al usuario.', ephemeral: true });
                }
            } else {
                await interaction.followUp({ content: 'Ban cancelado.', ephemeral: true });
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.followUp({ content: 'Tiempo de espera agotado. Ban cancelado.', ephemeral: true });
            }
        });
    },
};