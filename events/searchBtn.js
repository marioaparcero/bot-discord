const {Events, EmbedBuilder, ButtonBuilder, ActionRowBuilder} = require('discord.js');
const {MongoClient} = require('mongodb');
const settings = require('../settings')

//Hace una llamada a la base de datos y trae los perfiles que cumplan con la petición (hombre-mujer)
//quita el perfil del usuario y obtiene un perfil random, luego se lo muestra al usuario


module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;
        try {
            if (interaction.customId === 'hombre' || interaction.customId === 'mujer') {
                const client = new MongoClient(settings.dbURL)
                await client.connect()
                const db = client.db(settings.db)
                const collectionUsers = db.collection(settings.colUsers)

                const getHoursDiff = (startTime, endTime) => {
                    const diff = Math.abs(endTime - startTime);
                    return Math.floor(diff / (1000 * 60 * 60));
                }
                const now = new Date();
                const userRecord = await collectionUsers.findOne({userId: interaction.user.id});

                if (userRecord || userRecord.lastExecutionTime) {
                    const lastExecutionTime = new Date(userRecord.lastExecutionTime);
                    const hoursDiff = getHoursDiff(lastExecutionTime, now);
                    await collectionUsers.updateOne({userId: interaction.user.id}, {$set: {lastExecutionTime: now}}, {upsert: true});

                    if (hoursDiff < 24) {
                        const remainingHours = 24 - hoursDiff;
                        await interaction.reply({
                            content: `Debes esperar ${remainingHours} horas antes de poder ejecutar este comando nuevamente.`,
                            ephemeral: true
                        });
                        return;
                    }
                }

                const res = await collectionUsers.find({sexoInput: interaction.customId}).toArray()
                const finalArr = res.filter(user => {
                    return user.userId !== interaction.user.id
                })

                if (finalArr.length >= 1) {
                    const randomNumber = Math.floor(Math.random() * finalArr.length)
                    const selectedUser = finalArr[res.length === 1 ? 0 : randomNumber]

                    const embed = new EmbedBuilder()
                        .setColor('Random')
                        .setTitle(selectedUser.nameInput)
                        .addFields(
                            {name: 'Nombre', value: selectedUser.nameInput},
                            {name: 'Edad', value: selectedUser.edadInput},
                            {name: 'Sexo', value: selectedUser.sexoInput},
                            {name: 'Descripción', value: selectedUser.descInput},
                            {name: 'Hobbies', value: selectedUser.hobbiesInput},
                        )

                    const meInteresa = new ButtonBuilder()
                        .setCustomId(`pedirCita_${selectedUser.userId}_${interaction.user.id}`)
                        .setLabel('Pedir una cita!')
                        .setStyle(1)

                    const boton = new ActionRowBuilder().addComponents(meInteresa)

                    await interaction.reply({
                        embeds: [embed],
                        components: [boton],
                        ephemeral: true
                    })

                } else {
                    await interaction.reply({
                        content: 'No hemos encontrado una posible pareja para ti, pero no te desanimes, ¡el amor puede llegar cuando uno menos se lo espera!',
                        ephemeral: true
                    })
                }
            }

        } catch (error) {
            console.error(`Error executing ${interaction.commandName}`);
            console.error(error);
        }
    },
};
