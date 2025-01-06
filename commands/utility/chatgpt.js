const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const puppeteer = require('puppeteer');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('chatgpt')
    .setDescription('Habla con un modelo de lenguaje GPT-3.')
    .addStringOption(option => option.setName('prompt').setDescription('Mensaje a enviar al modelo de lenguaje GPT-3.').setRequired(true)),
    async execute (interaction) {

        await interaction.deferReply({ flags: MessageFlags.Ephemeral});

        const { options } = interaction;
        const prompt = options.getString('prompt');

        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.goto('https://chat-app-f2d296.zapier.app/');

        await page.waitForSelector('textarea[placeholder="Ask me anything"]');
        await page.focus('textarea[placeholder="Ask me anything"]');
        await page.waitForTimeout(1000);
        await page.keyboard.type(prompt);
        await page.keyboard.press('Enter');

        await page.waitForTimeout(10000);
        await page.waitForSelector('[data-testid="bot-message"]', async (elements) => {
            return elements.map((element) => element.textContent);
        });

        setTimeout(async () => {
            if (value.length == 0) return await interaction.editReply({ content: `❌ Ha ocurrido un error al tratar de responder, intentalo más tarde.` });
        }, 60000);

        await browser.close();
        
        value.shift();
        const embed = new EmbedBuilder()
        .setColor("Blurple")
        .setDescription(`\`\`\`${value.join('\n\n\n\n')}\`\`\``);

        await interaction.editReply({ embeds: [embed] });
    }
}