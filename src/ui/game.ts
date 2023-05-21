import { StartScreen } from "./screens/start-screen";
import { GameScreen } from "./screens/game-screen";
import { Screen } from "./screens/screen";

export class Game {

    public start: StartScreen;
    public game: GameScreen;

    private current?: Screen;

    constructor() {
        document.onkeydown = (e) => {
            this.current?.onInput(e);
        }

        window.onload = () => {
            this.changeScreen(this.start);
        };

        this.game = new GameScreen();
        this.start = new StartScreen();
        this.start.onStartGame = () => {
            this.changeScreen(this.game);
            window.nethackJS.startGame();
        }
    }

    changeScreen(screen: Screen) {
        if (this.current) {
            this.current.hide();
        }

        this.current = screen;
        this.current.show();
    }

}