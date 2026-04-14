//Quiero un comando que haga salir a los usuarios

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('salir')
        .setDescription('Hace salir a los usuarios del canal de voz.'),
    async execute(interaction) {
        const member = interaction.member;
        if (member.voice.channel) {
            await member.voice.kick();
            await interaction.reply('¡Has salido del canal de voz!');
        } else {
            await interaction.reply('¡No estás en un canal de voz!');
        }                           
    },
};
