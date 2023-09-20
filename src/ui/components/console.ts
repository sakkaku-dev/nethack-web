export class Console {
    private elem: HTMLElement;

    constructor(root: HTMLElement) {
        this.elem = document.createElement('pre');
        this.elem.id = 'output';
        root.appendChild(this.elem);

        this.elem.onclick = () => {
            if (this.elem.style.height) {
                this.elem.style.height = '';
                setTimeout(() => this.scrollBottom(), 200); // Wait until transition finished
            } else {
                this.elem.style.height = '30rem';
            }
        }
    }

    // See Dialog
    // https://stackoverflow.com/questions/6234773/can-i-escape-html-special-chars-in-javascript
    private escapeHtml(unsafe: string) {
        return unsafe
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    appendLine(line: string) {
        const text = document.createElement('span');
        text.innerHTML = this.escapeHtml(line);
        this.elem.appendChild(text);
        this.scrollBottom();
    }

    append(elem: HTMLElement) {
        this.elem.appendChild(elem);
        this.scrollBottom();
    }

    private scrollBottom() {
        this.elem.scrollTo(0, this.elem.scrollHeight);
    }
}
