export class Console {
    private elem: HTMLElement

    constructor(root: HTMLElement) {
        this.elem = document.createElement('pre');
        this.elem.id = 'output';
        root.appendChild(this.elem);
    }

    appendLine(line: string) {
        this.elem.innerHTML += line + '\n';
        this.elem.scrollTo(0, this.elem.scrollHeight);
    }

}