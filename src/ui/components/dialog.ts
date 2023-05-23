import { CANCEL_KEY, CONTINUE_KEY, InputHandler } from "../input";
import { fullScreen, vert } from "../styles";

export class Dialog implements InputHandler {
    public elem: HTMLElement;

    public onClose = () => { };

    constructor(text: string) {
        const overlay = document.createElement('div');
        overlay.style.zIndex = '1';
        overlay.classList.add('dialog-overlay');
        overlay.onclick = () => Dialog.removeAll();
        fullScreen(overlay);
        document.body.appendChild(overlay);

        this.elem = document.createElement("pre");
        this.elem.innerHTML = this.escapeHtml(text);
        vert(this.elem);
        this.elem.classList.add("dialog");
        setTimeout(() => {
            this.elem.classList.add("open");
        }, 100);
    }

    /// https://stackoverflow.com/questions/6234773/can-i-escape-html-special-chars-in-javascript
    private escapeHtml(unsafe: string) {
        return unsafe
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    onInput(e: KeyboardEvent): void {
        e.preventDefault();

        if ([...CANCEL_KEY, ...CONTINUE_KEY].includes(e.key)) {
            this.onClose();
        }
    }

    static removeAll() {
        document.querySelectorAll(`.dialog`).forEach((elem) => {
            elem.classList.remove("open");
            setTimeout(() => {
                elem.remove();
                document.querySelectorAll('.dialog-overlay').forEach(e => e.remove());
            }, 200);
        });
    }
}
