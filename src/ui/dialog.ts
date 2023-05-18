import { CANCEL_KEY, CONTINUE_KEY, InputHandler } from "./input";

export class Dialog implements InputHandler {

    public elem: HTMLElement;

    public onClose = () => { };

    constructor(text: string) {
        this.elem = document.createElement('pre');
        this.elem.innerHTML = text;
        this.elem.classList.add("dialog");
        setTimeout(() => {
            this.elem.classList.add("open");
        }, 100);
    }
    onInput(e: KeyboardEvent): void {
        if ([...CANCEL_KEY, ...CONTINUE_KEY].includes(e.key)) {
            this.onClose();
        }
    }

    static removeAll() {
        document.querySelectorAll(`.dialog`).forEach((elem) => {
            elem.classList.remove("open");
            setTimeout(() => elem.remove(), 200);
        });
    }

}