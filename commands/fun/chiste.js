const { SlashCommandBuilder } = require('discord.js');

// Lista de chistes
const chistes = [
    "¿Por qué los pájaros no usan Facebook? Porque ya tienen Twitter.",
    "¿Cómo se llama un campeón de buceo japonés? Tokofondo.",
    "¿Por qué el libro de matemáticas está triste? Porque tenía demasiados problemas.",
    "¿Qué le dijo un gusano a otro gusano? ¡Voy a dar una vuelta a la manzana!",
    "¿Qué hace una abeja en el gimnasio? ¡Zum-ba!",
    "¿Por qué los esqueletos no pelean entre ellos? Porque no tienen agallas.",
    "¿Cuál es el café más peligroso del mundo? El ex-preso.",
    "Estás obsesionado con el fútbol, ¡deberías ver a un psiquiatra! No entiendo nada... ¡Si no veo fútbol!",
    "Si los zombies se deshacen, ¿deberían llamarlos deszombificados?",
    "¿Qué le dice una iguana a su hermana gemela? Somos iguanitas.",
    "¿Por qué el tomate no toma café? Porque ya está en salsa.",
    "Estás más perdido que un pulpo en un garaje.",
    "¿Cómo maldice un pollito a otro pollito? ¡Cal-dito seas!",
    "¿Qué le dice una nube a otra nube? ¡Nos vemos cuando estemos más desinfladas!",
    "¿Por qué el libro de historia no tiene novia? Porque estaba muy anticuado.",
    "¿Qué le dijo una lámpara a otra lámpara? ¡Tú eres mi media luz!",
    "¿Cómo se llama el campeón de los autos de carreras? Car-licious.",
    "¿Qué le dice una hoja a otra hoja? ¡Nos vemos cuando se caiga!",
    "¿Por qué los peces no hablan? Porque se les cortó la lengua.",
    "¿Cómo se llama un perro sin patas? No importa cómo lo llames, no va a venir.",
    "¿Cuál es el colmo de un electricista? No encontrar su corriente de trabajo.",
    "¿Qué hace una vaca cuando sale el sol? Sombra.",
    "¿Qué le dice una vaca a otra vaca? ¿Tú qué tal?",
    "¿Qué le dijo un semáforo a otro semáforo? No me mires, me estoy cambiando.",
    "¿Cómo se llama un perro que hace magia? Un labracadabrador.",
    "¿Cómo se dice pañuelo en japonés? Saka-moko.",
    "¿Cuál es el café más peligroso del mundo? El ex-preso.",
    "¿Qué hace una abeja en el gimnasio? ¡Zum-ba!",
    "¿Por qué los esqueletos no pelean entre ellos? Porque no tienen agallas.",
    "¿Cuál es el colmo de un electricista? No encontrar su corriente de trabajo.",
    "¿Qué le dice un gusano a otro gusano? ¡Voy a dar una vuelta a la manzana!",
    "¿Por qué el libro de matemáticas está triste? Porque tenía demasiados problemas.",
    "¿Cómo se llama un campeón de buceo japonés? Tokofondo.",
    "¿Por qué los pájaros no usan Facebook? Porque ya tienen Twitter.",
    "¿Qué le dijo un gusano a otro gusano? ¡Voy a dar una vuelta a la manzana!",
    "¿Qué hace una abeja en el gimnasio? ¡Zum-ba!",
    "¿Por qué los esqueletos no pelean entre ellos? Porque no tienen agallas.",
    "¿Cuál es el café más peligroso del mundo? El ex-preso.",
    "Estás obsesionado con el fútbol, ¡deberías ver a un psiquiatra! No entiendo nada... ¡Si no veo fútbol!",
    "Si los zombies se deshacen, ¿deberían llamarlos deszombificados?",
    "¿Qué le dice una iguana a su hermana gemela? Somos iguanitas.",
    "¿Por qué el tomate no toma café? Porque ya está en salsa.",
    "Estás más perdido que un pulpo en un garaje.",
    "¿Cómo maldice un pollito a otro pollito? ¡Cal-dito seas!",
    "¿Qué le dice una nube a otra nube? ¡Nos vemos cuando estemos más desinfladas!",
    "¿Por qué el libro de historia no tiene novia? Porque estaba muy anticuado."
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chistes')
        .setDescription('Te cuento un chiste aleatorio.')
        .addIntegerOption(option =>
            option.setName('cantidad')
                .setDescription('Número de chistes a contar')
                .setRequired(false)
                .setChoices(
                    { name: '1', value: 1 },
                    { name: '3', value: 3 }
                )
        ),

    async execute(interaction) {
        // Obtener la cantidad de chistes solicitados
        const cantidad = interaction.options.getInteger('cantidad') || 1; // Por defecto es 1 chiste

        if (cantidad === 3) {
            // Si el usuario pide 3 chistes, se responde con el mensaje personalizado
            await interaction.reply('¿Te crees quién soy, una IA? Solo puedo contarte un chiste, no tres.');
        } else {
            // Si el usuario pide 1 chiste, el bot responderá con un chiste aleatorio
            const randomChiste = chistes[Math.floor(Math.random() * chistes.length)];
            await interaction.reply(randomChiste);
        }
    },
};
