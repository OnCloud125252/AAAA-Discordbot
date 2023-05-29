export default function chat(message) {
    console.log(message.content);
    console.log(message.channel.id);
    console.log(message.channel.parentId);
}