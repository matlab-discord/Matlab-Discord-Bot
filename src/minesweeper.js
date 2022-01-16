function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

let buildMinesweeperGrid = function(grid_size, perc_mines) {

    let grid = Array(grid_size).fill().map(() => Array(grid_size))
    let num_mines = Math.round(grid_size*grid_size*(perc_mines/100));

    let num_spaces = grid_size*grid_size;
    let mines_index = shuffle(Array.from(Array(num_spaces).keys())).slice(0, num_mines);
    let mine_string = '||` M `||';
    // Add the mines
    for(var i = 0; i<grid_size; i++) {
        for(var j = 0; j <grid_size; j++) {
            if(mines_index.includes(i*grid_size + j)) {
                grid[i][j] = mine_string;
            }
        }
    }

    var mine_count_this_grid = 0;
    // Add the numbers
    for(var i = 0; i<grid_size; i++) {
        for(var j = 0; j <grid_size; j++) {
            if(grid[i][j] === mine_string) {
                continue;
            }
            mine_count_this_grid = 0;
            for(var k = -1; k<=1; k++) {
                if((i-k) < 0 || (i-k) > (grid_size-1) ){
                    continue;
                }
                for(var z = -1; z<= 1; z++) {
                    if( (j-z) < 0 || (j-z) > (grid_size-1)) {
                        continue;
                    } else {
                        if(grid[i-k][j-z] === mine_string) {
                            mine_count_this_grid++;
                        }
                    }
                }
            }
            grid[i][j] = "||\` "+mine_count_this_grid.toString()+" \`||" ;
        }
    }

    let discordMinesweeperGrid = `Total Spaces: ${num_spaces}  Total Mines: ${num_mines}\n`;
    // Build the final string
    for(var i = 0; i<grid_size; i++) {
        for(var j = 0; j <grid_size; j++) {

            discordMinesweeperGrid += grid[i][j] + " ";
        }
        discordMinesweeperGrid += "\n";
    }

    return discordMinesweeperGrid;
}

module.exports = buildMinesweeperGrid