import { RunFunction } from "../../interfaces/Command";
import { Guild, GuildMember, Message, Role } from "discord.js";

export const run: RunFunction = async(client, message, args) => {
    const roleName: string = 'Muted';
    
    const msg: Message = await message.channel.send(client.embed({ description: `Adding Role '${roleName}'` }, message));

    const user: GuildMember = message.mentions.members.first();
    if (user === undefined) {
        msg.edit(client.embed({ description: `Unable to find user` }, message));
        return;
    }

    if (user.user.username === message.author.username) {
        msg.edit(client.embed({ description: `You cannot mute yourself` }, message));
        return;
    }

    const role: Role = message.guild.roles.cache.find(role => role.name == roleName);
    if (role === undefined) {
        msg.edit(client.embed({ description: `Unable to find role '${roleName}'` }, message));
        return;
    }

    await user.roles.add(role);

    if (args.length >= 2) {
        const time: number = Number(args[1]);
        msg.edit(client.embed({ description: `Added Role '${roleName}' to '${user.displayName}' for ${time} seconds` }, message));
        setTimeout(async() => {
            await user.roles.remove(role);
            message.channel.send(client.embed({ description: `Removed Role '${roleName}' from '${user.displayName}'` }, message));
        }, time * 1000);
    } else {
        msg.edit(client.embed({ description: `Added Role '${roleName}' to '${user.displayName}'` }, message));
    }
};

export const name: string = 'mute';
