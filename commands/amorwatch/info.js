const {
    SlashCommandBuilder,
    EmbedBuilder,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setDMPermission(false)
        .setName('infocitas')
        .setDescription('Información sobre como funcionan las citas.'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('Random')
            .setTitle('Bienvenido a LoveWatch!')
            .setDescription('Esperemos que puedas encontrar a esa personita especial pronto!')
            .addFields(
                {
                    name: '/registrarcitas',
                    value: 'Primero debes registrarte con este comando.'
                },
                {
                    name: '/buscarpareja',
                    value: 'Usa este comando para abrir el menú de búsqueda de parejas'
                },
                {
                    name: 'Cosas a tener en cuenta',
                    value: '* Solo podrás buscar a una persona por día'
                },
                {
                    name: '\u200B',
                    value: '* Al crear tu cuenta se te otorgará un rol específico como participante en amorwatch'
                }
            ).setImage('https://bnetcmsus-a.akamaihd.net/cms/page_media/8e/8E77P32J7NLQ1675992201986.png')

        await interaction.reply({
            embeds: [embed], ephemeral: true
        })
    },
};