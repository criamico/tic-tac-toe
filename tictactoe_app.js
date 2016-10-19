'use strict';
// credits: //https://www.ntu.edu.sg/home/ehchua/programming/java/JavaGame_TicTacToe_AI.html

(function(){


    function ticTacToe(){
        // initializations
        this.board = [['','',''],['','',''],['','','']];
        this.ROWS = 3;
        this.COLS = 3;
        this.isGameOver = false;
        this.emptyCell = '';  //empty cell

        // set the player'seed and consequently the pc's
        this.setSeed = function(seed){
            this.oppSeed = seed; //player's seed
            this.pcSeed = (this.oppSeed === 'X') ? 'O' : 'X';  //pc's seed
            // this.turn = this.oppSeed;  //current turn
        }

        // set who plays the first turn
        // 0 is the pc
        // 1 is the user
        this.setFirstTurn = function(n){
            this.turn = (n === 0) ? this.pcSeed : this.oppSeed;
        }


        // returns the current seed; needed to display in the board
        this.getTurn = function(){
            return this.turn;
        }
        // check that the cell is empty
        this.cellEmpty = function(i, j){
            if (this.board[i][j] === this.emptyCell)
                return true;
            return false;
        }

        // utility function to print the board
        this.print = function(){
            var out = '';
            for (var r = 0; r < this.ROWS; r++){
                for (var c = 0; c < this.COLS; c++){
                    if (this.board[r][c] === 'X' || this.board[r][c] === 'O')
                        out += this.board[r][c];
                    else
                        out += '-';
                }
                out += '|';
            }
            return out;
        }

        // add move in the board
        // check if indices are allowed and if the cell is empty
        this.addMove = function(player, row, col){
            if ((row >= 0 && row < this.COLS ) && (col >= 0 && col < this.COLS ) && this.cellEmpty(row, col))
                this.board[row][col] = player;
        }

        //delete a cell content
        // needed for the minimax algorithm
        this.deleteMove = function(player, row, col){
            if ((row >= 0 && row < this.COLS ) && (col >= 0 && col < this.COLS ) && this.board[row][col] === player)
                this.board[row][col] = this.emptyCell;

        }

        //reset the board
        this.reset = function(){
            this.board = [['','',''],['','',''],['','','']];
            this.isGameOver = false;
        }

        // evaluate a single line of the board
        this.evaluateLine = function (player, row1, col1, row2, col2, row3, col3) {
            if (this.board[row1][col1] === player && this.board[row2][col2] === player &&  this.board[row3][col3] === player)
                return true;
            return false;
        }

        // determine if a player is winning
        // checking for three-in-a-rows
        this.isWinning = function(player){
            if (this.evaluateLine(player, 0,0, 0,1, 0,2) || //row 0
                this.evaluateLine(player, 1,0, 1,1, 1,2) || //row 1
                this.evaluateLine(player, 2,0, 2,1, 2,2) || //row 2
                this.evaluateLine(player, 0,0, 1,0, 2,0) || //col 0
                this.evaluateLine(player, 0,1, 1,1, 2,1) || //col 1
                this.evaluateLine(player, 0,2, 1,2, 2,2) || //col 2
                this.evaluateLine(player, 0,0, 1,1, 2,2) || //diag 1
                this.evaluateLine(player, 0,2, 1,1, 2,0)    //diag 2
            )
                return true;
            return false;

        }

        // Find all possible next moves
        this.generateMoves = function(){
            var nextMoves = [];
            // Search for empty cells and push them to the array
            for (var r = 0; r < this.ROWS; r++){
                for (var c = 0; c < this.COLS; c++){
                    if (this.board[r][c] === this.emptyCell)
                        nextMoves.push([r,c]);
                }
            }
            return nextMoves;
        }

        // checks the state of the game
        // returns if the game is over or not
        // who wins: pc, user or draw
        this.checkState = function(){
            var pcWins = this.isWinning(this.pcSeed),
                oppWins = this.isWinning(this.oppSeed);

            // check if pc wins
            if (pcWins){
                this.isGameOver = true;
                return [this.isGameOver, this.pcSeed];
            }

            // check if user wins
            if (oppWins){
                console.log('gameover', this.oppSeed, 'won!');
                this.isGameOver = true;
                return [this.isGameOver, this.oppSeed];
            }

            // if none of the above is true, check if no moves are available
            // end of the game, in this case is a draw
            if (this.generateMoves().length === 0){
                this.isGameOver = true;
                return [this.isGameOver, 'Draw!'];
            }
            // the game continues (gameOver = false)
            return [this.isGameOver];
        }


        // evaluate the global score of the board
        // supposing that pcSeed is the maximizing player and oppSeed is the minimizing,
        // if pcSeed has a 3 in a row the score is +1 (pc wins)
        // if oppSeed has a 3 in a row the score is -1 (player wins)
        // if neither has a 3 in a row, score is 0 (draw)
        this.evaluate = function(){
            if (this.isWinning(this.pcSeed))
                return 1;
            else if (this.isWinning(this.oppSeed))
                return -1;
            else
                return 0;
        }


        // Minimax (recursive) at level of depth for maximizing or minimizing player with alpha-beta cut-off.
        // Returns [score, row, col]
        this.minimax = function(depth, player, alpha, beta){
            var score,
                move,
                bestRow = -1,
                bestCol = -1;

            // Generate possible next moves
            var nextMoves = this.generateMoves();

            // if depth reached or no next moves, evaluate score
            if (nextMoves.length === 0 || depth === 0){
                score = this.evaluate();
                return [score, bestRow, bestCol];
            }
            else{
                for (var i = 0; i < nextMoves.length; i++) {
                    move = nextMoves[i];

                     // Try this move for the current player
                    this.addMove(player, move[0], move[1]);

                    // pcSeed (computer) is maximizing player
                    if (player === this.pcSeed){
                        score = this.minimax(depth - 1, this.oppSeed, alpha, beta)[0];
                        if (score > alpha){
                            alpha = score;
                            bestRow = move[0];
                            bestCol = move[1];
                        }
                    }
                    else {   // oppSeed is minimizing player
                        score = this.minimax(depth - 1, this.pcSeed, alpha, beta)[0];
                        if (score < beta){
                            beta = score;
                            bestRow = move[0];
                            bestCol = move[1];
                        }
                    }
                    //undo test move
                    this.deleteMove(player, move[0], move[1]);

                    // cut-off
                    if (alpha >= beta)
                        break;
                }
            }
            return [(player === this.pcSeed) ? alpha : beta, bestRow, bestCol];
        }

        // userMove is optional, is used to input the move from the UI
        this.handleTurns = function(userMove){
            var newMove,
                pickId,
                row,
                col;

            // exit if the game is over
            if (this.isGameOver){
                // console.log(this.turn);
                return;
            }

            // handle pc turn (check that the game is not over yet)
            if (this.turn === this.pcSeed){

                // call minimax algorithm
                newMove = this.minimax(2, this.turn, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY );

                // add the move in the board
                this.addMove(this.turn, newMove[1], newMove[2]);

                // add the seed in the graphical board
                pickId = '#' + newMove[1] + newMove[2];
                $(pickId).text(this.turn);
                $(pickId).css('pointer-events', 'none');

                // switch the turn to be ready for next player move
                this.turn = this.oppSeed;
                // console.log('current turn', this.getTurn());


            }
            // player's turn
            else if(this.turn === this.oppSeed){
                // add the move in the board
                this.addMove(this.turn, userMove[0], userMove[1]);

                // add the move in the graphical board
                pickId = '#' + userMove[0] + userMove[1];
                $(pickId).text(this.turn);
                $(pickId).css('pointer-events', 'none');

                // after a cell is filled, the link is made unclickable
                $(this).css('pointer-events', 'none');

                // switch the turn to be ready for next pc move
                this.turn = this.pcSeed;
                // console.log('current turn', this.getTurn());
            }

            // check if the game is over and who's winning
            return this.checkState();
        }

    }
    $(window).on('load', function(){
        var output = [],
            seed,
            fTurn;
        var game = new ticTacToe();

        // select all the cells
        var $cells = $('.cell');


        function onCellsClick(){
            var newMove = [];

            // choose a default seed if none is picked
            if (seed === undefined){
                seed = 'O';
                game.setSeed(seed);
                disableSeedButtons(seed);

            }
            // default first turn if none is picked
            if (fTurn === undefined){
                fTurn = 1;
                game.setFirstTurn(fTurn);
                // console.log(game.getTurn());
                disableTurnButtons('First turn is yours');
            }

            if (game.getTurn() === seed){
                newMove = [Number($(this).attr('id')[0]), Number($(this).attr('id')[1])];
                output = game.handleTurns(newMove);
                formatOutput(output);


                window.setTimeout(function() {
                    output = game.handleTurns();
                    formatOutput(output);
                }, 1000);

            }

        }

        // displays the output in the UI
        function formatOutput(arr){
            if (arr !== undefined && arr[0]){
                if (arr[1].length === 1)
                    $('#info').text(arr[1] + ' won!');
                else
                    $('#info').text(arr[1]);
            }
        }

        // when reset is clicked,
        // the internal board is cleared
        // the cells are reset at the initial state and clickable
        function onResetButton(){
            game.reset();
            $cells.css('pointer-events', 'auto');
            $cells.text(' ');
            $('#info').text('');

            // enable all the buttons
            $('.seed').attr("disabled", false);
            $('.turn').attr("disabled", false);

            // reset labels
            $('#seedText').text('Choose your seed');
            $('#turnText').text('Who plays first');
        }

        // disable both the buttons and change the text
        function disableSeedButtons(seed){
            $('.seed').attr("disabled", true);
            $('#seedText').text('Your seed: ' + seed);
        }

        //disable both the buttons
        function disableTurnButtons(text){
            $('.turn').attr("disabled", true);
            $('#turnText').text(text);
        }

        // on button clicked, set the player's seed
        function chooseSeed(){
            seed = $(this).text();

            // set the seeds
            game.setSeed($(this).text());

            // now disable both the buttons and change the text
            disableSeedButtons(seed);
        }

        function pickFirstTurn(){
            // set the first turn: 0 pc, 1 user
            var newText;
            if ($(this).attr('id') === 'User'){
                fTurn = 1;
                newText = 'First turn is yours';
            }
            else{
                fTurn = 0;
                newText = "First turn is PC's";
            }

            game.setFirstTurn(fTurn);

             // now disable both the buttons
            disableTurnButtons(newText);

            // if first turn for the pc, execute the first move
            if (fTurn === 0){
                window.setTimeout(function() {
                    output = game.handleTurns();
                    formatOutput(output);
                }, 1000);
            }
        }

        $('.seed').on('click', chooseSeed);
        $('.turn').on('click', pickFirstTurn);
        $cells.on("click", onCellsClick);
        $('#reset-btn').on('click', onResetButton);


    });
})()
