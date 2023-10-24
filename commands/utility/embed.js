const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Descripción de mi comando'),
    async execute(interaction) {
        // Crea el embed
        const mensajeEmbed = new EmbedBuilder()
            .setTitle('Título del Embed')
            .setDescription('Descripción del Embed')
            .setColor('#0099ff')
            .setThumbnail('https://i.imgur.com/wSTFkRM.png')
            .addFields(
                { name: 'Campo 1', value: 'Valor 1', inline: true },
                { name: 'Campo 2', value: 'Valor 2', inline: true },
                { name: '\u200B', value: '\u200B' },
                { name: 'Campo 3', value: 'Valor 3', inline: true },
                { name: 'Campo 4', value: 'Valor 4', inline: true },
            )
            // Otra distribución
            // .addFields(
            //     { name: 'Regular field title', value: 'Some value here' },
            //     { name: '\u200B', value: '\u200B' },
            //     { name: 'Campo 1', value: 'Some value here', inline: true },
            //     { name: 'Campo 2', value: 'Some value here', inline: true },
            // )
            // .addFields({ name: 'Campo 3', value: 'Some value here', inline: true })
            .setImage('https://i.imgur.com/AfFp7pu.png')
            .setTimestamp()
            .setFooter({ text: 'Encuesta creada por el bot de Galaxy Bot', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

        // Enviar el embed al canal
        await interaction.reply({ embeds: [mensajeEmbed] });
       // await channel.send({ embeds: [mensajeEmbed] });
    },
};