const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection } = require('discord.js'); //GatewayIntentBits
const { token } = require('./config.json');
const db = require('./db/database.js');

//Modo Developer
const client = new Client({ intents: [131071] });

// Modo Producción
//const client = new Client({ intents: [GatewayIntentBits.Guilds] });

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

// Make Database (Testing purposes) SQLite

db.run(`CREATE TABLE warns(
    id TEXT PRIMARY KEY,
    user TEXT NOT NULL,
    reason TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
	if (err) {
		// Table already created
		console.log('Table already created.');
	} else {
		// Table just created, creating some rows
		const insert = 'INSERT INTO warns (id, user, reason) VALUES (?, ?, ?)';
		db.run(insert, ["1", "user1", "reason1"]);
		db.run(insert, ["2", "user2", "reason2"]);
	}
});

client.login(token);
