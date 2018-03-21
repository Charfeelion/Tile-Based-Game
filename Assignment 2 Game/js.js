$(document).ready(function () {
    $('#start').click(function () {
        $('#menu').hide();
        $('#game').show();
        $('#status').show();
        var map = [
        [0, 5, 6, 0, 0, 0, 0, 4],
        [0, 0, 6, 0, 0, 0, 0, 0],
        [0, 2, 0, 0, 0, 6, 6, 6],
        [0, 0, 6, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 2, 0],
        [0, 0, 5, 0, 0, 0, 0, 0],
        [0, 0, 0, 6, 6, 6, 0, 0],
        [0, 0, 6, 0, 0, 2, 0, 0]
    ];

        var objects = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 3, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0, 0, 0]
    ];

        const GRASS = 0;
        const PLAYER = 1;
        const PLANT = 2;
        const ZOMBIE = 3;
        const HOME = 4;
        const AMMO = 5;
        const JUNK = 6;

        //Arrow key codes
        const UP = 38;
        const DOWN = 40;
        const RIGHT = 39;
        const LEFT = 37;

        const ROWS = map.length;
        const COLUMNS = map[0].length;

        let health = 5;
        let ammo = 4;
        let dna = 0;

        var playerRow;
        var playerColumn;
        var zombieRow;
        var zombieColumn;

        //assign player row/columns
        for (var row = 0; row < ROWS; row++) {
            for (var column = 0; column < COLUMNS; column++) {
                if (objects[row][column] === PLAYER) {
                    playerRow = row;
                    playerColumn = column;
                }
                //and the zombie as well
                if (objects[row][column] === ZOMBIE) {
                    zombieRow = row;
                    zombieColumn = column;
                }
            }
        }
        //------------------------------------------------------------------

        function keydownHandler(event) {

            //check if the zombie got the player
            switch (event.keyCode) {
                case UP:
                    //checks if we're about to hit a plant. Then we fight it
                    if (map[playerRow - 1][playerColumn] == PLANT) {
                        fight();
                    }
                    //checks for playerRow validation, or collision with JUNK
                    else if (playerRow > 0 && (map[playerRow - 1][playerColumn] !== JUNK)) {
                        objects[playerRow][playerColumn] = 0; //clear current cell
                        playerRow--; //decrement the row
                        objects[playerRow][playerColumn] = PLAYER; //place new cell as player
                    }
                    break;

                case DOWN:
                    if (map[playerRow + 1][playerColumn] == PLANT) {
                        fight();
                    } else if (playerRow < ROWS - 1 && map[playerRow + 1][playerColumn] !== JUNK) {
                        objects[playerRow][playerColumn] = 0;
                        playerRow++;
                        objects[playerRow][playerColumn] = PLAYER;
                    }
                    break;

                case LEFT:
                    if (map[playerRow][playerColumn - 1] == PLANT) {
                        fight();
                    } else if (playerColumn > 0 && map[playerRow][playerColumn - 1] !== JUNK) {
                        objects[playerRow][playerColumn] = 0;
                        playerColumn--;
                        objects[playerRow][playerColumn] = PLAYER;
                    }
                    break;

                case RIGHT:
                    if (map[playerRow][playerColumn + 1] == PLANT) {
                        fight();
                    } else if (playerColumn < COLUMNS - 1 && map[playerRow][playerColumn + 1] !== JUNK) {
                        objects[playerRow][playerColumn] = 0;
                        playerColumn++;
                        objects[playerRow][playerColumn] = PLAYER;
                    }
                    break;
            }

            //find out what the player landed on
            switch (map[playerRow][playerColumn]) {
                case HOME:
                    endGame();
                    break;
                case AMMO:
                    reload();
                    heal();
                    break;
            }

            zombieMove();

            if (objects[playerRow][playerColumn] === ZOMBIE || objects[zombieRow][zombieColumn === PLAYER]) {
                endGame();
            }
            //find out if we're still alive
            if (health <= 0) {
                endGame();
            }

            //Render the game
            render();
        }

        //--------------------------------------------------------------------
        function fight() {
            //you got ammo?
            if (ammo > 0) {

                //yes, the plant is as strong as a human...randomly
                let playerStrength = Math.ceil(Math.random() * health * 2);
                let plantStrength = Math.ceil(Math.random() * (playerStrength));

                //lose some ammo
                ammo--;
                if (playerStrength > plantStrength) {
                    dna += Math.ceil(Math.random() * (plantStrength * 4));

                } else {
                    health--;
                }
            }
            //walking into the plant even without ammo still hurts you...
            else {
                health--;
            }
        }

        function endGame() {
            if (map[playerRow][playerColumn] === HOME) {
                //Calculate the score
                var score = ammo + health + dna;

                //celebratory victory music
                $('audio').get(0).play();
                //Display the game message
                $('output').html("You made it out alive! Your score is:&nbsp;" + score + "<br><button id='playAgain'>Play Again?</button>");
                $('#playAgain').click(function () {
                    location.reload();
                });
            } else if (objects[playerRow][playerColumn] === ZOMBIE) {
                $('output').html("You died to the zombie!");
            } else {
                //Display the game message
                $('output').html("Your health reached 0. You died!");
            }
            window.removeEventListener("keydown", keydownHandler, false);
        }

        function zombieMove() {
            var UP = 1;
            var DOWN = 2;
            var LEFT = 3;
            var RIGHT = 4;

            var validDirections = [];
            var direction;

            //find out what's in the cells, put options into the validDirections array...
            if (zombieRow > 0) {
                var thingAbove = map[zombieRow - 1][zombieColumn];
                if (thingAbove === GRASS) {
                    validDirections.push(UP);
                }
            }
            if (zombieRow < ROWS - 1) {
                var thingBelow = map[zombieRow + 1][zombieColumn];
                if (thingBelow === GRASS) {
                    validDirections.push(DOWN);
                }
            }
            if (zombieColumn > 0) {
                var thingToTheLeft = map[zombieRow][zombieColumn - 1];
                if (thingToTheLeft === GRASS) {
                    validDirections.push(LEFT);
                }
            }
            if (zombieColumn < COLUMNS - 1) {
                var thingToTheRight = map[zombieRow][zombieColumn + 1];
                if (thingToTheRight === GRASS) {
                    validDirections.push(RIGHT);
                }
            }

            //and then pop out an answer
            if (validDirections.length !== 0) {
                var randomNumber = Math.floor(Math.random() * validDirections.length);
                direction = validDirections[randomNumber];
            }
            //Move the zombie
            switch (direction) {
                case UP:
                    //clear the zombies cell
                    objects[zombieRow][zombieColumn] = 0;
                    //subtract one from the zombie's row
                    zombieRow--;
                    //Apply the monster's new updated position to the array
                    objects[zombieRow][zombieColumn] = ZOMBIE;
                    break;

                case DOWN:
                    objects[zombieRow][zombieColumn] = 0;
                    zombieRow++;
                    objects[zombieRow][zombieColumn] = ZOMBIE;
                    break;

                case LEFT:
                    objects[zombieRow][zombieColumn] = 0;
                    zombieColumn--;
                    objects[zombieRow][zombieColumn] = ZOMBIE;
                    break;

                case RIGHT:
                    objects[zombieRow][zombieColumn] = 0;
                    zombieColumn++;
                    objects[zombieRow][zombieColumn] = ZOMBIE;
                    break;
            }
        }

        var reload = () => {
            if (ammo == 10) {} else {
                ammo++;
            }
        }

        //max health is 6. if we have at least 10 DNA, take away 10, and heal to full health (the dna gives a bonus heal of +1 than starting) otherwise heal 1.
        var heal = () => {
            if (health == 6) {} else if (dna > 10) {
                dna -= 10;
                health = 6;
            } /*else {health++;}*/
        }

        function render() {

            //clear game from previous turns
            if ($('#game').children().length > 0) {
                $('#game').empty()
            }
            //Display the array
            for (var row = 0; row < ROWS; row++) {
                for (var column = 0; column < COLUMNS; column++) {
                    //Create a div HTML element called cell
                    var cell = document.createElement("div");
                    //Set it's CSS class to "cell"
                    cell.setAttribute("class", "cell");
                    switch (map[row][column]) {
                        case GRASS:
                            cell.style.opacity = "0.1";
                            break;
                        case HOME:
                            cell.style.backgroundImage = "url('img/home.png')";
                            break;
                        case AMMO:
                            cell.style.backgroundImage = "url('img/pot.png')";
                            break;
                        case JUNK:
                            cell.style.backgroundImage = "url('img/wall.png')";
                            break;
                        case PLANT:
                            cell.style.backgroundImage = "url('img/plant.png')";
                            break;
                    }
                    switch (objects[row][column]) {
                        case PLAYER:
                            cell.style.backgroundImage = "url('img/player.png')";
                            cell.style.opacity = 1;
                            break;
                        case ZOMBIE:
                            cell.style.backgroundImage = "url('img/zombie.png')";
                            cell.style.opacity = 1;
                            break;
                    }
                    $('#game').append(cell);
                }
            }
            $('ammo').html(ammo);
            $('life').html(health);
            $('dna').html(dna);
        } //end render
        render();
        window.addEventListener("keydown", keydownHandler, false);
    }); //end #start click
}); //end document.load()