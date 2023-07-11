import { Settings } from '../../helper/settings';
import { Item } from '../../models';
import { Dialog } from '../components/dialog';
import { Line } from '../components/line';
import { TextArea } from '../components/textarea';
import { InputHandler } from '../input';
import { center, fullScreen } from '../styles';

export class Screen {
    public elem: HTMLElement;
    public inputHandler?: InputHandler;

    constructor() {
        this.elem = document.createElement('div');
        fullScreen(this.elem);
        center(this.elem);
    }

    protected createButton(text: string, onClick: (e: MouseEvent) => void = () => {}) {
        const btn = document.createElement('button');
        btn.innerHTML = text;
        btn.onclick = onClick;
        return btn;
    }

    onResize() {}

    onMenu(prompt: string, count: number, items: Item[]) {}

    onDialog(text: string) {
        const dialog = new Dialog(text);
        this.elem.appendChild(dialog.elem);
    }

    onLine(question: string, autocomplete: string[]) {
        const line = new Line(question, autocomplete);
        this.createDialog(line.elem);

        line.onLineEnter = (line) => {
            window.nethackJS.sendLine(line);
            this.inputHandler = undefined;
        };

        this.inputHandler = line;
        line.focus();
    }

    onTextArea(value: string) {
        const textarea = new TextArea(value);
        this.createDialog(textarea.elem);

        textarea.onSubmit = (value) => {
            window.nethackJS.sendLine(value);
            this.inputHandler = undefined;
        };

        this.inputHandler = textarea;
        textarea.focus();
    }

    private createDialog(elem: HTMLElement) {
        const dialog = new Dialog();
        dialog.elem.appendChild(elem);
        this.elem.appendChild(dialog.elem);
    }

    onCloseDialog() {
        Dialog.removeAll();

        // Only dialogs might handle inputs, so if all are closed nothing should handle it
        this.inputHandler = undefined;
    }

    onSettingsChange(setting: Settings) {}
}
