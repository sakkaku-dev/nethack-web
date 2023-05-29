import { StartScreen } from "./screens/start-screen";
import { GameScreen } from "./screens/game-screen";
import { Screen } from "./screens/screen";
import { GameState, InventoryItem, Item, NetHackUI, Status, Tile } from "../models";
import { Gameover } from "./components/gameover";

const SPECIAL_KEY_MAP: Record<string, number> = {
    Enter: 13,
    Escape: 27,
};

export class Game implements NetHackUI {
    private start: StartScreen;
    private game: GameScreen;

    private current?: Screen;

    constructor() {
        document.body.onresize = (e) => this.current?.onResize();
        document.body.onkeydown = (e) => {
            if (this.current?.inputHandler) {
                this.current.inputHandler.onInput(e);
            } else {
                if (e.key === "Control" || e.key === "Shift") return;

                if (e.key.length === 1 || SPECIAL_KEY_MAP[e.key]) {
                    e.preventDefault();

                    let code = 0;

                    const specialKey = SPECIAL_KEY_MAP[e.key];
                    if (specialKey) {
                        code = specialKey;
                    } else {
                        code = e.key.charCodeAt(0);

                        // Same as in cmd.c for M() and C()
                        if (e.ctrlKey) {
                            code = code & 0x1f
                        } else if (e.altKey) {
                            code = 0x80 | code
                        }
                    }
                    window.nethackJS.sendInput(code);
                } else {
                    console.log("Unhandled key: ", e.key);
                }
            }
        };

        this.game = new GameScreen();
        this.start = new StartScreen();
    }

    openMenu = (winid: number, prompt: string, count: number, ...items: Item[]) => this.current?.onMenu(prompt, count, items);
    openQuestion = (question: string, defaultChoice: string, ...choices: string[]) => this.game.openQuestion(question, choices, defaultChoice);
    openGetLine = (question: string, ...autocomplete: string[]) => this.game.openGetLine(question, autocomplete);
    openDialog = (winid: number, text: string) => this.current?.onDialog(text);
    closeDialog = (winid: number) => this.current?.onCloseDialog();
    printLine = (line: string) => this.game.console.appendLine(line);
    moveCursor = (x: number, y: number) => this.game.tilemap.recenter({ x, y });
    centerView = (x: number, y: number) => this.game.tilemap.recenter({ x, y });
    clearMap = () => this.game.tilemap.clearMap();
    updateMap = (...tiles: Tile[]) => this.game.tilemap.addTile(...tiles);
    updateStatus = (s: Status) => this.game.status.update(s);
    updateInventory = (...items: InventoryItem[]) => this.game.inventory.updateItems(items);
    toggleInventory = () => this.game.inventory.toggle();

    updateState = async (state: GameState) => {
        switch (state) {
            case GameState.START:
                this.changeScreen(this.start);
                break;
            case GameState.RUNNING:
                this.changeScreen(this.game);
                break;
            case GameState.DIED:
                this.game.inventory.open();
                break;
            case GameState.GAMEOVER:
                this.game.openGameover();
                break;
        }
    };

    changeScreen(screen: Screen) {
        if (this.current) {
            document.body.removeChild(this.current.elem);
        }

        this.current = screen;
        document.body.appendChild(this.current.elem);
        this.current.onResize();
    }
}
