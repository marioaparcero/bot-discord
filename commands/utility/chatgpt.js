const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chatbot')
        .setDescription('Habla con el bot como si fuera una IA.')
        .addStringOption(option => 
            option.setName('mensaje')
                .setDescription('El mensaje que deseas enviar al bot')
                .setRequired(true)),
    async execute(interaction) {
        const mensaje = interaction.options.getString('mensaje');
        const apiKey = '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'; // Reemplaza con tu clave de API

        try {
            // Llamada a la API de OpenAI
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-3.5-turbo', // Puedes cambiar el modelo según tus necesidades
                    messages: [{ role: 'user', content: mensaje }],
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const respuestaIA = response.data.choices[0].message.content;

            // Respuesta del bot
            await interaction.reply(respuestaIA);
        } catch (error) {
            console.error(error);
            await interaction.reply('Hubo un problema al procesar tu mensaje. Por favor, inténtalo de nuevo más tarde.');
        }
    },
};
