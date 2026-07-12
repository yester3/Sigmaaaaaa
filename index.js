// index.js
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Almacén temporal para configuraciones de spam personalizado (en memoria)
const customSpamStore = new Map();

// Generador de ID simple
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

// ====== MENSAJES POR DEFECTO PARA /SPAM ======
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

// ====== REGISTRO DE COMANDOS ======
client.once('ready', async () => {
    console.log(`☑️ Connected as ${client.user.tag}`);

    const commands = [
        new SlashCommandBuilder()
            .setName('spam')
            .setDescription('❕ Open the default spam panel'),
        new SlashCommandBuilder()
            .setName('customspam')
            .setDescription('❕ Customize your spam message or embed')
    ].map(cmd => cmd.toJSON());

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('☑️ Commands registered');
    } catch (e) {
        console.error('❕ Failed to register commands:', e);
    }
});

// ====== MANEJO DE INTERACCIONES ======
client.on('interactionCreate', async interaction => {
    // ----- COMANDO /SPAM (POR DEFECTO) -----
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

    // ----- COMANDO /CUSTOMSPAM -----
    if (interaction.isChatInputCommand() && interaction.commandName === 'customspam') {
        const embed = new EmbedBuilder()
            .setTitle('⬛️ Custom Spam Setup ◾️')
            .setDescription('☁️ Choose the type of spam you want to configure:')
            .setColor(0x000000);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('custom_choose_embed')
                    .setLabel('⬛️ Embed')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('custom_choose_message')
                    .setLabel('◽️ Plain Message')
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }

    // ----- BOTÓN: ELEGIR EMBED -----
    if (interaction.isButton() && interaction.customId === 'custom_choose_embed') {
        const modal = new ModalBuilder()
            .setCustomId('custom_modal_embed')
            .setTitle('⬛️ Custom Embed Spam');

        const titleInput = new TextInputBuilder()
            .setCustomId('embed_title')
            .setLabel('Title')
            .setPlaceholder('Enter the embed title...')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(256);

        const descriptionInput = new TextInputBuilder()
            .setCustomId('embed_description')
            .setLabel('Description')
            .setPlaceholder('Enter the embed description...')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(4000);

        const colorInput = new TextInputBuilder()
            .setCustomId('embed_color')
            .setLabel('Color (hex)')
            .setPlaceholder('FFFFFF for white, 000000 for black...')
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setMaxLength(7)
            .setValue('FFFFFF');

        const footerInput = new TextInputBuilder()
            .setCustomId('embed_footer')
            .setLabel('Footer')
            .setPlaceholder('Enter footer text (optional)...')
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setMaxLength(2048);

        const thumbnailInput = new TextInputBuilder()
            .setCustomId('embed_thumbnail')
            .setLabel('Thumbnail URL (optional)')
            .setPlaceholder('https://example.com/image.png')
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setMaxLength(2048);

        modal.addComponents(
            new ActionRowBuilder().addComponents(titleInput),
            new ActionRowBuilder().addComponents(descriptionInput),
            new ActionRowBuilder().addComponents(colorInput),
            new ActionRowBuilder().addComponents(footerInput),
            new ActionRowBuilder().addComponents(thumbnailInput)
        );

        await interaction.showModal(modal);
    }

    // ----- BOTÓN: ELEGIR PLAIN MESSAGE -----
    if (interaction.isButton() && interaction.customId === 'custom_choose_message') {
        const modal = new ModalBuilder()
            .setCustomId('custom_modal_message')
            .setTitle('◽️ Custom Message Spam');

        const contentInput = new TextInputBuilder()
            .setCustomId('message_content')
            .setLabel('Message Content')
            .setPlaceholder('Enter your message...')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(2000);

        modal.addComponents(
            new ActionRowBuilder().addComponents(contentInput)
        );

        await interaction.showModal(modal);
    }

    // ----- BOTÓN DE SPAM POR DEFECTO -----
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

    // ----- MODAL: EMBED PERSONALIZADO -----
    if (interaction.isModalSubmit() && interaction.customId === 'custom_modal_embed') {
        await interaction.deferUpdate();

        const title = interaction.fields.getTextInputValue('embed_title');
        const description = interaction.fields.getTextInputValue('embed_description');
        const colorHex = interaction.fields.getTextInputValue('embed_color') || 'FFFFFF';
        const footer = interaction.fields.getTextInputValue('embed_footer') || null;
        const thumbnail = interaction.fields.getTextInputValue('embed_thumbnail') || null;

        const colorInt = parseInt(colorHex.replace('#', ''), 16) || 0xFFFFFF;

        // Guardar configuración
        const configId = generateId();
        customSpamStore.set(configId, {
            type: 'embed',
            title,
            description,
            color: colorInt,
            footer,
            thumbnail
        });

        // Vista previa
        const previewEmbed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(colorInt);
        if (footer) previewEmbed.setFooter({ text: footer });
        if (thumbnail) previewEmbed.setThumbnail(thumbnail);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`custom_spam_btn_${configId}`)
                    .setLabel('🕸️ SEND CUSTOM SPAM')
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.editReply({
            content: '☁️ **Your custom embed spam is ready!** ☁️\n⬛️ Preview:',
            embeds: [previewEmbed],
            components: [row]
        });
    }

    // ----- MODAL: MENSAJE SIMPLE PERSONALIZADO -----
    if (interaction.isModalSubmit() && interaction.customId === 'custom_modal_message') {
        await interaction.deferUpdate();

        const content = interaction.fields.getTextInputValue('message_content');

        const configId = generateId();
        customSpamStore.set(configId, {
            type: 'message',
            content
        });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`custom_spam_btn_${configId}`)
                    .setLabel('🕸️ SEND CUSTOM SPAM')
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.editReply({
            content: `◽️ **Your custom message spam is ready!** ◽️\n❔ Preview:\n>>> ${content}`,
            components: [row]
        });
    }

    // ----- BOTÓN DE SPAM PERSONALIZADO -----
    if (interaction.isButton() && interaction.customId.startsWith('custom_spam_btn_')) {
        const configId = interaction.customId.replace('custom_spam_btn_', '');
        const config = customSpamStore.get(configId);

        if (!config) {
            await interaction.reply({ content: '❕ This spam session has expired. Please run /customspam again.', ephemeral: true });
            return;
        }

        await interaction.deferUpdate();

        try {
            if (config.type === 'embed') {
                const customEmbed = new EmbedBuilder()
                    .setTitle(config.title)
                    .setDescription(config.description)
                    .setColor(config.color);
                if (config.footer) customEmbed.setFooter({ text: config.footer });
                if (config.thumbnail) customEmbed.setThumbnail(config.thumbnail);

                const tasks = Array.from({ length: 5 }, () => interaction.channel.send({ embeds: [customEmbed] }));
                await Promise.all(tasks);
            } else if (config.type === 'message') {
                const tasks = Array.from({ length: 5 }, () => interaction.channel.send({ content: config.content }));
                await Promise.all(tasks);
            }

            const confirmEmbed = new EmbedBuilder()
                .setDescription('☑️ 5 custom messages sent simultaneously')
                .setColor(0x000000);

            await interaction.followUp({ embeds: [confirmEmbed], ephemeral: true });
        } catch (err) {
            console.error('❕ Custom spam error:', err);
            const errorEmbed = new EmbedBuilder()
                .setDescription('❕ Failed to send messages. Possibly rate-limited.')
                .setColor(0x000000);

            await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
        }
    }
});

client.login(process.env.TOKEN);
