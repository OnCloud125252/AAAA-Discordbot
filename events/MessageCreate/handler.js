import { ChannelType } from "discord.js";

import chat from "./services/chat.js";
import warning from "./services/warning.js";


export default function MessageCreateHandler(message) {
    if (message.author.bot) return;

    const content = message.content;

    switch (true) {
        case (content.toLowerCase() === "kd" || content.startsWith("A ") && (content.toLowerCase() === "a ping" || content.toLowerCase() === "a botinfo")): {
            warning(message);
            break;
        }

        case ((message.channel.type === ChannelType.PublicThread && message.channel.parent?.type === ChannelType.GuildForum) && message.channel.parentId === (process.env.DEV ? process.env.DEV_CHAT_CHANNEL : process.env.CHAT_CHANNEL)): {
            chat(message);
            break;
        }

        default: {
            break;
        }
    }
}