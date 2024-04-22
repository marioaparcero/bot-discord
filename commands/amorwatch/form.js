const {
    SlashCommandBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setDMPermission(false)
        .setName('registrarcitas')
        .setDescription('Registra tu perfil en LoveWatch.'),

    async execute(interaction) {
        const modal = new ModalBuilder()
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

        modal.addComponents(nameInput, edadInput, sexoInput, descInput, hobbieInput);

        await interaction.showModal(modal);
    },
};
