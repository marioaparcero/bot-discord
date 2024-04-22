const {Events, ChannelType, PermissionsBitField} = require('discord.js');
const settings = require("../settings");
const {MongoClient} = require("mongodb");

// Obtiene ID del usuario al que se le envia la petición de cita una vez se acepta la cita
// Luego busca la información de los 2 usuarios para luego busca en la base de datos su perfil
// para añadir la id del otro usuario a su lista de matchs

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;
        try {
            if (interaction.customId.includes('aceptarCitaBtn')) {
                const splitterID = interaction.customId.split('_')
                //usuario que envía la petición de cita
                const userDatingID = splitterID[1]
                const user1 = await interaction.client.users.fetch(userDatingID);
                //usuario que recibe la petición de cita
                const userDatedID = interaction.user.id
                const user2 = await interaction.client.users.fetch(userDatedID);
                const guild = await interaction.client.guilds.fetch(settings.guildId);
                const client = new MongoClient(settings.dbURL)

                await client.connect()
                const db = client.db(settings.db)
                const collection = db.collection(settings.colUsers)
                const user_1 = await collection.findOne({userId: `${user1.id}`})
                const user_2 = await collection.findOne({userId: `${user2.id}`})

                ///Refactorizar este código para mayor legibilidad (hasta línea 43)
                const addMatch = async (user, user2) => {
                    const alreadyMatched = user.matchs.includes(user2.userId)

                    if (!alreadyMatched && user2.userId !== user.userId) {
                        user.matchs.push(user2.userId)
                        await collection.updateOne({userId: user.userId}, {$set: {matchs: user.matchs}})
                    }
                }

                await addMatch(user_1, user_2)

                await addMatch(user_2, user_1)

                await guild.channels.create({
                    name: `Cita-${user1.globalName}-${user2.globalName}`,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone,
                            deny: [PermissionsBitField.Flags.ViewChannel]
                        },
                        {
                            id: user1.id,
                            allow: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: user2.id,
                            allow: [PermissionsBitField.Flags.ViewChannel],
                        },
                    ],
                    parent: settings.parendID
                });

                await interaction.reply({
                    content: `Creando chat para tu cita con ${user1.globalName}...`
                })

            }
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}`);
            console.error(error);
        }
    },
};