import axios from "axios";


const openAi = "https://api.openai.com/v1/chat/completions";
const openAiKey = process.env.OPEN_AI_KEY;

export default async function requestChat(messages) {
    const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: openAi,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openAiKey}`
        },
        data: {
            "model": "gpt-3.5-turbo",
            "max_tokens": 100,
            "messages": messages
        }
    };

    try {
        const response = await axios.request(config);
        console.log(JSON.stringify(response.data, null, 4));
        return response.data;
    }
    catch (error) {
        console.log(error);
        return null;
    }
}