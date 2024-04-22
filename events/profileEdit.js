const {Events} = require('discord.js');
const {MongoClient} = require('mongodb');
const settings = require('../settings')

//Recibe los datos del modal de actualización de algún campo del perfil de citas y actualiza los datos

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isModalSubmit()) return;
        try {
            if (interaction.customId === 'updateModal') {
                const client = new MongoClient(settings.dbURL)
                await client.connect()
                const db = client.db(settings.db)
                const collection = db.collection(settings.colUsers)

                const updatedField = (field) => {
                    switch (field) {
                        case 'descInput':
                            return 'Descripción '
                        case 'hobbiesInput':
                            return 'Hobbies '
                    }
                }

                await collection.updateOne({userId: interaction.user.id}, {$set: {[interaction.fields.components[0].components[0].customId]: interaction.fields.components[0].components[0].value}})

                await interaction.reply({
                    content: `Campo "${updatedField(interaction.fields.components[0].components[0].customId)}" actualizado...`,
                    ephemeral: true
                })
            }
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}`);
            console.error(error);
        }
    },
};
