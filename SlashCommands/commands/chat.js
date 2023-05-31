import { SlashCommandBuilder, ChannelType } from "discord.js";

import requestChat from "../../_modules/ChatGPT/index.js";
import updateChat from "../../_modules/MongoDB/functions/updateChat.js";
import deleteChat from "../../_modules/MongoDB/functions/deleteChat.js";


export default {
    data: new SlashCommandBuilder()
        .setName("chat")
        .setDescription("Communicate with AI")
        .addSubcommand(subcommand => subcommand
            .setName("create")
            .setDescription("Create a new chat")
            .addStringOption(option => option
                .setName("prompt")
                .setDescription("Set the prompt to customize the bot")))
        .addSubcommand(subcommand => subcommand
            .setName("delete")
            .setDescription("Delete current chat")),
    async execute(client, interaction) {
        switch (interaction.options.getSubcommand()) {
            case "create": {
                await interaction.reply("Creating new chat ...");

                const channel = client.channels.cache.get((process.env.DEV ? process.env.DEV_CHAT_CHANNEL : process.env.CHAT_CHANNEL));
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

                try {
                    const chatSetup = {
                        "role": "system",
                        "content": interaction.options.getString("prompt") ?? "You are an helpful assistant. Your name is AAAA. You should remember everyone's name. You can response in Discord Markdown format. If you understand, do not reply that you understand, please reply with a creative short greeting."
                    };
                    const oldMessage = (await updateChat(newChatID, null, [chatSetup])).messages;

                    const gptReply = (await requestChat(oldMessage)).choices[0].message;
                    await updateChat(newChatID, null, [gptReply]);
                    await client.channels.cache.get(newChatID).send(gptReply.content);

                    await interaction.editReply(`Successfully created new chat at <#${newChatID}>.`);
                } catch (error) {
                    console.log(error);
                    client.channels.cache.get(newChatID).delete();
                    await interaction.reply("Can't create new chat, please try again later.");
                }
                break;
            }
            case "delete": {
                if ((interaction.channel.type === ChannelType.PublicThread && interaction.channel.parent?.type === ChannelType.GuildForum) && interaction.channel.parentId === (process.env.DEV ? process.env.DEV_CHAT_CHANNEL : process.env.CHAT_CHANNEL)) {
                    await interaction.reply("Deleting current chat ...");
                    await deleteChat(interaction.channel.id);
                    await interaction.channel.delete();
                }
                else {
                    interaction.reply("Please enter the chat you want to delete!");
                }
                break;
            }
            default:
                break;
        }

    }
};