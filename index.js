const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { LavalinkManager } = require('lavalink-client');
const { token, lavalinkHost, lavalinkPort, lavalinkPassword, lavalinkSecure } = require('./config.json');
const { registerLavalinkEvents } = require('./utils/lavalinkEvents');

// ─── Discord Client ──────────────────────────────────────────────────────────
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.commands = new Collection();

// ─── Load Commands ───────────────────────────────────────────────────────────
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.warn(`[WARNING] El comando en ${filePath} le falta "data" o "execute".`);
        }
    }
}

// ─── Lavalink Manager ────────────────────────────────────────────────────────
client.lavalink = new LavalinkManager({
    nodes: [
        {
            authorization: lavalinkPassword || 'youshallnotpass',
            host: lavalinkHost || 'localhost',
            port: lavalinkPort || 2333,
            id: 'main-node',
            secure: lavalinkSecure || false,
            retryAmount: 5,
            retryDelay: 3000,
        },
    ],
    sendToShard: (guildId, payload) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) guild.shard.send(payload);
    },
    client: {
        id: null, // se setea en ready
        username: 'MusicBot',
    },
    playerOptions: {
        applyVolumeAsFilter: false,
        clientBasedPositionUpdateInterval: 100,
        defaultSearchPlatform: 'ytsearch',
        volumeDecrementer: 0.75,
        onDisconnect: { autoLeaveMs: 30000 },
        onEmptyQueue: {
            destroyAfterMs: 30000,
        },
    },
    queueOptions: {
        maxPreviousTracks: 25,
    },
});

// ─── Load Events ─────────────────────────────────────────────────────────────
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// Raw voice state for Lavalink
client.on('raw', d => client.lavalink.sendRawData(d));

// Lavalink player events (trackStart, queueEnd, playerDestroy, etc.)
registerLavalinkEvents(client);

client.login(token);

