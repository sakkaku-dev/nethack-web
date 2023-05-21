import { InputHandler } from "../input";
import { fullScreen } from "../styles";

export class Screen implements InputHandler {

    public elem: HTMLElement
    private inputHandler?: InputHandler;

    constructor() {
        this.elem = document.createElement('div');
        fullScreen(this.elem);
    }

    changeInput(handler: InputHandler) {
        if (handler === this) {
            this.resetInput();
        } else {
            this.inputHandler = handler;
        }
    }

    resetInput() {
        this.inputHandler = undefined;
    }

    onInput(e: KeyboardEvent): void {
        if (this.inputHandler) {
            this.inputHandler.onInput(e);
        } else {
            this.input(e);
        }
    }

    input(e: KeyboardEvent) { }

    hide() {
        document.body.removeChild(this.elem);
    }

    show() {
        document.body.appendChild(this.elem);
    }
}