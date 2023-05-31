import axios from "axios";


const openAi = "https://api.openai.com/v1/chat/completions";
const openAiKey = (process.env.DEV ? process.env.DEV_OPEN_AI_KEY : process.env.OPEN_AI_KEY);

export default async function requestChat(messages) {
    const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: openAi,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openAiKey}`,
            "Accept-Encoding": "gzip,deflate,compress"
        },
        data: {
            "model": "gpt-3.5-turbo",
            "max_tokens": 1000,
            "temperature": 0.7,
            "messages": messages
        }
    };

    try {
        const response = await axios.request(config);
        return response.data;
    }
    catch (error) {
        console.log(error);
        return null;
    }
}