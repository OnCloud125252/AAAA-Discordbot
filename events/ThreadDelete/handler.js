import deleteChat from "../../_modules/MongoDB/functions/chat/delete.js";


export default async function ThreadDeleteHanhler(thread) {
    try {
        deleteChat(thread.id);
    } catch (error) {
        return null;
    }
}