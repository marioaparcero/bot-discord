const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('temporizador')
        .setDescription('Establece un temporizador para que el bot te recuerde algo.')
        .addStringOption(option =>
            option.setName('tiempo')
                .setDescription('El tiempo en formato HH:MM:SS')
                .setRequired(true)),
    async execute(interaction) {
        const tiempo = interaction.options.getString('tiempo');

        // Dividir el tiempo en horas, minutos y segundos
        const [horas, minutos, segundos] = tiempo.split(':').map(Number);

        // Validar que las partes del tiempo sean números y estén en el rango correcto
        if (isNaN(horas) || isNaN(minutos) || isNaN(segundos) || horas < 0 || minutos < 0 || segundos < 0 || minutos >= 60 || segundos >= 60) {
            return interaction.reply({ content: 'Formato inválido. Usa HH:MM:SS, donde MM y SS deben ser menores a 60.', ephemeral: true });
        }

        // Convertir todo el tiempo a milisegundos
        const tiempoEnMilisegundos = (horas * 3600 + minutos * 60 + segundos) * 1000;

        await interaction.reply(`El temporizador se ha establecido en **${horas}:${minutos}:${segundos}**. ¡Te recordaré en breve! ⏳`);

        setTimeout(() => {
            interaction.followUp(`¡Es hora! Han pasado **${horas}:${minutos}:${segundos}**.`);
        }, tiempoEnMilisegundos);
    },
};
