import { RunFunction } from "../../interfaces/Command";
import { Guild, GuildMember, Message, Role } from "discord.js";

export const run: RunFunction = async(client, message, args) => {
    const roleName: string = 'Muted';

    const msg: Message = await message.channel.send(client.embed({ description: `Removing Role '${roleName}'` }, message));

    const user: GuildMember = message.mentions.members.first();
    if (!user) {
        msg.edit(client.embed({ description: `Unable to find user` }, message));
        return;
    }

    const role: Role = message.guild.roles.cache.find(role => role.name == roleName);
    if (!role) {
        msg.edit(client.embed({ description: `Unable to find role '${roleName}'` }, message));
        return;
    }

    await user.roles.remove(role);

    msg.edit(client.embed({ description: `Removed Role '${roleName}' from '${user.displayName}'` }, message));
};

export const name: string = 'unmute';
