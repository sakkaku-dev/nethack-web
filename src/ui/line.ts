import { Dialog } from "./dialog";
import { CANCEL_KEY, InputHandler } from "./input";

export class Line extends Dialog implements InputHandler {

    private input: HTMLInputElement;

    onLineEnter = (line: string) => { };

    constructor(question: string, private autocomplete: string[]) {
        super(question);

        const input = document.createElement('input');
        this.input = input;
        this.elem.appendChild(input);
        input.onkeydown = e => {
            if (e.key === 'Tab') {
                //prevent losing focus
                e.preventDefault();
            }
        }
        input.onkeyup = e => {
            // From BrowserHack
            if (e.key === 'Enter') {
                e.preventDefault();
                this.onLineEnter(input.value);
            } else if (this.autocomplete.length) {
                if (e.key === 'Backspace') {
                    input.value = input.value.substring(0, input.selectionStart || 0);
                } else {
                    const possibleItems: string[] = [];
                    const search = input.value;
                    this.autocomplete.forEach(function (str) {
                        if (str.indexOf(search) == 0)
                            possibleItems.push(str);
                    });
                    // we may press a, then press b before releasing a
                    // thus for the string "ab" we will receive two keyup events
                    // do not clear the selection
                    if ((possibleItems.length == 1) && (input.selectionStart == input.selectionEnd)) {
                        input.value = possibleItems[0];
                        input.setSelectionRange(search.length, possibleItems[0].length);
                    }
                }
            }
        };
    }

    onInput(e: KeyboardEvent): void {
        if (CANCEL_KEY.includes(e.key)) {
            this.onLineEnter('');
        }
    }

    focus() {
        this.input.focus();
    }

}