const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chiste')
        .setDescription('Envía un chiste para alegrar el día.'),
    async execute(interaction) {
        const chistes = [
            '¿Por qué los pájaros no usan Facebook? Porque ya tienen Twitter.',
            '¿Cuál es el animal más antiguo? La cebra, porque está en blanco y negro.',
            '¿Sabes cuál es el colmo de un electricista? No encontrar su corriente de trabajo.',
            '¿Qué le dice una iguana a su hermana gemela? Somos iguanitas.',
            '¿Por qué los esqueletos no pelean entre ellos? Porque no tienen agallas.',
        ];

        const chisteAleatorio = chistes[Math.floor(Math.random() * chistes.length)];

        await interaction.reply(chisteAleatorio);
    },
};
