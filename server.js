const express = require('express');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const session = require('express-session');
const { Client, GatewayIntentBits } = require('discord.js');
const { token, clientId, clientSecret } = require('./config.json');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar Passport
passport.use(new DiscordStrategy({
    clientID: clientId,
    clientSecret: clientSecret,
    callbackURL: 'http://localhost:3000/auth/discord/callback',
    scope: ['identify', 'guilds']
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Middleware
app.use(session({ secret: 'tu_secreto_aqui', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Rutas de autenticación
app.get('/auth/discord', passport.authenticate('discord'));
app.get('/auth/discord/callback', passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/dashboard');
});

// Middleware para verificar autenticación
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/auth/discord');
}

// Dashboard
app.get('/dashboard', ensureAuthenticated, (req, res) => {
    const guilds = req.user.guilds.filter(g => g.permissions & 0x20); // Permiso para gestionar servidor
    res.render('dashboard', { user: req.user, guilds });
});

// Página de guild
app.get('/guild/:id', ensureAuthenticated, async (req, res) => {
    const guildId = req.params.id;
    const guild = req.user.guilds.find(g => g.id === guildId);
    if (!guild || !(guild.permissions & 0x20)) return res.status(403).send('No tienes permisos');

    // Obtener datos del guild desde el bot
    const clientGuild = client.guilds.cache.get(guildId);
    if (!clientGuild) return res.status(404).send('Guild no encontrado');

    const roles = clientGuild.roles.cache.map(role => ({
        id: role.id,
        name: role.name,
        permissions: role.permissions.toArray()
    }));

    const channels = clientGuild.channels.cache.filter(ch => ch.type === 0).map(channel => ({
        id: channel.id,
        name: channel.name
    }));

    res.render('guild', { guild: clientGuild, roles, channels });
});

// Ruta para ver permisos de un rol en canales
app.get('/guild/:guildId/role/:roleId/permissions', ensureAuthenticated, async (req, res) => {
    const { guildId, roleId } = req.params;
    const clientGuild = client.guilds.cache.get(guildId);
    if (!clientGuild) return res.status(404).send('Guild no encontrado');

    const role = clientGuild.roles.cache.get(roleId);
    if (!role) return res.status(404).send('Rol no encontrado');

    const channels = clientGuild.channels.cache.filter(ch => ch.type === 0).map(channel => {
        const overwrites = channel.permissionOverwrites.cache.get(roleId);
        return {
            id: channel.id,
            name: channel.name,
            permissions: overwrites ? overwrites.allow.toArray() : [],
            denied: overwrites ? overwrites.deny.toArray() : []
        };
    });

    res.render('rolePermissions', { role, channels });
});

// Ruta para cambiar permisos (POST)
app.post('/guild/:guildId/role/:roleId/update', ensureAuthenticated, async (req, res) => {
    const { guildId, roleId } = req.params;
    const { channelId, allow, deny } = req.body;

    const clientGuild = client.guilds.cache.get(guildId);
    if (!clientGuild) return res.status(404).send('Guild no encontrado');

    const channel = clientGuild.channels.cache.get(channelId);
    if (!channel) return res.status(404).send('Canal no encontrado');

    try {
        await channel.permissionOverwrites.edit(roleId, {
            allow: allow ? allow.split(',') : [],
            deny: deny ? deny.split(',') : []
        });
        res.redirect(`/guild/${guildId}/role/${roleId}/permissions`);
    } catch (error) {
        res.status(500).send('Error al actualizar permisos');
    }
});

// Ruta para cambiar permisos globales del rol
app.post('/guild/:guildId/role/:roleId/update-global', ensureAuthenticated, async (req, res) => {
    const { guildId, roleId } = req.params;
    const { permissions } = req.body;

    const clientGuild = client.guilds.cache.get(guildId);
    if (!clientGuild) return res.status(404).send('Guild no encontrado');

    const role = clientGuild.roles.cache.get(roleId);
    if (!role) return res.status(404).send('Rol no encontrado');

    try {
        await role.setPermissions(permissions.split(','));
        res.redirect(`/guild/${guildId}`);
    } catch (error) {
        res.status(500).send('Error al actualizar permisos globales');
    }
});

app.get('/', (req, res) => {
    res.render('index');
});

// Iniciar servidor
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.login(token);

client.once('ready', () => {
    console.log('Bot listo');
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
});

module.exports = app;