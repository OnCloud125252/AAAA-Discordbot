import requestChat from "../../../_modules/ChatGPT/index.js";
import readChat from "../../../_modules/MongoDB/functions/readChat.js";
import updateChat from "../../../_modules/MongoDB/functions/updateChat.js";


export default async function chat(message) {
    const previousMessage = await message.reply("ChatGPT is thinking ...");
    try {
        const chatID = message.channel.id;

        const oldMessageObj = await readChat(chatID);

        const messageObj = {
            role: "user",
            name: message.author.username.replace(/[^a-zA-Z0-9_]/g, ""),
            content: message.content
        };

        const title = await (async () => {
            console.log(oldMessageObj.messages.length);
            if (oldMessageObj.messages.length === 2) {
                console.log("get title");
                const oldMessages = JSON.parse(JSON.stringify(oldMessageObj.messages));
                oldMessages.push({
                    role: "user",
                    name: message.author.username.replace(/[^a-zA-Z0-9_]/g, ""),
                    content: message.content + "\n\nGenerate a title for our conversation in one sentence. Please reply with only the title."
                });
                return (await requestChat(oldMessages)).choices[0].message.content;
            }
            else {
                return null;
            }
        })();

        oldMessageObj.messages.push(messageObj);
        const gptReply = (await requestChat(oldMessageObj.messages)).choices[0].message;

        await updateChat(chatID, title, [messageObj, gptReply]);

        await previousMessage.edit(gptReply.content);
    } catch (error) {
        console.log(error);
        await previousMessage.edit("Can't connect to ChatGPT, please try again later.");
    }
}
