/*----- constants -----*/
const SPAN = {
    'black': `<span class="black-piece"></span>`,
    'blackKing': `<span class="black-king"></span>`,
    'red': `<span class="red-piece"></span>`,
    'redKing': `<span class="red-king"></span>`,
}

const colorToFind = {
    "black": "red",
    "red": "black"
}

class Piece {
    constructor(color, player, coordinates) {
        this.color = color;
        this.player = player;
        this.selected = false;
        this.king = false;
        this.coordinates = coordinates;
        this.moveCoordinates = [];
        this.mvDiagUpLeft = false;
        this.mvDiagUpRight = false;
        this.jumpDiagUpLeft = false;
        this.jumpDiagUpRight = false;
        this.mvDiagDownLeft = false;
        this.mvDiagDownRight = false;
        this.jumpDiagDownLeft = false;
        this.jumpDiagDownRight = false;
        this.canMove = false;
    }
}

/*----- state variables -----*/
let board;
let turn; 
let blackScore; 
let redScore; 
let playerPieces;
let selectedPiece; 
let winner;
let blackGraveyard;
let redGraveyard;

/*----- cached elements  -----*/
const squareEls = document.querySelectorAll('#board > div');
const messageEl = document.querySelector('main h1');
const changePieceEl = document.getElementById('change-piece');
const boardEl = document.getElementById("board");
const playAgainBtnEl = document.getElementById('play-again');
const redGraveyardEl = document.getElementById('red-graveyard');
const blackGraveyardEl = document.getElementById('black-graveyard');

/*----- event listeners -----*/
boardEl.addEventListener("click", function (evt) {
    selectedPiece ? handleMovePiece(evt) : handleClick(evt)
});

changePieceEl.addEventListener('click', function() {
    squareEls.forEach(SquareEl => SquareEl.style.border = '');
    selectedPiece = null;
    render();
});

playAgainBtnEl.addEventListener('click', init);


/*----- functions -----*/
init();

function init() {
    board = [
        [null, -1, null, -1, null, -1, null, -1],
        [-1, null, -1, null, -1, null, -1, null],
        [null, -1, null, -1, null, -1, null, -1],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [1, null, 1, null, 1, null, 1, null],
        [null, 1, null, 1, null, 1, null, 1],
        [1, null, 1, null, 1, null, 1, null],
    ];
    turn = 1;
    blackScore = 12;
    redScore = 12;
    winner = null;
    selectedPiece = null;
    blackGraveyard = [];
    redGraveyard = [];
    setBoard();
    getAvailMoves();
    render();
}

function setBoard() {
    for (let r = 0; r < board.length; r++) {
        for (let c = 0; c < board[r].length; c++) {
            if (board[r][c] === 1) board[r][c] = new Piece("black", 1, [r, c]);
            if (board[r][c] === -1) board[r][c] = new Piece("red", -1, [r, c]);
        }
    }
}

function render() {
    renderBoard();
    renderGraveYards();
    if (winner) messageEl.innerHTML = winner === 1 ? '<span style="color: black">BLACK WINS!</span>' : '<span style="color: red">RED WINS!</span>';
    else messageEl.innerHTML = turn === 1 ? '<span style="color: black">BLACK\'s TURN</span>' : '<span style="color: red">RED\'s TURN</span>'
    playAgainBtnEl.style.visibility = winner ? 'visible' : 'hidden';
    changePieceEl.style.visibility = selectedPiece ? 'visible' : 'hidden';
}

function renderGraveYards() {
    redGraveyardEl.innerHTML = "";
    blackGraveyardEl.innerHTML = "";
    redGraveyard.forEach(redGrave => {
        const newSpan = document.createElement("span");
        const color = redGrave.king ? "red-king" : "red-piece";
        newSpan.classList.add(color)
        redGraveyardEl.appendChild(newSpan);
    })
    blackGraveyard.forEach(blackGrave => {
        const newSpan = document.createElement("span");
        const color = blackGrave.king ? "black-king" : "black-piece";
        newSpan.classList.add(color)
        blackGraveyardEl.appendChild(newSpan);
    })
}


function renderBoard() {
    for (let r = 0; r < board.length; r++) {
        for (let c = 0; c < board[r].length; c++) {
            const sqEl = document.getElementById(`r${r}c${c}`);
            if (board[r][c] && board[r][c].selected) sqEl.style.border = '3px dotted yellow';
            else sqEl.style.border = 'none';

            if (board[r][c]) sqEl.innerHTML = board[r][c].king ? SPAN[`${board[r][c].color}King`] : SPAN[board[r][c].color]
            else sqEl.innerHTML = "";
            
        }
    }
}

function handleClick(evt) {
    let row, col;
    if (evt.target.tagName === "SPAN") {
        row = parseInt(evt.target.parentElement.id[1]);
        col = parseInt(evt.target.parentElement.id[3]);
    } else {
        row = parseInt(evt.target.id[1]);
        col = parseInt(evt.target.id[3]);
    }

    if (!board[row][col] ||
        board[row][col].player !== turn ||
        !board[row][col].canMove ||
        board[row][col].moveCoordinates.length === 0 ||
        winner) return;

    selectedPiece = board[row][col];
    selectedPiece.selected = true;

    getAvailMoves();
    render();
}


function getAvailMoves() {
    for (let r = 0; r < board.length; r++) {
        for (let c = 0; c < board[r].length; c++) {
            if (!board[r][c]) continue;
            board[r][c].moveCoordinates = [];
            if (board[r][c].color === "black" || board[r][c].king) board[r][c].mvDiagUpLeft = checkDiagUpLeft(r - 1, c - 1);
            if (board[r][c].color === "black" || board[r][c].king) board[r][c].mvDiagUpRight = checkDiagUpRight(r - 1, c + 1);
            if (board[r][c].color === "black" || board[r][c].king) board[r][c].jumpDiagUpLeft = checkJumpDiagUpLeft(r - 2, c - 2, colorToFind[board[r][c].color]);
            if (board[r][c].color === "black" || board[r][c].king) board[r][c].jumpDiagUpRight = checkJumpDiagUpRight(r - 2, c + 2, colorToFind[board[r][c].color]);
            if (board[r][c].color === "red" || board[r][c].king) board[r][c].mvDiagDownLeft = checkDiagDownLeft(r + 1, c - 1);
            if (board[r][c].color === "red" || board[r][c].king) board[r][c].mvDiagDownRight = checkDiagDownRight(r + 1, c + 1);
            if (board[r][c].color === "red" || board[r][c].king) board[r][c].jumpDiagDownLeft = checkJumpDiagDownLeft(r + 2, c - 2, colorToFind[board[r][c].color]);
            if (board[r][c].color === "red" || board[r][c].king) board[r][c].jumpDiagDownRight = checkJumpDiagDownRight(r + 2, c + 2, colorToFind[board[r][c].color]);
            if (board[r][c].mvDiagUpLeft || board[r][c].mvDiagUpRight || board[r][c].jumpDiagUpLeft || board[r][c].jumpDiagUpRight ||
                board[r][c].mvDiagDownLeft || board[r][c].mvDiagDownRight || board[r][c].jumpDiagDownLeft || board[r][c].jumpDiagDownRight) board[r][c].canMove = true;
        }
    }
}

function checkBoundaries(row, col) {
    if (row < 0 || row > board.length - 1 || col < 0 || col > board[row].length - 1) return true;
    return false;
}

function checkDiagUpLeft(row, col) {
    if (checkBoundaries(row, col) || board[row][col]) return false;
    board[row + 1][col + 1].moveCoordinates.push([row, col]);
    return true;
}

function checkDiagUpRight(row, col) {
    if (checkBoundaries(row, col) || board[row][col]) return false;
    board[row + 1][col - 1].moveCoordinates.push([row, col]);
    return true;
}

function checkJumpDiagUpLeft(row, col, colorToFind) {
    if (checkBoundaries(row, col) || board[row][col] || !board[row + 1][col + 1] || board[row + 1][col + 1].color !== colorToFind) return false;
    board[row + 2][col + 2].moveCoordinates.push([row, col]);
    return true;
}

function checkJumpDiagUpRight(row, col, colorToFind) {
    if (checkBoundaries(row, col) || board[row][col] || !board[row + 1][col - 1] || board[row + 1][col - 1].color !== colorToFind) return false;
    board[row + 2][col - 2].moveCoordinates.push([row, col]);
    return true;
}

function checkDiagDownLeft(row, col) {
    if (checkBoundaries(row, col) || board[row][col]) return false;
    board[row - 1][col + 1].moveCoordinates.push([row, col]);
    return true;
}

function checkDiagDownRight(row, col) {
    if (checkBoundaries(row, col) || board[row][col]) return false;
    board[row - 1][col - 1].moveCoordinates.push([row, col]);
    return true;
}

function checkJumpDiagDownLeft(row, col, colorToFind) {
    if (checkBoundaries(row, col) || board[row][col] || !board[row - 1][col + 1] || board[row - 1][col + 1].color !== colorToFind) return false;
    board[row - 2][col + 2].moveCoordinates.push([row, col]);
    return true;
}

function checkJumpDiagDownRight(row, col, colorToFind) {
    if (checkBoundaries(row, col) || board[row][col] || !board[row - 1][col - 1] || board[row - 1][col - 1].color !== colorToFind) return false;
    board[row - 2][col - 2].moveCoordinates.push([row, col]);
    return true;
}

function handleMovePiece(evt) {
    let row, col;

    if (!selectedPiece || !selectedPiece.canMove) return;

    if (evt.target.tagName === "SPAN") {
        row = parseInt(evt.target.parentElement.id[1]);
        col = parseInt(evt.target.parentElement.id[3]);
    } else {
        row = parseInt(evt.target.id[1]);
        col = parseInt(evt.target.id[3]);
    }

    for (let i = 0; i < selectedPiece.moveCoordinates.length; i++) {
        let pieceMoveRow = selectedPiece.moveCoordinates[i][0];
        let pieceMoveCol = selectedPiece.moveCoordinates[i][1];
        let jump = false;
        if (pieceMoveRow === row && pieceMoveCol === col) {
            if (Math.abs(selectedPiece.coordinates[0] - pieceMoveRow) + Math.abs(selectedPiece.coordinates[1] - pieceMoveCol) === 4) jump = true;
            if (jump) {
                removeRow = (selectedPiece.coordinates[0] - pieceMoveRow) / 2;
                removeCol = (selectedPiece.coordinates[1] - pieceMoveCol) / 2;
                let lostPiece = board[row + removeRow][col + removeCol];
                board[row + removeRow][col + removeCol] = null;
                if (lostPiece.color === "red") {
                    redScore--;
                    redGraveyard.push(lostPiece);
                }
                if (lostPiece.color === "black") {
                    blackScore--;
                    blackGraveyard.push(lostPiece);
                };
            }
            board[selectedPiece.coordinates[0]][selectedPiece.coordinates[1]] = null;
            selectedPiece.selected = false;
            selectedPiece.coordinates = [row, col];
            board[row][col] = selectedPiece;
            if (selectedPiece.color === "black" && row === 0) {
                selectedPiece.king = true;
            }
            if (selectedPiece.color === "red" && row === 7) selectedPiece.king = true;
            selectedPiece = null;
            turn *= -1;
            break;
        }
    }
    getAvailMoves();
    squareEls.forEach(SquareEl => SquareEl.style.border = '');
    winner = checkWinner();
    render();
}

function checkWinner() {
    if (blackScore === 0) return -1;
    if (redScore === 0) return 1;
    return null;
}