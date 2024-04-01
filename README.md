# bot-discord
Bot discord JS de cratos112 

Un bot de Discord que permite a los usuarios interactuar con él a través de reacciones a mensajes. Los mensajes embed son mensajes especiales que pueden contener texto enriquecido, imágenes y otros elementos multimedia para mejorar la presentación de la información.

Este tipo de bot puede ser útil para una variedad de propósitos, como la asignación de roles en un servidor de Discord basado en las reacciones de los usuarios a un mensaje específico. Por ejemplo, un usuario podría reaccionar con un emoji de manzana para obtener el rol de “Manzana” en el servidor.

Además, los mensajes embed pueden ser utilizados para presentar información de manera más clara y visualmente atractiva. Por ejemplo, un bot podría enviar un mensaje embed con una lista de reglas del servidor o una guía para nuevos usuarios.

En resumen, un bot de reacciones y mensajes embed es una herramienta útil para mejorar la interacción y la presentación de información en un servidor de Discord.

## Instalación

discord.js es un poderoso módulo de Node.js que le permite interactuar con la API de Discord muy fácilmente. Se necesita un enfoque mucho más orientado a objetos que la mayoría de las otras bibliotecas JS Discord, lo que hace que el código de su bot sea mucho más ordenado y fácil de comprender.

[Discord.js](https://discord.js.org/) para instalar el Bot.

```bash
## Instalar los paquetes y las dependencias
npm init
npm install discord.js
npm install discord.js@latest

## Crear archivo .gitignore y config.json
{
    "token": token,
    "clientId": ID de la aplicación en el panel developer del Bot se puede conseguir
	"guildId": ID del discord
}
```

## Uso

```node Bot.js

# Crear archivo config.json

# token = Contraseña del Bot
# clientID = ID del Bot
# guildID = ID del servidor de discord

{
    "token": "asdasddasd",
    "clientId": "32233",
    "guildId": "232323"
}

# Establece tu nombre de usuario
git config --global user.name "FIRST_NAME LAST_NAME"

# Establece tu correo electrónico
git config --global user.email "MY_NAME@example.com"

# Vaya al directorio de trabajo de su proyecto:
$ cd carpeta-bot
$ node bot.js

Si ya has ejecutado este comando y aún recibes el error, intenta eliminar la carpeta node_modules de tu proyecto y luego ejecuta el comando de instalación nuevamente:
rm -rf node_modules
npm install discord.js
npm list discord.js

Si necesitas alguno de estos paquetes puedes instalarlo mediante el comando (Opcional)
npm install util 
npm install @discordjs/builders

```

## Contribuyendo

Las solicitudes de Pull Requests son bienvenidas. Para cambios importantes, puede abrir un problema primero
para discutir lo que le gustaría cambiar.

Asegúrese de actualizar las pruebas y documentación según corresponda.

## Documentación
Tener en cuenta la siguiente documentación
Los límites de la [API de discord](https://discord.com/developers/docs/topics/rate-limits):

[Gatewaty Intents](https://discordjs.guide/popular-topics/intents.html#privileged-intents)

[Discord Developers](https://discord.com/developers/docs/interactions/application-commands)

[Crea tu bot](https://discordjs.guide/creating-your-bot/)

[Documentación Node.js v20.3.0](https://nodejs.org/api/modules.html)

[Documentación Node.js v18.16.0](https://nodejs.org/docs/latest-v18.x/api/documentation.html)

[modules_exports]https://nodejs.org/api/modules.html#modules_module_exports

[SlashCommandBuilder](https://discord.js.org/docs/packages/builders/1.6.3/SlashCommandBuilder:Class)

## Estructura básica
discord-bot/
├── node_modules
├── config.json
├── index.js
├── package-lock.json
└── package.json

## Licencia

[MIT](https://choosealicense.com/licenses/mit/)
