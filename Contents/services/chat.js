import requestChat from "../../_modules/ChatGPT/index.js";
import readChat from "../../_modules/MongoDB/functions/readChat.js";
import updateChat from "../../_modules/MongoDB/functions/updateChat.js";


export default async function chat(message) {
    const previousMessage = await message.reply("ChatGPT is thinking ...");
    try {
        const chatID = message.channel.id;

        const oldMessages = await readChat(chatID);

        const messageObj = {
            role: "user",
            name: message.author.username.replace(/[^a-zA-Z0-9_]/g, ""),
            content: message.content
        };

        oldMessages.messages.push(messageObj);
        const gptReply = (await requestChat(oldMessages.messages)).choices[0].message;

        await updateChat(chatID, null, [messageObj, gptReply]);

        await previousMessage.edit(gptReply.content);
    } catch (error) {
        await previousMessage.edit("Can't connect to ChatGPT, please try again later.");
    }
}
