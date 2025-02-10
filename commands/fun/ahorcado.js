const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ahorcado')
        .setDescription('Juega una partida de Ahorcado con el bot.')
        .addStringOption(option =>
            option.setName('palabra')
                .setDescription('Escribe una palabra para que otros adivinen.')
                .setRequired(true)),

    async execute(interaction) {
        // Obtenemos la palabra secreta ingresada por el usuario
        const palabraSecreta = interaction.options.getString('palabra').toLowerCase();

        // Generamos la pista con los guiones bajos
        const palabraOculta = '_'.repeat(palabraSecreta.length);

        // Enviamos el mensaje al canal
        await interaction.reply(`¡Juego de Ahorcado iniciado! La palabra tiene **${palabraSecreta.length}** letras. Aquí está tu pista: \`${palabraOculta}\``);
    },
};
