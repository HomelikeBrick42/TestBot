import { RunFunction } from "../../interfaces/Command";
import { Guild, GuildMember, Message, Role } from "discord.js";

export const run: RunFunction = async(client, message, args) => {
    if (message.author.tag !== "HomelikeBrick42#1173") {
        message.channel.send("You are not allowed to use this command!");
        return;
    }

    const reply = message.reference;
    if (reply === null) {
        message.channel.send("Please reply to a message to use this command!");
        return;
    }

    const repliedMessage = await message.channel.messages.fetch(reply.messageID);
    repliedMessage.delete();
    message.delete();
}

export const name: string = 'delete';
