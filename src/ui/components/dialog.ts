import { CANCEL_KEY, CONTINUE_KEY, InputHandler } from "../input";

export class Dialog implements InputHandler {

    public elem: HTMLElement;

    public onClose = () => { };

    constructor(text: string) {
        this.elem = document.createElement('pre');
        this.elem.innerHTML = this.escapeHtml(text);
        this.elem.classList.add("dialog");
        setTimeout(() => {
            this.elem.classList.add("open");
        }, 100);
    }

    /// https://stackoverflow.com/questions/6234773/can-i-escape-html-special-chars-in-javascript
    private escapeHtml(unsafe: string) {
        return unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
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