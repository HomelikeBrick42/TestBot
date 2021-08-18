import { RunFunction } from "../../interfaces/Event";
import { Command } from "../../interfaces/Command";
import { Message } from "discord.js";

export const run: RunFunction = async (client, message: Message) => {
    const activationSequence: string = '.';

    if (!message.author.bot && message.guild && message.content.startsWith(activationSequence)) {
        const args: string[] = message.content.slice(activationSequence.length).trim().split(/ +/g);
        const cmd: string = args.shift();
        const command: Command = client.commands.get(cmd);

        if (command) {
            command
                .run(client, message, args)
                .catch((reason: any) =>
                    message.channel.send(
                        client.embed({ description: `An error occured: ${reason}` }, message)
                    )
                );
        } else {
            message.channel.send("Unknown command");
        }
    }
};

export const name: string = 'message';
