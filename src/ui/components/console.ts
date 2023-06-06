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
                this.elem.style.height = '25rem';
            }
        }
    }

    appendLine(line: string) {
        this.elem.innerHTML += line + '\n';
        this.scrollBottom();
    }

    private scrollBottom() {
        this.elem.scrollTo(0, this.elem.scrollHeight);
    }
}
