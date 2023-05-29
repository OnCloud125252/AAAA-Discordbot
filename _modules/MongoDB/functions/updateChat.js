import { schema_chat } from "./_schema.js";


export default async function updateChat(chatID, title, message) {
    try {
        const existingChat = await schema_chat.findOne({ chatID: chatID });

        if (existingChat) {
            if (title) {
                existingChat.title = title;
            }
            existingChat.messages.push(message);
            existingChat.updateTime = new Date();

            await existingChat.save();
            console.log("Chat record updated successfully.");
        }
        else {
            const newChat = new schema_chat({
                chatID: chatID,
                title: "New Chat",
                messages: [],
                createTime: new Date(),
                updateTime: new Date(),
            });

            await newChat.save();
            console.log("Chat record created successfully.");
        }
    }
    catch (error) {
        console.error("An error occurred while updating or creating the chat record:", error);
    }
}