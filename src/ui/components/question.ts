import { horiz } from '../styles';

export class Question {

    public elem: HTMLElement;
    private choices: HTMLElement;
    private text: HTMLElement;

    constructor(question: string, choices: string[], defaultChoice: string) {
        this.elem = document.createElement('div');
        horiz(this.elem);

        this.choices = document.createElement('div');
        horiz(this.choices);
        this.choices.style.gap = '0';

        this.text = document.createElement('div');
        this.elem.appendChild(this.text);
        this.elem.appendChild(this.choices);

        this.text.innerHTML = question;

        if (choices.length > 0) {
            this.choices.innerHTML = '[';

            choices.forEach((c) => {
                const node = document.createElement('span');
                node.innerHTML = c;

                if (c === defaultChoice) {
                    node.style.fontWeight = 'bold';
                    node.style.color = 'red';
                }

                this.choices.appendChild(node);
            });

            this.choices.innerHTML += ']';
        }
    }

    answered(choice: string) {
        this.elem.appendChild(document.createTextNode(choice))
    }

}
