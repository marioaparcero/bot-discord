const {
    SlashCommandBuilder,
    EmbedBuilder,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setDMPermission(false)
        .setName('infocitas')
        .setDescription('Información sobre como funcionan las citas.'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('Random')
            .setTitle('Bienvenido a Amorwatch!')
            .setDescription('Esperemos que puedas encontrar a esa personita especial pronto!')
            .addFields(
                {name: '/registrarcitas', value: 'Primero debes registrarte con este comando.'},

                {name: '/buscarpareja', value: 'Usa este comando para abrir el menú de búsqueda de parejas'}, {
                    name: 'Cosas a tener en cuenta',
                    value: '* Solo podrás buscar a una persona por día'
                }, {
                    name: '\u200B',
                    value: '* Al crear tu cuenta se te otorgará un rol específico como participante en amorwatch'
                }
            ).setImage('https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/c4e3493f-9c2d-44c0-8717-5a51ecea2821/dgukdsz-843ec6f0-a5c4-4a19-a7b9-dd69fee298a8.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2M0ZTM0OTNmLTljMmQtNDRjMC04NzE3LTVhNTFlY2VhMjgyMVwvZGd1a2Rzei04NDNlYzZmMC1hNWM0LTRhMTktYTdiOS1kZDY5ZmVlMjk4YTgucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.DvgoO7CPBaYsi9kgU74L8CYBzNbhFxY2o_nta4IuqQ4')

        await interaction.reply({embeds: [embed], ephemeral: true})
    },
};


