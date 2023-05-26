import { fullScreen, vert } from "../styles";

export class Dialog {
    public elem: HTMLElement;

    constructor(text = '') {
        const overlay = document.createElement("div");
        overlay.style.zIndex = "1";
        overlay.classList.add("dialog-overlay");
        fullScreen(overlay);
        document.body.appendChild(overlay);

        this.elem = document.createElement("pre");
        if (text !== "") {
            this.elem.innerHTML = this.escapeHtml(text);
        }
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

    static removeAll() {
        document.querySelectorAll(`.dialog`).forEach((elem) => {
            elem.classList.remove("open");
            setTimeout(() => {
                elem.remove();
                document.querySelectorAll(".dialog-overlay").forEach((e) => e.remove());
            }, 200);
        });
    }
}
