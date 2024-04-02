import type { OWGCommand } from "@owg/handler";

const ping: OWGCommand = {
    name: 'ping',
    description: 'Ping!',
    async run({ interaction }) {
        await interaction.reply('Pong!');
    }
}

module.exports = ping;