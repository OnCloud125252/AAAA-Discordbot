import { SlashCommandBuilder } from "discord.js";

import updateChat from "../../_modules/MongoDB/functions/updateChat.js";


export default {
    data: new SlashCommandBuilder()
        .setName("chat")
        .setDescription("Create a new chat"),
    async execute(client, interaction) {
        const channel = client.channels.cache.get(process.env.CHAT_CHANNEL);
        const thread = await channel.threads.create({
            name: "New Chat",
            message: {
                embeds: [{
                    color: parseInt("036bfc", 16),
                    title: "You may now chat with AI",
                    fields: [
                        {
                            name: "Data",
                            value: "All your conversation will be stored in database until you delete this chat."
                        }
                    ],
                    image: {
                        url: "https://openaiapi-site.azureedge.net/public-assets/d/999f7ce39e/favicon.svg"
                    },
                    footer: {
                        text: "Powered by ChatGPT"
                    },
                    timestamp: new Date(),
                }]
            }
        });
        const newChatID = thread.id;

        updateChat(newChatID, null, null);

        await interaction.reply(`Successfully created new chat at <#${newChatID}>.`);
    }
};