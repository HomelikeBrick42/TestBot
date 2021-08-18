import { MessageReaction } from "discord.js";
import { RunFunction } from "../../interfaces/Command";

enum State {
    Empty,
    Yellow,
    Red,
}

class Board {
    public state: State[][] = [
        [ State.Empty, State.Empty, State.Empty, State.Empty, State.Empty, State.Empty, State.Empty ],
        [ State.Empty, State.Empty, State.Empty, State.Empty, State.Empty, State.Empty, State.Empty ],
        [ State.Empty, State.Empty, State.Empty, State.Empty, State.Empty, State.Empty, State.Empty ],
        [ State.Empty, State.Empty, State.Empty, State.Empty, State.Empty, State.Empty, State.Empty ],
        [ State.Empty, State.Empty, State.Empty, State.Empty, State.Empty, State.Empty, State.Empty ],
    ];

    public Add(index: number, piece: State): [success: boolean, player_won: boolean] {
        let y = -1;
        for (let i = 0; i < 5; i++) {
            if (this.state[i][index] === State.Empty) {
                y = i;
            } else {
                break;
            }
        }

        if (y != -1) {
            this.state[y][index] = piece;

            let won = false;

            // Left
            if (index >= 3) {
                let row = true;
                for (let i = 0; i < 3; i++) {
                    if (this.state[y][index - i - 1] !== piece) {
                        row = false;
                        break;
                    }
                }

                if (row) {
                    won = row;
                }
            }

            // Right
            if (index <= 3) {
                let row = true;

                for (let i = 0; i < 3; i++) {
                    if (this.state[y][index + i + 1] !== piece) {
                        row = false;
                        break;
                    }
                }

                if (row) {
                    won = row;
                }
            }

            // Up
            if (y >= 3) {
                let row = true;

                for (let i = 0; i < 3; i++) {
                    if (this.state[y - i - 1][index] !== piece) {
                        row = false;
                        break;
                    }
                }

                if (row) {
                    won = row;
                }
            }

            // Down
            if (y <= 1) {
                let row = true;

                for (let i = 0; i < 3; i++) {
                    if (this.state[y + i + 1][index] !== piece) {
                        row = false;
                        break;
                    }
                }

                if (row) {
                    won = row;
                }
            }

            return [true, won];
        }

        return [false, false];
    }

    public Draw(turn: State): string {
        let text: string = '';

        text += turn === State.Yellow ? ':yellow_circle:' : ':red_circle:';
        text += '\n';

        text += ':white_large_square:';
        text += ':one:';
        text += ':two:';
        text += ':three:';
        text += ':four:';
        text += ':five:';
        text += ':six:';
        text += ':seven:';
        text += ':white_large_square:';
        text += '\n';

        for (let y = 0; y < 5; y++) {
            text += ':white_large_square:';
            for (let x = 0; x < 7; x++) {
                switch (this.state[y][x]) {
                    case State.Yellow: {
                        text += ':yellow_circle:';
                    } break;
                    
                    case State.Red: {
                        text += ':red_circle:';
                    } break;

                    case State.Empty:
                    default: {
                        text += ':black_large_square:';
                    } break;
                }
            }
            text += ':white_large_square:';
            text += '\n';
        }
        
        for (let x = 0; x < 7+2; x++) {
            text += ':white_large_square:';
        }
        text += '\n';

        return text;
    }

    public Full(): boolean {
        let foundSpace = false;

        for (let y = 0; y < 5; y++) {
            for (let x = 0; x < 7; x++) {
                if (this.state[y][x] == State.Empty) {
                    foundSpace = true;
                }
            }
        }

        return !foundSpace;
    }
}

export const run: RunFunction = async(client, message, args) => {
    const player1 = message.author;
    const player2 = message.mentions.members.first() ? message.mentions.members.first().user : undefined;

    if (!player2) {
        await message.reply(client.embed({ description: "Usage: .connect4 @<user>" }, message));
        return;
    }

    let currentPiece = State.Yellow;

    const board = new Board();

    const msg = await message.channel.send(client.embed({ description: board.Draw(currentPiece) }, message));
    let reactions: MessageReaction[] = [];
    reactions.push(await msg.react('1️⃣'));
    reactions.push(await msg.react('2️⃣'));
    reactions.push(await msg.react('3️⃣'));
    reactions.push(await msg.react('4️⃣'));
    reactions.push(await msg.react('5️⃣'));
    reactions.push(await msg.react('6️⃣'));
    reactions.push(await msg.react('7️⃣'));

    const Shutdown = () => {
        reactions.forEach(reaction => {
            reaction.remove();
        });
        collector.stop();
    };

    const filter = (reaction, user) => ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣'].includes(reaction.emoji.name);
    let collector = msg.createReactionCollector(filter, { time: 2147483647 });
    collector.on('collect', (reaction, _) => {
        if ((reaction.users.cache.last() == player1 && currentPiece === State.Yellow) || (reaction.users.cache.last() == player2 && currentPiece === State.Red)) {
            let index: number;
            switch (reaction.emoji.name) {
                case '1️⃣': {
                    index = 0;
                } break;
                
                case '2️⃣': {
                    index = 1;
                } break;
                
                case '3️⃣': {
                    index = 2;
                } break;
                
                case '4️⃣': {
                    index = 3;
                } break;
                
                case '5️⃣': {
                    index = 4;
                } break;
                
                case '6️⃣': {
                    index = 5;
                } break;
                
                case '7️⃣': {
                    index = 6;
                } break;
            }

            let [success, won] = board.Add(index, currentPiece);
            if (success) {
                currentPiece = currentPiece === State.Yellow ? State.Red : State.Yellow;
            }

            if (won) {
                const text = board.Draw(currentPiece) + '\n' + `'${currentPiece == State.Yellow ? player2.username : player1.username}' Won!`;
                msg.edit(client.embed({ description: text }, message));
                Shutdown();
                return;
            }

            if (board.Full()) {
                const text = board.Draw(currentPiece) + '\n' + `'${player1.username}' and '${player2.username}' Tied!`;
                msg.edit(client.embed({ description: text }, message));
                Shutdown();
                return;
            }

            msg.edit(client.embed({ description: board.Draw(currentPiece) }, message));
        }
        reaction.users.remove(reaction.users.cache.last());
    });
};

export const name: string = 'connect4';
