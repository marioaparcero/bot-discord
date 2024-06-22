const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('expulsar')
        .setDescription('Expulsa a un usuario del servidor')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario que será expulsado')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('razon')
                .setDescription('La razón de la expulsión')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('borrar_mensajes')
                .setDescription('¿Borrar los mensajes recientes del usuario?')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    async execute(interaction) {
        const userToKick = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('razon') || 'No se proporcionó una razón';
        const deleteMsgs = interaction.options.getBoolean('borrar_mensajes') || false;

        if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            return interaction.reply({ content: 'No tienes permiso para expulsar usuarios.', ephemeral: true });
        }

        const memberToKick = await interaction.guild.members.fetch(userToKick.id).catch(() => null);

        if (!memberToKick) {
            return interaction.reply({ content: 'No se pudo encontrar al usuario en este servidor.', ephemeral: true });
        }

        if (!memberToKick.kickable || memberToKick.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.reply({ content: 'No puedo expulsar a este usuario. Puede que tenga un rol más alto que el mío o el tuyo.', ephemeral: true });
        }

        // Confirmación
        await interaction.reply({ content: `¿Estás seguro de que quieres expulsar a ${userToKick.tag}? Responde con 'sí' para confirmar.`, ephemeral: true });
        
        const filter = i => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, time: 15000, max: 1 });

        collector.on('collect', async m => {
            if (m.content.toLowerCase() === 'sí' || m.content.toLowerCase() === 'si') {
                try {
                    // Notificar al usuario
                    await userToKick.send(`Has sido expulsado de ${interaction.guild.name}. Razón: ${reason}`).catch(() => console.log('No se pudo enviar DM al usuario'));

                    // Expulsar al usuario
                    await memberToKick.kick(reason);

                    // Borrar mensajes si se solicitó
                    if (deleteMsgs) {
                        const messages = await interaction.channel.messages.fetch({ limit: 100 });
                        const userMessages = messages.filter(m => m.author.id === userToKick.id);
                        await interaction.channel.bulkDelete(userMessages);
                    }

                    // Respuesta de confirmación
                    const kickEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('Usuario Expulsado')
                        .setDescription(`${userToKick.tag} ha sido expulsado del servidor.`)
                        .addFields(
                            { name: 'Razón', value: reason },
                            { name: 'Expulsado por', value: interaction.user.tag }
                        )
                        .setTimestamp();

                    await interaction.followUp({ embeds: [kickEmbed] });

                    // Registrar la acción (ejemplo: enviar a un canal de logs)
                    const logChannel = interaction.guild.channels.cache.find(channel => channel.name === 'mod-logs');
                    if (logChannel) {
                        await logChannel.send({ embeds: [kickEmbed] });
                    }
                } catch (error) {
                    console.error(error);
                    await interaction.followUp({ content: 'Hubo un error al intentar expulsar al usuario.', ephemeral: true });
                }
            } else {
                await interaction.followUp({ content: 'Expulsión cancelada.', ephemeral: true });
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.followUp({ content: 'Tiempo de espera agotado. Expulsión cancelada.', ephemeral: true });
            }
        });
    },
};