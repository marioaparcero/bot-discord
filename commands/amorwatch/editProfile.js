const {
    SlashCommandBuilder, EmbedBuilder, ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} = require('discord.js');
const {MongoClient} = require("mongodb");
const settings = require("../../settings");

module.exports = {
    data: new SlashCommandBuilder()
        .setDMPermission(false)
        .setName('actualizarperfil')
        .setDescription('Actualiza tu perfil de LoveWatch'),

    async execute(interaction) {
        const client = new MongoClient(settings.dbURL)
        await client.connect()
        const db = client.db(settings.db)
        const collectionUsers = db.collection(settings.colUsers)
        const user = await collectionUsers.findOne({userId: interaction.user.id})


        const embed = new EmbedBuilder()
            .setColor('Random')
            .setTitle('Tu perfil actual')
            .addFields(
                {name: 'Nombre', value: user.nameInput},
                {name: 'Edad', value: user.edadInput},
                {name: 'Sexo', value: user.sexoInput},
                {name: 'Descripción', value: user.descInput},
                {name: 'Hobbies', value: user.hobbiesInput},
            )

        const select = new StringSelectMenuBuilder()
            .setCustomId('fieldEditMenu')
            .setPlaceholder('Elije el campo a editar')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Descripción')
                    .setValue('desc'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Hobbies')
                    .setValue('hobbies'),
            );

        const row = new ActionRowBuilder().addComponents(select)

        await interaction.reply({
            embeds: [embed],
            content: 'Seleccione el campo que desea actualizar',
            components: [row],
            ephemeral: true,
            lifetime: 10000
        })
    },
};
