const {Events, ChannelType, PermissionsBitField, ButtonBuilder, ActionRowBuilder} = require('discord.js');
const {MongoClient} = require("mongodb");
const settings = require("../settings");


module.exports = {
    name: Events.ChannelCreate,
    async execute(channel) {
        try {
            if (channel.type === 0) {
                // const client = new MongoClient(settings.dbURL)
                // const db = client.db(settings.db)
                // const collectionMatches = db.collection(settings.colMatchs)
                // await client.connect()

                const channelMembers = channel.members.filter(data => {
                    return data.user.bot === false
                })

                // const user1Matches = collectionMatches.findOne({userId: channelMembers.id})

                // console.log("user: ", channelMembers)
                // console.log('///////////////////')

                const terminarCita = new ButtonBuilder()
                    .setCustomId('amorwatch_terminarCita')
                    .setLabel('Terminar con la cita')
                    .setStyle('Danger')

                const boton = new ActionRowBuilder().addComponents(terminarCita)

                await channel.send({
                    content: `Bienvenidos a su chat privado ${channelMembers.map(data => {
                        return (`<@${data.id}>`)
                    })}`,
                    components: [boton]
                })
            }
        } catch (error) {
            console.error(`Error executing ${channel.commandName}`);
            console.error(error);
        }
    },
};