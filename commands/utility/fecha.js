const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fecha')
        .setDescription('Convierte una fecha al formato especial.')
        .addStringOption(option =>
            option.setName('fecha')
                .setDescription('Introduce una fecha en formato DD-MM-YYYY.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('hora')
                .setDescription('Introduce una hora en formato HH:MM (opcional).')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('privado')
                .setDescription('Si quieres que la respuesta sea privada')
                .addChoices(
                    {
                        name: "Sí",
                        value: "si",
                    },
                    {
                        name: "No",
                        value: "no",
                    }
                )
        ),
    async execute(interaction) {
        // Obtén la fecha introducida por el usuario
        const fechaInput = interaction.options.getString('fecha');
        const horaInput = interaction.options.getString('hora');
        const privadoInput = interaction.options.getString('privado');

        // Valida si la fecha es válida (debes implementar tu propia validación)
        const fechaValida = validarFecha(fechaInput);
        // Valida si la hora es válida (debes implementar tu propia validación)
        const horaValida = validarHora(horaInput);

        if (horaInput && !horaValida) {
            await interaction.reply('La hora introducida no es válida.');
            return;
        }
        
        if (!fechaValida) {
            await interaction.reply('La fecha introducida no es válida.');
            return;
        }
        
        // Convierte la fecha y hora al formato deseado
        const fechaUnix = convertirAFechaUnix(fechaInput, horaInput);
        //console.log(fechaUnix)

        // Formatea la fecha y hora en el formato deseado "<t:1696439916>"
        const formatoFechaHora = `<t:${fechaUnix}>`;

        //  Para hacer un mensaje efímero
        //  await interaction.reply(`hola`); //en el formato deseado
        //  await interaction.reply({content:`hola`, ephemeral: true}); //en el formato deseado

        // Envía la respuesta al usuario (Ephemeral)
        await interaction.reply({content: `## __La fecha y hora__ es: ${formatoFechaHora}\n- **Código**: \`\`\`<t:${fechaUnix}>\`\`\``, ephemeral: privadoInput === 'si'}); //en el formato deseado
    },
};


// Función para validar si la fecha es válida (puedes personalizarla)
function validarFecha(fecha) {
    // Expresión regular para validar el formato "DD-MM-YYYY"
    const regexFecha = /^\d{2}-\d{2}-\d{4}$/;

    if (!regexFecha.test(fecha)) {
        return false; // El formato es incorrecto
    }

    // Extrae los componentes de la fecha
    const [dia, mes, anio] = fecha.split('-');
    
    // Convierte los componentes a números enteros
    const diaInt = parseInt(dia, 10);
    const mesInt = parseInt(mes, 10);
    const anioInt = parseInt(anio, 10);
    
    

    // Valida el rango de los componentes de la fecha
    if (
        isNaN(anioInt) ||
        isNaN(mesInt) ||
        isNaN(diaInt) ||
        anioInt < 1000 || // Puedes ajustar este límite
        anioInt > 9999 || // Puedes ajustar este límite
        mesInt < 1 || mesInt > 12 ||
        diaInt < 1 || diaInt > 31
    ) {
        return false; // Alguno de los componentes está fuera de rango
    }

    // Puedes agregar validaciones adicionales si es necesario,
    // como verificar que el mes no sea mayor a 12, o que el día no sea mayor al número de días en ese mes.

    return true; // La fecha es válida
}

// Función para validar y convertir una fecha en formato DD-MM-YYYY a formato Unix
function convertirAFechaUnix(fecha, hora) {
    const [dia, mes, anio] = fecha.split('-');
    let fechaUnix = new Date(anio, mes - 1, dia).getTime() / 1000; // Divide por 1000 para obtener segundos en lugar de milisegundos

    if (hora) {
        const [hh, mm] = hora.split(':');
        fechaUnix += hh * 3600 + mm * 60; // Suma las horas en segundos y los minutos en segundos
    }

    return fechaUnix; //1696439916
}

// Función para validar si la hora es válida (puedes personalizarla)
function validarHora(hora) {
    // Expresión regular para validar el formato "HH:MM"
    const regexHora = /^([01]\d|2[0-3]):([0-5]\d)$/;

    return hora ? regexHora.test(hora) : true;
}
