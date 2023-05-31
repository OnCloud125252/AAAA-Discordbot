import deleteChat from "../../_modules/MongoDB/functions/deleteChat.js";


export default async function ThreadDeleteHanhler(thread) {
    try {
        deleteChat(thread.id);
    } catch (error) {
        return null;
    }
}