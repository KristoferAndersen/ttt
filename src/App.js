import { useState } from 'react';
import { isCompositeComponent } from 'react-dom/test-utils';

function Square({value, winner, onSquareClick}) {
    let classNames = ["square"]
    if (winner) {
        classNames.push("square-winner");
    }
    return (
        <button className={classNames.join(' ')} onClick={onSquareClick}>
            {value}
        </button>
    );
}

export default function Game() {
    const [ascending, setAscending] = useState(true);
    const [history, setHistory] = useState([Array(9).fill(null)]);
    const [currentMove, setCurrentMove] = useState(0);
    const xIsNext = currentMove % 2 === 0;
    const currentSquares = history[currentMove];
    
    function handlePlay(nextSquares) {
        const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
        setHistory(nextHistory);
        setCurrentMove(nextHistory.length-1);
    }

    function jumpTo(nextMove) {
        setCurrentMove(nextMove);
    }

    const moves = history.map((squares, move) => {
        let description;
        if (move === 0) {
            description = 'Go to game start';
        } else if (move === currentMove) {
            description = 'You are at move #' + move;
        } else {
            description = 'Go to move #' + move;
        }

        let row;
        if (move === currentMove) {
            row = <div key={move}>{description}</div>;
        } else {
            row = <button key={move} onClick={() => jumpTo(move)}>{description}</button>;
        }

        return (
            <li key={move}>
                {row}
            </li>
        );
    }).sort((a, b) => {
        if (ascending) {
            return a.key > b.key;
        } else {
            return a.key < b.key;
        }
    });

    return (
        <div className="game">
            <div className="game-board">
                <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
            </div>
            <div className="game-info">
                <button onClick={() => { setAscending(!ascending); }}>{ascending ? "Use descending order" : "Use ascending order"}</button>
                <ul>{moves}</ul>
            </div>
        </div>
    )

}

function Board({ xIsNext, squares, onPlay }) {
    function handleClick(i) {
        if (squares[i] || calculateWinner(squares)) {
            return;
        }

        const nextSquares = squares.slice();
        if (xIsNext) {
            nextSquares[i] = "X";
        } else {
            nextSquares[i] = "O";
        }

        onPlay(nextSquares);
    }

    const win = calculateWinner(squares);
    let status;
    if (win) {
        status = "Winner: " + win[0];
    } else {
        status = "Next player: " + (xIsNext ? "X" : "O");
    }

    const rows = [];
    for (let i = 0; i < 3; i++) {
        const row = [];
        for (let j = 0; j < 3; j++) {
            let square = i*3+j
            let winner = false;
            if (win) {
                win[1].forEach((winningSquare) => (winner |= square === winningSquare));
            }
            row.push(<Square key={square} value={squares[square]} winner={winner} onSquareClick={() => handleClick(square)}/>);
        }
        rows.push(<div key={"row_"+i} className="board-row">{row}</div>);
    }

    return (
        <>
            <div className="board-title">{status}</div>
            {rows}
        </>
    );
}
  
function calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return [squares[a], [a, b, c]];
      }
    }
    return null;
}