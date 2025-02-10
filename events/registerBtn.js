const {Events, EmbedBuilder, ButtonBuilder, TextInputBuilder, ModalBuilder, ActionRowBuilder} = require('discord.js');
const {MongoClient} = require('mongodb');
const settings = require('../settings')

//Hace una llamada a la base de datos y trae los perfiles que cumplan con la petición (hombre-mujer)
//quita el perfil del usuario y obtiene un perfil random, luego se lo muestra al usuario


module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;
        // if (!interaction.isModalSubmit()) return;
        try {
            if (interaction.customId === 'registerBtn') {
                // Construimos el Modal
                    const modalRegister = new ModalBuilder()
                    .setCustomId('registerModal')
                    .setTitle('Registro de tu perfil en "LoveWatch"');
        
                const name = new TextInputBuilder()
                    .setCustomId('nameInput')
                    .setLabel("Cual es tu nombre?")
                    .setStyle('Short')
                    .setMaxLength(15)
                    .setMinLength(3)
                    .setRequired(true)
        
                const edad = new TextInputBuilder()
                    .setCustomId('edadInput')
                    .setLabel('Fecha de Nacimiento (dd/mm/yyyy)')
                    .setStyle('Short')
                    .setMaxLength(10)
                    .setRequired(true)
        
                const sexo = new TextInputBuilder()
                    .setCustomId('sexoInput')
                    .setLabel('Sexo ( HOMBRE/MUJER )')
                    .setStyle('Short')
                    .setRequired(true)
        
                const descripcion = new TextInputBuilder()
                    .setCustomId('descInput')
                    .setLabel('Breve descripción')
                    .setStyle('Paragraph')
                    .setRequired(true)
                    .setMaxLength(150)
        
                const hobbies = new TextInputBuilder()
                    .setCustomId('hobbiesInput')
                    .setLabel("Cual es tu hobbie favorito?")
                    .setStyle('Paragraph')
                    .setMaxLength(150)
        
                const nameInput = new ActionRowBuilder().addComponents(name);
                const edadInput = new ActionRowBuilder().addComponents(edad);
                const sexoInput = new ActionRowBuilder().addComponents(sexo);
                const descInput = new ActionRowBuilder().addComponents(descripcion);
                const hobbieInput = new ActionRowBuilder().addComponents(hobbies);
        
                modalRegister.addComponents(nameInput, edadInput, sexoInput, descInput, hobbieInput);
                await interaction.showModal(modalRegister);

                // Realizamos la conexión a la base de datos y guardamos los datos del usuario en el modal
                const client = new MongoClient(settings.dbURL)
                await client.connect()
                const db = client.db(settings.db)
                const collection = db.collection(settings.colUsers)
                const res = await collection.findOne({ userId: `${interaction.user.id}` })

                const edadrgx = /^(0?[1-9]|1[0-9]|2[0-9]|3[01])\/(0?[1-9]|1[0-2])\/(19\d{2}|20(?:0\d|1[0-9]|2[0-2]))$/
                const sexoRgx = /^(hombre|mujer)$/

                if (!res) {
                    const userResponse = { userId: interaction.user.id, matchs: [] }
                    if (interaction.fields !== undefined) {
                        for (const item of interaction.fields.components) {
                            const component = item.components[0];
                            if (component.customId === 'edadInput') {
                                if (!edadrgx.test(component.value)) {
                                    await interaction.reply({
                                        content: 'Formato de fecha de nacimiento incorrecta',
                                        ephemeral: true,
                                        lifetime: 10000
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
                    }

                } else {
                    await interaction.reply({
                        content: 'Ya tienes un perfil registrado a tu cuenta!', ephemeral: true
                    });
                }


            }
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}`);
            console.error(error);
        }
    },
};
