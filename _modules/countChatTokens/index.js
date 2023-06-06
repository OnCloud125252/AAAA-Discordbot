import { encoding_for_model } from "@dqbd/tiktoken";


export default function countChatTokens(chat) {
    const encoder = encoding_for_model("gpt-3.5-turbo");

    let tokenCount = 0;
    for (const message of chat) {
        tokenCount += 4;
        tokenCount += (encoder.encode(message.content)).length;
        tokenCount += (encoder.encode(message.name ?? message.role)).length;
    }

    encoder.free();

    return tokenCount + 3;
}