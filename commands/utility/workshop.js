const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('workshop')
        .setDescription('Códigos de la Workshop!')
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('Obtener información sobre un código específico')
                .addStringOption(option =>
                    option
                        .setName('nombre')
                        .setDescription('Nombre del código')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('compartir')
                .setDescription('Compartir un código de la workshop')
                .addStringOption(option =>
                    option
                        .setName('nombre')
                        .setDescription('Nombre del código')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('descripcion')
                        .setDescription('Descripción del código')
                        .setRequired(true)
                )
        ),
        //.addSubcommand(subcommand =>
            //subcommand
                //.setName('delete')
                //.setDescription('Eliminar una workshop')
                //.addStringOption(option =>
                    //option
                        //.setName('nombre')
                        //.setDescription('Nombre del código')
                        //.setRequired(true)
               //)
        //)
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'info') {
            const codigoNombre = interaction.options.getString('nombre');

            const codigoInfo = obtenerInformacionCodigo(codigoNombre);

            if (codigoInfo) {
                return interaction.reply(`Información de "${codigoNombre}": ${codigoInfo}`);
            } else {
                return interaction.reply(`No se encontró información para el código "${codigoNombre}".`);
            }
        } else if (subcommand === 'compartir') {
            const codigoNombre = interaction.options.getString('nombre');
            const codigoDescripcion = interaction.options.getString('descripcion');

            compartirCodigo(codigoNombre, codigoDescripcion);

            return interaction.reply(`¡El código "${codigoNombre}" ha sido compartido con éxito!`);
        } else {
            let response = '';

			// Agrega aquí los códigos de la workshop de Overwatch
			response += obtenerCodigosDesdeArchivo();

            // // Agrega aquí los códigos de la workshop de Overwatch
            // response += 'Código 1: [Descripción del código 1]\n';
            // response += 'Código 2: [Descripción del código 2]\n';
            // response += 'Código 3: [Descripción del código 3]\n';

            return interaction.reply(response);
        }
    },
};

const fs = require('fs');

function obtenerInformacionCodigo(nombreCodigo) {
    // Lee el archivo JSON con los códigos
    let data = fs.readFileSync('codigos.json');
    let codigos = JSON.parse(data);

    // Busca el código con el nombre especificado
    const codigoEncontrado = codigos.find(codigo => codigo.nombre === nombreCodigo);

    if (codigoEncontrado) {
        return codigoEncontrado.descripcion;
    } else {
        return null; // Si no se encuentra información para el código
    }
}


// function obtenerInformacionCodigo(nombreCodigo) {
//     // Implementa tu lógica para obtener la información del código
//     // Puedes acceder a una base de datos, un archivo o cualquier fuente de información

//     // Ejemplo de información estática para el código "Código 1"
//     if (nombreCodigo === 'Código 1') {
//         return 'Este código permite la creación de un modo de juego de disparos rápidos.';
//     }

//     // Ejemplo de información estática para el código "Código 2"
//     if (nombreCodigo === 'Código 2') {
//         return 'Con este código, los jugadores pueden competir en un torneo de duelo.';
//     }

//     // Ejemplo de información estática para el código "Código 3"
//     if (nombreCodigo === 'Código 3') {
//         return 'Este código crea un modo de juego de defensa de la base contra oleadas de enemigos.';
//     }

//     return null; // Si no se encuentra información para el código
// }

function compartirCodigo(nombreCodigo, descripcionCodigo) {
    // Define el objeto de código a guardar en el archivo JSON
    const codigo = {
        nombre: nombreCodigo,
        descripcion: descripcionCodigo
    };

    // Lee el archivo JSON existente
    let data = fs.readFileSync('codigos.json');
    let codigos = JSON.parse(data);

    // Agrega el nuevo código al arreglo de códigos
    codigos.push(codigo);

    // Convierte el arreglo de códigos a formato JSON
    let jsonData = JSON.stringify(codigos, null, 2);

    // Guarda los códigos actualizados en el archivo JSON
    fs.writeFileSync('codigos.json', jsonData);

    console.log(`El código "${nombreCodigo}" ha sido compartido y guardado en el archivo JSON.`);
	// Implementa tu lógica para compartir el código
    // Puedes guardar el código en una base de datos, un archivo o cualquier otro medio
    // Por ejemplo, aquí simplemente imprimimos el nombre y descripción en la consola
    console.log(`Nombre del código: ${nombreCodigo}`);
    console.log(`Descripción del código: ${descripcionCodigo}`);
}
