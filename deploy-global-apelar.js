const { REST, Routes } = require('discord.js');
const { clientId, token } = require('./config.json');
const path = require('node:path');

// Ruta del comando que querés registrar globalmente
const command = require('./commands/mod/apelar.js'); // ← Ajustá la carpeta donde esté tu comando

const rest = new REST().setToken(token);

(async() => {
    try {
        console.log(`📡 Registrando comando global: ${command.data.name}`);

        await rest.put(
            Routes.applicationCommands(clientId), // Comando global
            { body: [command.data.toJSON()] }, // Solo este comando
        );

        console.log(`✅ Comando global "${command.data.name}" registrado correctamente.`);
    } catch (error) {
        console.error('❌ Error al registrar comando:', error);
    }
})();