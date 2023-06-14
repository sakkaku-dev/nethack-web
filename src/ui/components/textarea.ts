import { CANCEL_KEY, InputHandler } from '../input';
import { horiz, vert } from '../styles';

export class TextArea implements InputHandler {
    public elem: HTMLElement;
    private input: HTMLTextAreaElement;

    onSubmit = (value: string | null) => {};

    constructor(value: string) {
        this.elem = document.createElement('div');
        this.elem.style.width = '75vw';
        vert(this.elem);
        this.elem.appendChild(document.createTextNode('Ctrl+Enter to confirm'));

        this.input = document.createElement('textarea');
        this.input.value = value;
        this.input.rows = Math.max(value.split('\n').length, 10) + 5;
        this.elem.appendChild(this.input);

        this.input.onkeydown = (e) => {
            if (e.key === 'Tab') {
                //prevent losing focus
                e.preventDefault();
            }
        };
        this.input.onkeyup = (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                this.onSubmit(this.input.value);
            }
        };
    }

    onInput(e: KeyboardEvent): void {
        if (CANCEL_KEY.includes(e.key)) {
            this.onSubmit(null);
        }
    }

    focus() {
        this.input.focus();
    }
}
