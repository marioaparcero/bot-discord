const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('asignar-rol')
        .setDescription('Asigna un rol a un usuario')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario al que se le asignará el rol')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('rol')
                .setDescription('El rol que se asignará')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const usuario = interaction.options.getUser('usuario');
        const rol = interaction.options.getRole('rol');
        const miembro = await interaction.guild.members.fetch(usuario.id);

        if (!miembro) {
            return await interaction.reply({ content: 'No se pudo encontrar al usuario en este servidor.', ephemeral: true });
        }

        try {
            await miembro.roles.add(rol);

            // Crear un embed para la respuesta y el log
            const embedRespuesta = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Rol Asignado')
                .setDescription(`El rol ${rol} ha sido asignado a ${usuario}.`)
                .addFields(
                    { name: 'Usuario', value: usuario.tag, inline: true },
                    { name: 'Rol', value: rol.name, inline: true },
                    { name: 'Asignado por', value: interaction.user.tag, inline: true }
                )
                .setTimestamp();

            // Responder al comando
            await interaction.reply({ embeds: [embedRespuesta] });

            // Registrar la acción en el canal de logs
            const canalLogs = interaction.guild.channels.cache.find(channel => channel.name === 'logs-roles');
            if (canalLogs) {
                await canalLogs.send({ embeds: [embedRespuesta] });
            } else {
                console.log('No se encontró un canal de logs para roles.');
            }

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Hubo un error al intentar asignar el rol.', ephemeral: true });
        }
    },
};