const { SlashCommandBuilder, EmbedBuilder, MessageFlags, Colors } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Establece o retira tu estado de ausente (AFK).')
        .addStringOption(option => 
            option.setName('motivo')
                .setDescription('Razón por la que te ausentas (opcional).')
                .setRequired(false)),
                
    async execute(interaction) {
        // Deferir la respuesta es una buena práctica si la API de Discord tarda en procesar el cambio de apodo
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const member = interaction.member;
        const reason = interaction.options.getString('motivo') || 'No especificado';
        
        // Obtener el nombre actual (apodo o nombre de usuario por defecto)
        const currentName = member.nickname || member.user.username;
        const isAFK = currentName.endsWith('[AFK]');
        
        let newName;
        let afkStatusText;
        let colorEmbed;

        if (isAFK) {
            // Lógica para QUITAR el AFK
            newName = currentName.replace(' [AFK]', '').replace('[AFK]', '').trim();
            afkStatusText = 'ha regresado y ya no está AFK.';
            colorEmbed = Colors.Green;
        } else {
            // Lógica para PONER el AFK
            // Discord limita los apodos a 32 caracteres. '[AFK]' ocupa 6 (con el espacio).
            if (currentName.length > 26) {
                newName = `${currentName.substring(0, 26)} [AFK]`;
            } else {
                newName = `${currentName} [AFK]`;
            }
            afkStatusText = 'ahora está AFK.';
            colorEmbed = Colors.Orange;
        }

        let nicknameChanged = true;

        try {
            // Intentar cambiar el apodo
            await member.setNickname(newName);
        } catch (error) {
            // Error 50013: Missing Permissions (El bot tiene un rol inferior al usuario)
            nicknameChanged = false;
            console.error(`No se pudo cambiar el apodo de ${member.user.tag}: ${error.message}`);
        }

        // 1. Crear el Embed para responder al usuario
        const replyEmbed = new EmbedBuilder()
            .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
            .setTitle('Actualización de Estado AFK')
            .setColor(colorEmbed)
            .setDescription(`**${member.user.username}** ${afkStatusText}`)
            .addFields(
                { name: 'Motivo', value: reason, inline: true }
            )
            .setTimestamp();

        if (!nicknameChanged) {
            replyEmbed.setFooter({ text: 'Nota: No pude actualizar tu apodo por falta de permisos/jerarquía de roles.' });
        }

        await interaction.editReply({ embeds: [replyEmbed] });

        // 2. Sistema de Logs
        const logChannelId = '1495858819660517486'; 
        const logChannel = interaction.guild.channels.cache.get(logChannelId);

        if (logChannel) {
            const logEmbed = new EmbedBuilder()
                .setTitle('Registro: Estado AFK Modificado')
                .setColor(colorEmbed)
                .setThumbnail(member.user.displayAvatarURL())
                .addFields(
                    { name: 'Usuario', value: `${member.user.tag} (<@${member.user.id}>)`, inline: true },
                    { name: 'Acción', value: isAFK ? 'Eliminó el AFK' : 'Se puso AFK', inline: true },
                    { name: 'Motivo', value: reason, inline: false },
                    { name: 'Cambio de Apodo', value: nicknameChanged ? `Exitoso (\`${newName}\`)` : 'Fallido (Falta de permisos)', inline: false }
                )
                .setTimestamp()
                .setFooter({ text: `ID del Usuario: ${member.user.id}` });

            try {
                await logChannel.send({ embeds: [logEmbed] });
            } catch (error) {
                console.error(`No se pudo enviar el log al canal ${logChannelId}:`, error);
            }
        } else {
            console.warn(`Canal de logs con ID ${logChannelId} no encontrado en el servidor.`);
        }
    },
};