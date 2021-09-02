import { RunFunction } from "../../interfaces/Command";

export const run: RunFunction = async(client, message, args) => {
    message.channel.send("This command is disabled!");
    return;

    if (args.length < 2) {
        message.channel.send("Usage: .spam <count> <message>");
        return;
    }

    const count = parseInt(args[0]);
    if (isNaN(count)) {
        message.channel.send("Usage: .spam <count> <message>");
        return;
    }

    const spamMessage = message.content.slice(message.content.indexOf(args[0]) + args[0].length);
    for (let i = 0; i < count; i++) {
        message.channel.send(spamMessage);
    }
}

export const name: string = 'spam';
