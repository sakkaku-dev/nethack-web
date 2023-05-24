import { Item } from "../../models";
import { InputHandler } from "../input";
import { center, fullScreen } from "../styles";

export class Screen implements InputHandler {
    public elem: HTMLElement;
    private inputHandler?: InputHandler;

    constructor() {
        this.elem = document.createElement("div");
        fullScreen(this.elem);
        center(this.elem);
    }

    protected createButton(text: string, onClick: (e: MouseEvent) => void) {
        const btn = document.createElement("button");
        btn.innerHTML = text;
        btn.onclick = onClick;
        return btn;
    }

    protected changeInput(handler: InputHandler) {
        if (handler === this) {
            this.resetInput();
        } else {
            this.inputHandler = handler;
        }
    }

    protected resetInput() {
        this.inputHandler = undefined;
    }

    onInput(e: KeyboardEvent): void {
        if (this.inputHandler) {
            this.inputHandler.onInput(e);
        } else {
            this.input(e);
        }
    }

    onResize() { }

    onMenu(prompt: string, count: number, items: Item[]) { }

    input(e: KeyboardEvent) { }
}
