# 🎮 OWGalaxy Stream Notifier — Documentación

Sistema de notificaciones de streams en vivo para Discord, integrado con **Twitch** y **Kick**.

---

## ⚙️ Configuración inicial (OBLIGATORIO)

### 1. Credenciales de Twitch

Obtén tus credenciales en [dev.twitch.tv/console](https://dev.twitch.tv/console):
1. Crea una nueva aplicación → Category: **Chat Bot** → OAuth: `http://localhost`
2. Copia el **Client ID** y genera un **Client Secret**

### 2. MongoDB

Instala MongoDB localmente o usa MongoDB Atlas (gratis):
- **Local:** `mongodb://localhost:27017/owgalaxy-streams`
- **Atlas:** `mongodb+srv://user:pass@cluster.mongodb.net/owgalaxy-streams`

### 3. Edita `config.json`

```json
{
  "token": "TU_TOKEN_DE_DISCORD",
  "clientId": "TU_CLIENT_ID_DE_DISCORD",
  "guildId": "TU_GUILD_ID",
  "mongoUri": "mongodb://localhost:27017/owgalaxy-streams",
  "twitchClientId": "TU_TWITCH_CLIENT_ID",
  "twitchClientSecret": "TU_TWITCH_CLIENT_SECRET"
}
```

### 4. Desplegar comandos

```bash
node deploy-commands.js
```

### 5. Iniciar el bot

```bash
node index.js
```

---

## 📋 Comandos disponibles

| Comando | Descripción | Permisos |
|---|---|---|
| `/canal-stream-add <username> <plataforma>` | Agrega un streamer a monitorear | Gestionar servidor |
| `/canal-stream-delete <username> <plataforma>` | Elimina un streamer de la lista | Gestionar servidor |
| `/canal-stream-id <canal>` | Configura el canal de notificaciones | Gestionar servidor |
| `/canal-stream-list` | Lista todos los streamers registrados con estado | Gestionar servidor |
| `/canal-stream-check <username> <plataforma>` | Verifica el estado actual de un streamer | Gestionar servidor |
| `/canal-stream-config mencion` | Configura qué rol se menciona al notificar | Gestionar servidor |
| `/canal-stream-config mensaje` | Personaliza el mensaje de notificación | Gestionar servidor |
| `/canal-stream-config ver` | Muestra la configuración actual | Gestionar servidor |
| `/canal-stream-historial` | Historial de streams notificados (filtrable) | Gestionar servidor |

---

## 🏗️ Estructura de archivos

```
bot-discord (Twitch)/
├── index.js                    ← Punto de entrada principal
├── config.json                 ← Configuración del bot
├── deploy-commands.js          ← Despliega los slash commands
├── database/
│   ├── mongoose.js             ← Conexión a MongoDB
│   └── models.js               ← Esquemas: GuildConfig, Streamer, StreamHistory
├── services/
│   ├── streamApi.js            ← Clientes API de Twitch y Kick
│   └── streamChecker.js        ← Cron job + builder de embeds + notificaciones
├── commands/
│   └── streams/
│       ├── canal-stream-add.js
│       ├── canal-stream-delete.js
│       ├── canal-stream-id.js
│       ├── canal-stream-list.js
│       ├── canal-stream-check.js
│       ├── canal-stream-config.js
│       └── canal-stream-historial.js
└── events/
    ├── ready.js
    └── interactionCreate.js
```

---

## 🔌 APIs utilizadas

### Twitch Helix REST API
- **Autenticación:** Client Credentials (App Access Token), se cachea y renueva automáticamente
- **Endpoints:**
  - `POST https://id.twitch.tv/oauth2/token` — Obtener token OAuth
  - `GET https://api.twitch.tv/helix/users?login=<username>` — Info y avatar del streamer
  - `GET https://api.twitch.tv/helix/streams?user_id=<id>` — Stream activo (null = offline)
  - `GET https://api.twitch.tv/helix/channels?broadcaster_id=<id>` — Info del canal

### Kick API Pública
- **Sin autenticación requerida** (API pública/no oficial)
- **Endpoint:** `GET https://kick.com/api/v1/channels/<username>`
- Retorna: `livestream`, `viewer_count`, `session_title`, `categories`, `thumbnail`, `profile_pic`

> [!WARNING]
> La API de Kick es no oficial y puede cambiar sin aviso. Consulta [dev.kick.com](https://dev.kick.com) para actualizaciones de la API oficial.

---

## 🗄️ Modelos MongoDB

### `GuildConfig` — Configuración por servidor
| Campo | Tipo | Descripción |
|---|---|---|
| `guildId` | String | ID del servidor de Discord |
| `notificationChannelId` | String | Canal donde se enviarán los embeds |
| `role_mention` | String | `@everyone`, `@here`, o ID de rol |
| `customMessage` | String | Mensaje personalizado de notificación |

### `Streamer` — Streamers monitoreados
| Campo | Tipo | Descripción |
|---|---|---|
| `guildId` | String | ID del servidor |
| `username` | String | Login del streamer en la plataforma |
| `platform` | String | `twitch` o `kick` |
| `userId` | String | ID en Twitch (obtenido automáticamente) |
| `displayName` | String | Nombre para mostrar |
| `profileImage` | String | URL del avatar |
| `isLive` | Boolean | Estado actual del stream |
| `lastStreamId` | String | ID del último stream notificado (anti-spam) |

### `StreamHistory` — Historial de notificaciones
| Campo | Tipo | Descripción |
|---|---|---|
| `username` | String | Nombre del streamer |
| `platform` | String | Plataforma |
| `title` | String | Título del stream al momento de la notificación |
| `game` | String | Categoría/juego |
| `viewers` | Number | Espectadores al momento |
| `messageId` | String | ID del mensaje enviado en Discord |

---

## ⏱️ Cómo funciona el checker

El bot verifica **automáticamente** cada **2 minutos** usando `node-cron`:

1. Obtiene todos los streamers de la DB
2. Para cada uno consulta la API correspondiente
3. Si está en vivo y es un **nuevo stream** (ID diferente): envía el embed
4. Registra en `StreamHistory` el evento
5. Anti-spam: el mismo `stream.id` nunca se notifica dos veces
6. Al volver offline limpia el estado para el próximo stream
7. Pausa **500ms** entre requests para respetar las APIs
8. Límite de **25 streamers** por servidor

---

## 🚀 Próximas mejoras posibles

- [ ] Soporte para YouTube Live
- [ ] Botones en el embed (ir al canal, seguir al streamer)
- [ ] Estadísticas de pico de viewers por streamer
- [ ] Cooldown configurable entre notificaciones
- [ ] Exportar historial a CSV
