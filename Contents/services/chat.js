export default function chat(message) {
    console.log(message.content);
    console.log(message.channel.id);
    const messageObj = {
        role: "",
        name: "",
        content: ""
    };
}