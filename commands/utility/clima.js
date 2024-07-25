const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clima')
        .setDescription('Muestra el clima actual en una ciudad específica.')
        .addStringOption(option =>
            option.setName('ciudad')
                .setDescription('Nombre de la ciudad')
                .setRequired(true)),
    async execute(interaction) {
        const ciudad = interaction.options.getString('ciudad');
        const apiKey = '09c573c4ef4f3fb6a42781fb19fd2653'; // Reemplaza esto con tu propia API key

        // Importa node-fetch dinámicamente
        const fetch = (await import('node-fetch')).default;

        const url = `http://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${apiKey}&units=metric&lang=es`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.cod !== 200) {
                await interaction.reply(`No se pudo encontrar información del clima para ${ciudad}. Por favor, verifica el nombre de la ciudad e inténtalo de nuevo.`);
                return;
            }

            const clima = data.weather[0].description;
            const temperatura = data.main.temp;
            const sensacionTermica = data.main.feels_like;
            const humedad = data.main.humidity;

            await interaction.reply(`El clima actual en ${ciudad} es el siguiente:
- Clima: ${clima}
- Temperatura: ${temperatura}°C
- Sensación Térmica: ${sensacionTermica}°C
- Humedad: ${humedad}%`);

        } catch (error) {
            console.error(error);
            await interaction.reply('Ocurrió un error al intentar obtener la información del clima. Por favor, inténtalo más tarde.');
        }
    },
};
