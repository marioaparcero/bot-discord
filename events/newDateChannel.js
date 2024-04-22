const {Events, ButtonBuilder, ActionRowBuilder} = require('discord.js');
const settings = require("../settings");

//Mensaje de bienvenida en chats de texto que sean creados bajo categoria especifica

module.exports = {
    name: Events.ChannelCreate,
    async execute(channel) {
        try {
            if (channel.type === 0 && channel.parentId === settings.parendID) {
                const channelMembers = channel.members.filter(data => {
                    return data.user.bot === false
                })

                const terminarCita = new ButtonBuilder()
                    .setCustomId('amorwatch_terminarCita')
                    .setLabel('Terminar con la cita')
                    .setStyle('Danger')

                const boton = new ActionRowBuilder().addComponents(terminarCita)

                await channel.send({
                    content: `Bienvenidos a su chat privado ${channelMembers.map(data => {
                        return (`<@${data.id}>`)
                    })}, que tengan una bonita cita.`,
                    components: [boton]
                })
            }
        } catch (error) {
            console.error(`Error executing ${channel.commandName}`);
            console.error(error);
        }
    },
};