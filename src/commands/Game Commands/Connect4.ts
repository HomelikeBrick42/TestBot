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

            // Horizontal
            {
                let count: number = 0;

                for (let i = 0; i < 7; i++) {
                    if (this.state[y][i] === piece) {
                        count++;
                        if (count >= 4) {
                            break;
                        }
                    } else {
                        count = 0;
                    }
                }

                if (count >= 4) {
                    won = true;
                }
            }

            // Vertical
            {
                let count: number = 0;

                for (let i = 0; i < 5; i++) {
                    if (this.state[i][index] === piece) {
                        count++;
                        if (count >= 4) {
                            break;
                        }
                    } else {
                        count = 0;
                    }
                }

                if (count >= 4) {
                    won = true;
                }
            }

            // Diagonal Right-Down
            {
                let count: number = 0;

                for (let i = -3; i <= 3; i++) {
                    let newX = index + i;
                    let newY = y + i;

                    if (newX >= 0 && newX < 7 && newY >= 0 && newY < 5) {
                        if (this.state[newY][newX] === piece) {
                            count++;
                            if (count >= 4) {
                                break;
                            }
                        } else {
                            count = 0;
                        }
                    }
                }

                if (count >= 4) {
                    won = true;
                }
            }

            // Diagonal Right-Up
            {
                let count: number = 0;

                for (let i = -3; i <= 3; i++) {
                    let newX = index + i;
                    let newY = y - i;

                    if (newX >= 0 && newX < 7 && newY >= 0 && newY < 5) {
                        if (this.state[newY][newX] === piece) {
                            count++;
                            if (count >= 4) {
                                break;
                            }
                        } else {
                            count = 0;
                        }
                    }
                }

                if (count >= 4) {
                    won = true;
                }
            }

            return [true, won];
        }

        return [false, false];
    }

    public Draw(turn: State, finished = false): string {
        let text: string = '';

        if (!finished) {
            text += turn === State.Yellow ? ':yellow_circle:' : ':red_circle:';
            text += '\n';
        }

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

    const headerMessage = `:yellow_circle: '${player1.username}' vs :red_circle: '${player2.username}'` + "\n\n";

    const msg = await message.channel.send(client.embed({ description: headerMessage + board.Draw(currentPiece) }, message));
    let reactions: MessageReaction[] = [];
    reactions.push(await msg.react('1️⃣'));
    reactions.push(await msg.react('2️⃣'));
    reactions.push(await msg.react('3️⃣'));
    reactions.push(await msg.react('4️⃣'));
    reactions.push(await msg.react('5️⃣'));
    reactions.push(await msg.react('6️⃣'));
    reactions.push(await msg.react('7️⃣'));

    const Shutdown = () => {
        collector.stop();
        reactions.forEach(reaction => {
            reaction.remove();
        });
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
                const text = headerMessage + board.Draw(currentPiece, true) + '\n' + `'${currentPiece == State.Yellow ? player2.username : player1.username}' Won!`;
                msg.edit(client.embed({ description: text }, message));
                Shutdown();
                return;
            }

            if (board.Full()) {
                const text = headerMessage + board.Draw(currentPiece, true) + '\n' + `'${player1.username}' and '${player2.username}' Tied!`;
                msg.edit(client.embed({ description: text }, message));
                Shutdown();
                return;
            }

            msg.edit(client.embed({ description: headerMessage + board.Draw(currentPiece) }, message));
        }
        reaction.users.remove(reaction.users.cache.last());
    });
};

export const name: string = 'connect4';
