import { SlashCommandBuilder } from "discord.js";

import updateChat from "../../_modules/MongoDB/functions/updateChat.js";
import requestChat from "../../_modules/ChatGPT/index.js";


export default {
    data: new SlashCommandBuilder()
        .setName("chat")
        .setDescription("Create a new chat"),
    async execute(client, interaction) {
        try {
            await interaction.reply("Creating new chat ...");

            const channel = client.channels.cache.get(process.env.CHAT_CHANNEL);
            const thread = await channel.threads.create({
                name: "New Chat",
                message: {
                    embeds: [{
                        color: parseInt("036bfc", 16),
                        title: "You may now chat with ChatGPT",
                        fields: [
                            {
                                name: "Important:",
                                value: "All your conversation will be stored in database until you delete this chat."
                            },
                            {
                                name: "Module:",
                                value: "gpt-3.5-turbo"
                            }
                        ],
                        thumbnail: {
                            url: "https://i.ibb.co/Drhnc6h/openai-white-logomark.png",
                        },
                        footer: {
                            text: "Powered by OpenAI"
                        },
                        timestamp: new Date(),
                    }]
                }
            });
            const newChatID = thread.id;

            const chatSetup = {
                "role": "system",
                "content": "You are an helpful assistant. Your name is AAAA. You can response in Discord Markdown format, such as bold text, italicized text, underlined text, inline code, code blocks, quoting, blockquote. If you understand, do not reply that you understand, please reply with a creative short greeting."
            };
            const oldMessages = (await updateChat(newChatID, null, chatSetup)).messages;

            const gptReply = (await requestChat(oldMessages)).choices[0].message;
            await updateChat(newChatID, null, gptReply);
            await client.channels.cache.get(newChatID).send(gptReply.content);

            await interaction.editReply(`Successfully created new chat at <#${newChatID}>.`);
        } catch (error) {
            console.log(error);
            await interaction.reply("Can't create new chat, please try again.");
        }
    }
};