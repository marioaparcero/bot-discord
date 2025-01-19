const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cita')
        .setDescription('Envía una cita inspiradora.'),
    async execute(interaction) {
        const citas = [
            '“El único modo de hacer un gran trabajo es amar lo que haces.” – Steve Jobs',
            '“La vida es lo que pasa mientras estás ocupado haciendo otros planes.” – John Lennon',
            '“No te rindas, cada fracaso es una lección.” – Oprah Winfrey',
            '“La felicidad no es algo hecho. Viene de tus propias acciones.” – Dalai Lama',
            '“Haz lo que puedas, con lo que tengas, donde estés.” – Theodore Roosevelt',
        ];

        const citaAleatoria = citas[Math.floor(Math.random() * citas.length)];

        await interaction.reply(citaAleatoria);
    },
};
