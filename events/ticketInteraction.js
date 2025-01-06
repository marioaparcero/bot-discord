const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, ChannelType, EmbedBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, MessageFlags } = require('discord.js');
const ticket = require('../Schemas/ticketSchema');
const { createTranscript } = require('discord-html-transcripts');
const { set } = require('mongoose');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {

        if (interaction.customId === 'ticketCreateSelect') {
            const modal = new ModalBuilder()
                .setTitle('🎫 Ticket')
                .setCustomId('ticketModal');

            const why = new TextInputBuilder()
                .setCustomId('whyTicket')
                .setRequired(true)
                .setPlaceholder('Escribe el motivo de tu ticket.')
                .setLabel('Motivo del ticket')
                .setStyle(TextInputStyle.Paragraph);

            const info = new TextInputBuilder()
                .setCustomId('infoTicket')
                .setRequired(true)
                .setPlaceholder('Escribe la información de tu ticket.')
                .setLabel('Información del ticket')
                .setStyle(TextInputStyle.Paragraph);

            const one = new ActionRowBuilder().addComponents(why);
            const two = new ActionRowBuilder().addComponents(info);

            modal.addComponents(one, two);
            await interaction.showModal(modal);
        } else if (interaction.customId === 'ticketModal') {
            const user = interaction.user;
            const data = await ticket.findOne({ Guild: interaction.guild.id });
            if (!data) return interaction.reply({ content: 'No has configurado el sistema de tickets.', flags: MessageFlags.Ephemeral });

            const why = interaction.fields.getTextInputValue('whyTicket');
            const info = interaction.fields.getTextInputValue('infoTicket');
            const category = await interaction.guild.channels.cache.get(data.Category);

            const channel = await interaction.guild.channels.create({
                name: `ticket-${user.username}`,
                type: ChannelType.GuildText,
                topic: `Ticket user: ${user.username}. Ticket reason: ${why}.`,
                parent: category,
                permissionsOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.Reactions, PermissionFlagsBits.ReadMessageHistory]
                    }
                ],                
            });

            const embed = new EmbedBuilder()
                .setTitle(`🎫 Ticket from ${user.username}`)
                .setDescription(`**Motivo:** ${why}\n**Información:** ${info}`)
                .setTimestamp();

            const button = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('closeTicket')
                    .setLabel('Cerrar ticket')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('ticketTranscript')
                    .setLabel('Transcripción')
                    .setStyle(ButtonStyle.Primary)
            );

            await channel.send({ embeds: [embed], components: [button] });
            await interaction.reply({ content: `Ticket creado en ${channel.id}`, flags: MessageFlags.Ephemeral });
        } else if (interaction.customId === 'closeTicket') {
            const closeModal = new ModalBuilder()
                .setTitle('Cerrando Ticket')
                .setCustomId('closeTicketModal');

            const reason = new TextInputBuilder()
                .setCustomId('closeReasonTicket')
                .setRequired(true)
                .setPlaceholder('Escribe la razón por la que cierras el ticket.')
                .setLabel('Razón del cierre del ticket')
                .setStyle(TextInputStyle.Paragraph);

            const one = new ActionRowBuilder().addComponents(reason);

            closeModal.addComponents(one);
            await interaction.showModal(closeModal);
        } else if (interaction.customId === 'closeTicketModal') {
            const channel = interaction.channel;
            let name = channel.name;
            name = name.replace('ticket-', '');
            const member = await interaction.guild.members.cache.get(name);

            const reason = interaction.fields.getTextInputValue('closeReasonTicket');
            await interaction.reply({ content: `Cerrando ticket...` });



            setTimeout(async () => {
                if (member) {
                    try {
                        // Enviar el mensaje al miembro antes de eliminar el canal
                        await member.send(`Tu ticket ha sido cerrado en ${interaction.guild.name}. Razón: \`${reason}\``);
                    } catch (err) {
                        console.error('Error al enviar el mensaje al miembro:', err);
                    }
                }
        
                try {
                    // Eliminar el canal después de enviar el mensaje
                    await channel.delete();
                } catch (err) {
                    console.error('Error al eliminar el canal:', err);
                }
            }, 5000);



        } else if (interaction.customId === 'ticketTranscript') {
            const file = await createTranscript(interaction.channel, {
                limit: -1,
                returnBuffer: false,
                filename: `${interaction.channel.name}.html`,
            });

            const msg = await interaction.channel.send({ content: `Tu transcript:`, files: [file] });
            const message = `**Este es tu [ticket transcript](https://mahto.id/chat-exporter?url=${msg.attachments.first()?.url}) del servidor ${interaction.guild.name}!**`;
            await msg.delete().catch(err => {});
            await interaction.reply({ content: message, flags: MessageFlags.Ephemeral });
        }
    },
};
