export default function warning(message) {
    const command = message.content.toLowerCase().split(" ").slice(1).join(" ");
    message.reply(`:warning::warning::warning: WARNING :warning::warning::warning:\n\n> All commands are converted to slash command (\`/\`).\n> Please try to use \`/${command}\` instead!\n> For more information about slash command usage, please use \`/help\` command.`);
}