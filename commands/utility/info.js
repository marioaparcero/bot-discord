const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('informacion')
        .setDescription('Proporciona más información sobre el servidor y el usuario.'),
    async execute(interaction) {
        const usuario = interaction.user;
        const miembro = await interaction.guild.members.fetch(usuario.id);
        const nombreServidor = interaction.guild.name;
        const cantidadMiembros = interaction.guild.memberCount;

        await interaction.reply(`Hola ${usuario.username}, ¡bienvenido a ${nombreServidor}!`);
        await interaction.followUp(`Aquí tienes algunos detalles sobre el servidor y tú:`);
        await interaction.followUp(`Nombre del Servidor: ${nombreServidor}`);
        await interaction.followUp(`Total de Miembros: ${cantidadMiembros}`);
        await interaction.followUp(`Tu Nombre de Usuario: ${usuario.username}`);
        await interaction.followUp(`Fecha en que te Uniste: ${miembro.joinedAt}`);
    },
};
