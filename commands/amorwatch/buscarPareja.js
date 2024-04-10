const {
    SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setDMPermission(false)
        .setName('buscarpareja')
        .setDescription('Busca una posible pareja...'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('Random')
            .setTitle('¡Bienvenido al menú de búsqueda amorosa!')
            .setDescription('¿Que te interesaría buscar hoy?')
            .addFields(
                {name: '¿Hombres?', value: '¿Acaso buscas a algún galán que te arrope en las noches?'},
                {name: '¿Mujeres?', value: '¿O a alguna bella dama con la que compartir hermosos momentos?'},
            ).setImage('https://sm.ign.com/ign_es/screenshot/default/sin-titulo-1_c7z8.jpg')


        const hombres = new ButtonBuilder()
            .setCustomId('hombre')
            .setLabel('Hombres')
            .setStyle(1)

        const mujeres = new ButtonBuilder()
            .setCustomId('mujer')
            .setLabel('Mujeres')
            .setStyle(1)

        const botones = new ActionRowBuilder()
            .addComponents(hombres)
            .addComponents(mujeres)

        await interaction.reply({embeds: [embed], components: [botones], ephemeral: true})
    },
};
