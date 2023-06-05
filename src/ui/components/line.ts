import { CANCEL_KEY, InputHandler } from "../input";
import { horiz, vert } from "../styles";

export class Line implements InputHandler {
    public elem: HTMLElement;

    private input: HTMLInputElement;
    private list: HTMLElement;
    private possibleItems: string[] = [];

    onLineEnter = (line: string) => { };

    constructor(question: string, private autocomplete: string[]) {
        this.elem = document.createElement("div");
        vert(this.elem);

        const container = document.createElement("div");
        horiz(container);
        this.elem.appendChild(container);

        container.appendChild(document.createTextNode(question));
        this.possibleItems = autocomplete;

        const input = document.createElement("input");
        this.input = input;
        container.appendChild(input);
        input.onkeydown = (e) => {
            if (e.key === "Tab") {
                //prevent losing focus
                e.preventDefault();
            }
        };
        input.onkeyup = (e) => {
            // From BrowserHack
            if (e.key === "Enter") {
                e.preventDefault();
                this.onLineEnter(input.value);
            } else if (this.autocomplete.length) {
                this.updatePossibleItems();

                if (e.key === "Backspace") {
                    input.value = input.value.substring(0, input.selectionStart || 0);
                } else {
                    // we may press a, then press b before releasing a
                    // thus for the string "ab" we will receive two keyup events
                    // do not clear the selection
                    if (this.possibleItems.length == 1 && input.selectionStart == input.selectionEnd) {
                        this.suggestInput(this.possibleItems[0]);
                    }
                }
            }
        };

        this.list = document.createElement("div");
        vert(this.list);

        const autocompleteLen = this.autocomplete.length;
        if (autocompleteLen) {
            if (autocompleteLen > 1) {
                this.elem.appendChild(this.list);
                this.updateList();
            } else {
                this.suggestInput(this.autocomplete[0]);
            }
        }
    }

    private suggestInput(value: string) {
        const search = this.input.value;
        this.input.value = value;
        this.input.setSelectionRange(search.length, value.length);
    }

    private updatePossibleItems() {
        const possibleItems: string[] = [];
        const search = this.input.value;
        this.autocomplete.forEach(function (str) {
            if (str.indexOf(search) == 0) possibleItems.push(str);
        });

        this.possibleItems = possibleItems.filter(x => x.length > 1); // filter out #, ?
        this.updateList();
    }

    private updateList() {
        Array.from(this.list.children).forEach((e) => this.list.removeChild(e));

        this.possibleItems.forEach((item) => {
            const node = document.createElement("div");
            node.innerHTML = item;
            this.list.appendChild(node);
        });
    }

    onInput(e: KeyboardEvent): void {
        if (CANCEL_KEY.includes(e.key)) {
            this.onLineEnter("");
        }
    }

    focus() {
        this.input.focus();
    }
}
