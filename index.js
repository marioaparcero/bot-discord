const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Events, ChannelType, EmbedBuilder, Partials } = require('discord.js');
const mongoose = require('mongoose');
const { token } = require('./config.json');

//Modo Developer
//const client = new Client({intents: [131071]});

// Modo Producción
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,            // Permite acceder a la información de servidores
		GatewayIntentBits.GuildMessages,     // Permite acceder a los mensajes de los servidores
		GatewayIntentBits.MessageContent,    // Permite acceder al contenido de los mensajes
		GatewayIntentBits.GuildMembers,      // Permite acceder a los miembros de los servidores
		GatewayIntentBits.GuildPresences,    // Permite acceder a las presencias de los miembros
		GatewayIntentBits.GuildVoiceStates,  // Permite acceder a los estados de voz de los miembros
		GatewayIntentBits.GuildIntegrations, // Permite acceder a las integraciones del servidor
		GatewayIntentBits.DirectMessages,	// Permite acceder a los mensajes directos
		GatewayIntentBits.DirectMessageTyping,
		GatewayIntentBits.DirectMessageReactions,    // Permite acceder a los mensajes directos
		GatewayIntentBits.GuildMessageReactions,         // Permite acceder a las reacciones de los mensajes
		GatewayIntentBits.MessageContent     // Permite leer el contenido de los mensajes (requerido en Discord.js v14+)
	],
	partials: [
		Partials.Channel,   // Permite recibir mensajes en canales sin información completa
		Partials.Message,   // Permite recibir mensajes parciales
		Partials.User,
		Partials.Reaction,     // Permite recibir usuarios sin toda la información
		Partials.GuildMember // Permite recibir miembros sin toda la información
	]
});

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

mongoose.connect('mongodb+srv://diegojosuemunozz45:AxkJj4x1nVWu4kxm@cluster0.pdmrh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
})
	.then(() => console.log('Conectado a MongoDB local'))
	.catch(err => console.error('Error de conexión a MongoDB:', err));

mongoose.connection.on('connected', () => {
	console.log('MongoDB está conectado');
});

mongoose.connection.on('error', (err) => {
	console.log(`Error al conectar a MongoDB: ${err}`);
});

mongoose.connection.on('disconnected', () => {
	console.log('MongoDB está desconectado');
});


client.login(token);
