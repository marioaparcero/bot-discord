# 🎮 OWGalaxy Stream Notifier

> Bot de Discord para notificaciones automáticas de streams en **Twitch** y **Kick**.  
> Desarrollado por **thxmasdev** para **OWGalaxy**.

---

## ⚙️ Configuración inicial

### 1. Credenciales de Twitch

Obtén tus credenciales en [dev.twitch.tv/console](https://dev.twitch.tv/console):
1. Crea una nueva aplicación → Category: **Chat Bot** → OAuth Redirect: `http://localhost`
2. Copia el **Client ID** y genera un **Client Secret**

### 2. MongoDB

Instala MongoDB localmente o usa [MongoDB Atlas](https://www.mongodb.com/atlas) (gratis):
- **Local:** `mongodb://localhost:27017/owgalaxy-streams`
- **Atlas:** `mongodb+srv://user:pass@cluster.mongodb.net/owgalaxy-streams`

### 3. Copia y edita `config.json`

```bash
cp config.json.example config.json
```

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

> ⚠️ `config.json` está en `.gitignore` y **nunca** se sube al repositorio.

### 4. Instalar dependencias

```bash
npm install
```

### 5. Desplegar comandos slash

```bash
node deploy-commands.js
```

### 6. Iniciar el bot

```bash
node index.js
```

---

## 📋 Comandos disponibles

### Gestión de streamers

| Comando | Descripción |
|---|---|
| `/canal-stream-add <username> <plataforma> [discord_user]` | Agrega un streamer a monitorear. Opcionalmente vincula un usuario de Discord para menciones personalizadas. |
| `/canal-stream-delete <username> <plataforma>` | Elimina un streamer de la lista de monitoreo. |
| `/canal-stream-list` | Lista todos los streamers registrados con estado en vivo/offline. |
| `/canal-stream-check <username> <plataforma>` | Consulta el estado actual de cualquier streamer en tiempo real. |
| `/canal-stream-historial` | Muestra el historial de notificaciones enviadas (filtrable por plataforma). |

### Configuración del servidor

| Comando | Descripción |
|---|---|
| `/canal-stream-id <canal>` | Establece el canal de Discord donde se enviarán las notificaciones. |
| `/canal-stream-config ver` | Muestra la configuración actual del servidor. |
| `/canal-stream-config mensaje <texto>` | Personaliza el mensaje de notificación con variables `$link` y `$user`. |

> Todos los comandos requieren el permiso **Gestionar servidor**.

---

## 💬 Mensaje personalizado de notificación

Puedes personalizar el texto que aparece sobre el embed con `/canal-stream-config mensaje`:

```
/canal-stream-config mensaje texto:🚨 $user está en directo! → $link
```

### Variables disponibles

| Variable | Resultado |
|---|---|
| `$link` | URL del stream (ej: `https://twitch.tv/ade_ow`) |
| `$user` | Mención de Discord `@Usuario` si está vinculado, o nombre del streamer si no |

**Ejemplos de plantillas:**
```
🚨ATENCIÓN🚨 $user está en directo: $link
🎮 ¡$user acaba de comenzar stream! Míralo en: $link 🔴
🔔 [$user] ¡STREAM EN VIVO! → $link
```

Si no configuras un mensaje, el bot usará:
- Con Discord vinculado: `🚨ATENCIÓN🚨 @User está en directo: https://twitch.tv/username`
- Sin Discord vinculado: `https://twitch.tv/username is now live on Twitch!`

---

## 🔗 Vinculación de usuarios de Discord

Al agregar un streamer puedes vincular su cuenta de Discord con `discord_user`:

```
/canal-stream-add ade_ow Twitch discord_user:@Ade
```

### Reglas de vinculación
- Cada usuario de Discord puede vincularse a **1 cuenta por plataforma** por servidor
- Es posible tener Twitch **y** Kick vinculados al mismo usuario de Discord simultáneamente
- Si intentas vincular el mismo usuario a una segunda cuenta de la misma plataforma, el bot te informará el estado actual:

```
⚠️ Usuario ya vinculado en esta plataforma
❌ Twitch: Ya vinculado a ade_ow
⬜ Kick: Libre (puedes vincularlo)
```

---

## 📬 Formato del embed de notificación

```
🚨ATENCIÓN🚨 @Ade está en directo: https://twitch.tv/ade_ow
┌──────────────────────────────────────────────────────────┐
│ 🖼️ [avatar]  Ade_OW                                     │  ← Author (link al canal)
│                                                          │
│ **[Título del stream](https://twitch.tv/ade_ow)**        │  ← Título clickeable
│ Playing **Overwatch** · 👁️ 1,234 espectadores            │  ← Juego + viewers
│                                                          │
│ [          MINIATURA DEL STREAM (1280×720)           ]   │  ← Thumbnail del directo
│                                                          │
│ OWGalaxy Stream Notifier • Twitch      Today at 5:00 PM  │  ← Footer + timestamp
└──────────────────────────────────────────────────────────┘
```

- **Twitch** → borde morado `#9146FF`
- **Kick** → borde verde `#53FC18`

---

## 🏗️ Estructura del proyecto

```
bot-discord (Twitch)/
├── index.js                     ← Punto de entrada del bot
├── config.json                  ← Credenciales (NO se sube a git)
├── config.json.example          ← Plantilla de configuración
├── deploy-commands.js           ← Registra los slash commands en Discord
├── package.json
├── database/
│   ├── mongoose.js              ← Conexión persistente a MongoDB
│   └── models.js                ← Schemas: GuildConfig, Streamer, StreamHistory
├── services/
│   ├── streamApi.js             ← Clientes HTTP para Twitch Helix y Kick API
│   └── streamChecker.js        ← Cron job (cada 2 min), embeds y notificaciones
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
- **Autenticación:** Client Credentials OAuth — token con caché y auto-renovación
- **Endpoints:**
  - `POST https://id.twitch.tv/oauth2/token` — Obtener App Access Token
  - `GET https://api.twitch.tv/helix/users?login=<username>` — Info y avatar
  - `GET https://api.twitch.tv/helix/streams?user_id=<id>` — Stream activo (`null` = offline)
  - `GET https://api.twitch.tv/helix/channels?broadcaster_id=<id>` — Info del canal

### Kick API Pública
- **Sin autenticación** (API pública no oficial)
- **Endpoint:** `GET https://kick.com/api/v1/channels/<username>`
- Retorna: `livestream`, `viewer_count`, `session_title`, `categories`, `thumbnail`, `profile_pic`

> ⚠️ La API de Kick es no oficial y puede cambiar sin aviso. Ver [dev.kick.com](https://dev.kick.com) para la API oficial (requiere registro de app).

---

## 🗄️ Modelos MongoDB

### `GuildConfig` — Configuración por servidor
| Campo | Tipo | Descripción |
|---|---|---|
| `guildId` | String | ID del servidor de Discord |
| `notificationChannelId` | String | Canal destino de los embeds |
| `customMessage` | String | Plantilla de mensaje con `$link` y `$user` |

### `Streamer` — Streamers monitoreados
| Campo | Tipo | Descripción |
|---|---|---|
| `guildId` | String | ID del servidor |
| `username` | String | Login del streamer en la plataforma |
| `platform` | String | `twitch` o `kick` |
| `userId` | String | ID en la plataforma (obtenido automáticamente) |
| `displayName` | String | Nombre visible del streamer |
| `profileImage` | String | URL del avatar |
| `discordUserId` | String | ID de Discord vinculado (para menciones) |
| `isLive` | Boolean | Estado actual del stream |
| `lastStreamId` | String | ID del último stream notificado (anti-spam) |
| `addedBy` | String | ID del admin que lo agregó |

### `StreamHistory` — Historial de notificaciones
| Campo | Tipo | Descripción |
|---|---|---|
| `guildId` | String | ID del servidor |
| `username` | String | Nombre del streamer |
| `platform` | String | Plataforma |
| `title` | String | Título del stream notificado |
| `streamUrl` | String | URL del stream |
| `messageId` | String | ID del mensaje enviado en Discord |

---

## ⏱️ Cómo funciona el checker automático

El bot verifica **cada 2 minutos** usando `node-cron`:

1. Obtiene todos los streamers registrados en la DB
2. Consulta la API correspondiente (Twitch o Kick) por cada uno
3. Si detecta un stream en vivo con **ID diferente al último notificado** → envía la notificación
4. Aplica plantilla de mensaje si hay `customMessage` configurado
5. Registra el evento en `StreamHistory`
6. **Anti-spam:** el mismo `stream.id` nunca se notifica dos veces
7. Al detectar offline, resetea el estado para permitir notificación del próximo stream
8. Pausa de **500ms** entre requests para no saturar las APIs
9. Límite de **25 streamers** por servidor

---

## 📦 Dependencias

| Paquete | Versión | Uso |
|---|---|---|
| `discord.js` | v14 | Cliente de Discord |
| `mongoose` | latest | ORM para MongoDB |
| `axios` | latest | Requests HTTP a las APIs |
| `node-cron` | latest | Scheduler para el polling cada 2 min |
