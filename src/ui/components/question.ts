import { Dialog } from "./dialog";
import { horiz } from "../styles";

export class Question extends Dialog {

    constructor(question: string, choices: string[], defaultChoice: string) {
        super(question);
        horiz(this.elem);

        const choicesContainer = document.createElement('div');
        horiz(choicesContainer);
        choicesContainer.style.gap = '0';
        choicesContainer.innerHTML = '[';

        choices.forEach(c => {
            const node = document.createElement('span');
            node.innerHTML = c;

            if (c === defaultChoice) {
                node.style.fontWeight = 'bold';
                node.style.color = 'red';
            }

            choicesContainer.appendChild(node);
        });

        choicesContainer.innerHTML += ']';
        this.elem.appendChild(choicesContainer);
    }
}