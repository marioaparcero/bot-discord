// Hazme un comando de chiste para overwatch randomes
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chiste')
        .setDescription('Te cuenta un chiste de Overwatch al azar.'),
    async execute(interaction) {
        const chistes = [
            '¿Por qué Tracer no puede usar el microondas? Porque siempre está en movimiento.',
            '¿Qué le dijo Reaper a su novia? "Eres mi alma gemela".',
            '¿Por qué Winston no puede jugar al escondite? Porque siempre se encuentra a sí mismo.',
            '¿Qué le dijo Genji a su hermano? "Eres un ninja de pacotilla".',
            '¿Por qué Mei no puede jugar al fútbol? Porque siempre se congela en el campo.',
            '¿Qué le dijo D.Va a su mech? "Eres mi mejor amigo, pero a veces me haces sentir como un piloto de juguete".',
        ];
        const chisteRandom = chistes[Math.floor(Math.random() * chistes.length)];
        await interaction.reply(chisteRandom);
    }
};