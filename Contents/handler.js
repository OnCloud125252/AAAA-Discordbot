import { ChannelType } from "discord.js";

import chat from "./services/chat.js";
import warning from "./services/warning.js";


export default function contentHandler(message) {
    if (message.author.bot) return;

    const content = message.content;

    switch (true) {
        case (content.startsWith("A ") && (content.toLowerCase() === "a ping" || content.toLowerCase() === "a botinfo" || content.toLowerCase() === "kd")): {
            warning(message);
            break;
        }

        case ((message.channel.type === ChannelType.PublicThread && message.channel.parent?.type === ChannelType.GuildForum) && message.channel.parentId === (process.env.DEV ? process.env.DEV_CHAT_CHANNEL : process.env.CHAT_CHANNEL)): {
            chat(message);
            break;
        }

        default: {
            console.log("No action");
            break;
        }
    }
}