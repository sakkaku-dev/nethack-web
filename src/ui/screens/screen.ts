import { Item } from "../../models";
import { Dialog } from "../components/dialog";
import { InputHandler } from "../input";
import { center, fullScreen } from "../styles";

export class Screen {
    public elem: HTMLElement;
    public inputHandler?: InputHandler;

    constructor() {
        this.elem = document.createElement("div");
        fullScreen(this.elem);
        center(this.elem);
    }

    protected createButton(text: string, onClick: (e: MouseEvent) => void = () => { }) {
        const btn = document.createElement("button");
        btn.innerHTML = text;
        btn.onclick = onClick;
        return btn;
    }

    onResize() { }

    onMenu(prompt: string, count: number, items: Item[]) { }

    onDialog(text: string) {
        const dialog = new Dialog(text);
        this.elem.appendChild(dialog.elem);
    }

    onCloseDialog() {
        Dialog.removeAll();
    }
}
