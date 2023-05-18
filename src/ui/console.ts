export class Console {

    constructor(private elem: HTMLElement) {}

    appendLine(line: string) {
        this.elem.innerHTML += line + '\n';
        this.elem.scrollTo(0, this.elem.scrollHeight);
    }

}