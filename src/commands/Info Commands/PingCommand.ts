import { Message } from "discord.js";
import { RunFunction } from "../../interfaces/Command";

export const run: RunFunction = async(client, message) => {
    const msg: Message = await message.channel.send(client.embed({ description: 'Pinging!!' }, message));
    await msg.edit(client.embed({ description: `WebSocket: ${client.ws.ping}ms\nMessage edit: ${msg.createdTimestamp - message.createdTimestamp}ms` }, message));
};

export const name: string = 'ping';
