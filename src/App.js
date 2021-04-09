import {useState} from "react";
import "./main.css";

function App() {
    const [gameState, setGameState] = useState("NEW");

    function onGameState(state) {
        if (state === "END") {
            setGameState("END");
        }
    }

    return (
        <div className="App">
            <div style={{display: "flex"}}>
                <h1>Mine Sweeper</h1>
                {gameState === "END" && <h3>GAME END <span onClick={() => setGameState("NEW")}>RESTART</span></h3>}
            </div>
            <div style={{flex: 1}}>
                <Game key={"GAME"} gridX={25} gridY={15} mines={35} onGameState={onGameState}/>
            </div>
        </div>
    );
}

function createKey(x, y) {
    return `${x}_${y}`;
}

function generateGameMap(mines = 20, y = 10, x = 10, map = {}) {
    if (mines <= 0)
        return map;
    let whileCounter = 0;
    while (true) {
        if (whileCounter > 10)
            break;
        whileCounter++;

        const randX = Math.floor(Math.random() * x);
        const randY = Math.floor(Math.random() * y);
        const key = createKey(randX, randY);
        if (!map[key]) {
            map[key] = "MINE";
            // top row
            addMineNumber(randX - 1, randY - 1, map);
            addMineNumber(randX, randY - 1, map);
            addMineNumber(randX + 1, randY - 1, map);
            // center
            addMineNumber(randX + 1, randY, map);
            addMineNumber(randX - 1, randY, map);
            // bottom row
            addMineNumber(randX - 1, randY + 1, map);
            addMineNumber(randX, randY + 1, map);
            addMineNumber(randX + 1, randY + 1, map);

            break;
        }
    }

    return generateGameMap(mines - 1, y, x, map);
}

function addMineNumber(x, y, map) {
    const key = createKey(x, y);
    if (map[key] == null)
        map[key] = 1;
    else if (map[key] != null && typeof map[key] === "number") {
        map[key]++;
    }
}

function getTileType(value) {
    if (value == null)
        return "REGULAR";
    else if (typeof value === "number")
        return "NUMBER";
    else if (value === "MINE")
        return "MINE";
    else
        return "REGULAR";
}

function Game(props) {
    const {gridX, gridY, mines, onGameState} = props;
    const [state, setState] = useState(newGameState());
    const {openMap, gameMap, markedMap} = state;

    function newGameState(){
        return {
            openMap: {},
            markedMap: {},
            gameMap: generateGameMap(mines, gridY, gridX)
        }
    }

    function openTile(x, y, map = {}) {
        if (x < 0 || y < 0 || x > gridX || y > gridY)
            return map;
        const key = createKey(x, y);
        if (map[key])
            return map;

        map[key] = true;
        if (gameMap[key])
            return map;

        return {
            ...map,
            ...openTile(x - 1, y - 1, map),
            ...openTile(x, y - 1, map),
            ...openTile(x + 1, y - 1, map),
            ...openTile(x - 1, y, map),
            ...openTile(x + 1, y, map),
            ...openTile(x - 1, y + 1, map),
            ...openTile(x, y + 1, map),
            ...openTile(x + 1, y + 1, map),
        }
    }

    function trySweep(x, y) {
        const key = createKey(x, y);
        const isOpen = openMap[key];
        const type = getTileType(gameMap[key]);

        if (isOpen)
            return;
        else if (type === "MINE") {

            return onGameState("END");
        }

        const newMap = openTile(x, y, openMap);

        setState({
            ...state,
            openMap: {...newMap}
        });
    }

    function tryOpen(x, y) {
        const key = createKey(x, y);
        const isOpen = openMap[key];
        if(markedMap[key])
            setState({
                ...state,
                markedMap: {
                    ...markedMap,
                    [key]: false
                }
            })
        else if (!isOpen) {
            setState({
                ...state,
                markedMap: {
                    ...markedMap,
                    [key]: true
                }
            })
        }
    }

    return <div className={"Grid"}>
        {
            [...Array(gridY).keys()].map(y => {

                return <div style={{display: "flex", flex: 1}}>{
                    [...Array(gridX).keys()].map(x => {
                        const key = createKey(x, y);
                        const isOpen = openMap[key] != null;
                        const type = getTileType(gameMap[key])

                        return <Square
                            key={key}
                            type={type}
                            value={gameMap[key]}
                            isOpen={isOpen}
                            isMarked={!!markedMap[key]}
                            onClick={() => {
                                trySweep(x, y);
                            }}
                            onRightClick={() => {
                                tryOpen(x, y);
                            }}
                        />
                    })
                }</div>;
            })
        }
    </div>
}

function Square(props) {
    const {type, value, isOpen, onClick, onRightClick, isMarked} = props;

    let tileDisplay;

    if (type === "MINE")
        tileDisplay = "X";
    else if (type === "NUMBER")
        tileDisplay = value || 1;

    return <div onClick={onClick}
                onContextMenu={event => {
                    event.preventDefault();
                    onRightClick();
                }}
                className={"Tile"}
                style={{
                    background: isOpen ? "white" : "grey"
                }}>
        {!isOpen && isMarked?"[]":isOpen && <div>{tileDisplay}</div>}
    </div>
}

export default App;
