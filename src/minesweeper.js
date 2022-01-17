function shuffle(a) {
    let j; let x; let
        i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

const buildMinesweeperGrid = function (grid_size, perc_mines) {
    const grid = Array(grid_size).fill().map(() => Array(grid_size));
    const num_mines = Math.round(grid_size * grid_size * (perc_mines / 100));

    const num_spaces = grid_size * grid_size;
    const mines_index = shuffle(Array.from(Array(num_spaces).keys())).slice(0, num_mines);
    const mine_string = '||` M `||';
    // Add the mines
    for (var i = 0; i < grid_size; i++) {
        for (var j = 0; j < grid_size; j++) {
            if (mines_index.includes(i * grid_size + j)) {
                grid[i][j] = mine_string;
            }
        }
    }

    let mine_count_this_grid = 0;
    // Add the numbers
    for (let i = 0; i < grid_size; i++) {
        for (let j = 0; j < grid_size; j++) {
            if (grid[i][j] === mine_string) {
                continue;
            }
            mine_count_this_grid = 0;
            for (let k = -1; k <= 1; k++) {
                if ((i - k) < 0 || (i - k) > (grid_size - 1)) {
                    continue;
                }
                for (let z = -1; z <= 1; z++) {
                    if ((j - z) < 0 || (j - z) > (grid_size - 1)) {
                        continue;
                    } else if (grid[i - k][j - z] === mine_string) {
                        mine_count_this_grid++;
                    }
                }
            }
            grid[i][j] = `||\` ${mine_count_this_grid.toString()} \`||`;
        }
    }

    let discordMinesweeperGrid = `Total Spaces: ${num_spaces}  Total Mines: ${num_mines}\n`;
    // Build the final string
    for (let i = 0; i < grid_size; i++) {
        for (let j = 0; j < grid_size; j++) {
            discordMinesweeperGrid += `${grid[i][j]} `;
        }
        discordMinesweeperGrid += '\n';
    }

    return discordMinesweeperGrid;
};

module.exports = buildMinesweeperGrid;
