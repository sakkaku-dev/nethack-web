import { InputHandler } from "../input";
import { Dialog } from "./dialog";

export class Gameover extends Dialog implements InputHandler {

    constructor() {
        super('<div><strong>Gameover</strong></div> Press any key to go back to the menu.', false);
    }

    onInput(e: KeyboardEvent): void {
        window.location.reload();
    }

}