const {Events, EmbedBuilder, ButtonBuilder, ActionRowBuilder} = require('discord.js');
const {MongoClient} = require("mongodb");
const settings = require("../settings");


module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;
        try {
            if (interaction.customId.includes('pedirCita')) {

                const client = new MongoClient(settings.dbURL)
                await client.connect()
                const db = client.db(settings.db)
                const collectionUsers = db.collection(settings.colUsers)

                const splitedId = interaction.customId.split('_')
                //usuario que recibe la petición de cita
                const userDatedID = splitedId[1]
                const userDatedInfo = await interaction.client.users.fetch(userDatedID);
                //usuario que envía la petición de cita
                const userDatingID = splitedId[2]
                const userDatingInfo = await interaction.client.users.fetch(userDatingID);

                const datingUserInfo = await collectionUsers.findOne({userId: userDatingID})

                const embed = new EmbedBuilder()
                    .setColor('Random')
                    .setTitle(datingUserInfo.nameInput)
                    .setDescription('Posible descripción corta')
                    .addFields(
                        {name: 'Nombre', value: datingUserInfo.nameInput},
                        {name: 'Edad', value: datingUserInfo.edadInput},
                        {name: 'Sexo', value: datingUserInfo.sexoInput},
                        {name: 'Descripción', value: datingUserInfo.descInput},
                        {name: 'Hobbies', value: datingUserInfo.hobbiesInput},
                    )

                const aceptarCita = new ButtonBuilder()
                    .setCustomId(`aceptarCitaBtn_${userDatingID}`)
                    .setLabel('Aceptar cita')
                    .setStyle(1)
          
                const boton = new ActionRowBuilder().addComponents(aceptarCita)

                await interaction.reply({
                    content: 'Un momento por favor, estamos enviando la solicitud de cita',
                    ephemeral: true
                })

                // Luego descomentar

                // await userDatedInfo.send({
                //     content: `<@${userDatingID}> Se ha fijado en ti!`,
                //     embeds: [embed],
                //     components: [boton],
                // });

                await userDatingInfo.send({
                    content: `Hemos notificado a <@${userDatedID}> de tu interés, si acepta la cita se te notificará y crearemos un chat para ustedes, ¡suerte!`,
                    components: [boton],
                });

            }
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}`);
            console.error(error);
        }
    },
};