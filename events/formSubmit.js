const {Events} = require('discord.js');
const {MongoClient} = require('mongodb');
const settings = require('../settings')

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isModalSubmit()) return;
        try {
            const client = new MongoClient(settings.dbURL)

            if (interaction.customId === 'myModal') {
                await client.connect()
                const db = client.db(settings.db)
                const collection = db.collection(settings.colUsers)
                const res = await collection.findOne({userId: `${interaction.user.id}`})

                const edadrgx = /^(0?[1-9]|1[0-9]|2[0-9]|3[01])\/(0?[1-9]|1[0-2])\/(19\d{2}|20(?:0\d|1[0-9]|2[0-2]))$/
                const sexoRgx = /^(hombre|mujer)$/

                if (!res) {
                    const userResponse = {userId: interaction.user.id}

                    for (const item of interaction.fields.components) {
                        const component = item.components[0];
                        if (component.customId === 'edadInput') {

                            if (!edadrgx.test(component.value)) {
                                await interaction.reply({
                                    content: 'Formato de fecha de nacimiento incorrecta',
                                    ephemeral: true
                                });
                                return;
                            }
                        }

                        if (component.customId === 'sexoInput') {
                            const sexoInputLC = component.value.toLowerCase()
                            if (!sexoRgx.test(component.value)) {
                                await interaction.reply({
                                    content: 'Debes escribir correctamente si eres "Hombre" o "Mujer"',
                                    ephemeral: true
                                })
                                return
                            }
                            userResponse[component.customId] = sexoInputLC
                        } else {
                            userResponse[component.customId] = component.value
                        }
                    }


                    await collection.insertOne(userResponse)

                    await interaction.reply({
                        content: 'Has registrado tu perfil de citas correctamente!',
                        ephemeral: true
                    });

                } else {
                    await interaction.reply({content: 'Ya tienes un perfil registrado a tu cuenta!', ephemeral: true});
                }
            }
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}`);
            console.error(error);
        }
    },
};
