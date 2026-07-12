// index.js
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const SPAM_TITLE = `⬛️ ◾️ ﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽ ◾️ ⬛️`;

const SPAM_DESCRIPTION = `♣️ ﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽ ♣️
🕸️ ﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽ 🕸️
❕ ﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽ ❕
☁️ ﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽ ☁️
🥽 ﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽ 🥽
❔ ﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽ ❔
◽️ ﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽ ◽️
⬛️ ﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽ ⬛️
◾️ ﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽ ◾️
♣️ ﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽﷽ ♣️`;

const SPAM_FOOTER = `🕸️ ☑️ ||@everyone|| ☑️ 🕸️
♣️ -# Fuck by SECRET LOL ♣️
❕ -# Join secret ❕`;

client.once('ready', async () => {
    console.log(`☑️ Connected as ${client.user.tag}`);

    const commands = [
        new SlashCommandBuilder()
            .setName('spam')
            .setDescription('❕ Open the spam panel')
    ].map(cmd => cmd.toJSON());

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('☑️ Commands registered');
    } catch (e) {
        console.error('❕ Failed to register commands:', e);
    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand() && interaction.commandName === 'spam') {
        const embed = new EmbedBuilder()
            .setTitle('⬛️ Spam Panel ◾️')
            .setDescription('☁️ Every time you press the button, 5 messages are sent. ❔')
            .setColor(0x000000)
            .setFooter({ text: '♣️ Use responsibly ♣️' });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('spam_button')
                    .setLabel('🕸️ SEND SPAM')
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }

    if (interaction.isButton() && interaction.customId === 'spam_button') {
        await interaction.deferUpdate();

        try {
            const spamEmbed = new EmbedBuilder()
                .setTitle(SPAM_TITLE)
                .setDescription(SPAM_DESCRIPTION)
                .setColor(0xFFFFFF)
                .setFooter({ text: SPAM_FOOTER });

            const tasks = Array.from({ length: 5 }, () => interaction.channel.send({ embeds: [spamEmbed] }));
            await Promise.all(tasks);

            const confirmEmbed = new EmbedBuilder()
                .setDescription('☑️ 5 messages sent simultaneously')
                .setColor(0x000000);

            await interaction.followUp({ embeds: [confirmEmbed], ephemeral: true });
        } catch (err) {
            console.error('❕ Spam error:', err);
            const errorEmbed = new EmbedBuilder()
                .setDescription('❕ Failed to send messages. Possibly rate-limited.')
                .setColor(0x000000);

            await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
        }
    }
});

client.login(process.env.TOKEN);
