const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('antiguedad')
        .setDescription('Muestra tu antigüedad en el servidor o la de un miembro mencionado')
        .addUserOption(option => option.setName('usuario').setDescription('Opcional: El usuario del cual mostrar la antigüedad')),
    async execute(interaction) {
        let member = interaction.options.getMember('usuario') || interaction.member;

        const joinDate = member.joinedAt;

        const currentDate = new Date();
        const difference = currentDate - joinDate;

        const years = Math.floor(difference / (1000 * 60 * 60 * 24 * 365));
        const months = Math.floor((difference % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
        const days = Math.floor((difference % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        const response = `¡Hola, ${member.user.tag}! Has estado en el servidor durante ${years} años, ${months} meses, ${days} días, ${hours} horas, ${minutes} minutos y ${seconds} segundos. ¡Yey!`;

        await interaction.reply(response);
    },
};
