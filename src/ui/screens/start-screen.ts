import { Item } from "../../models";
import { title, vert } from "../styles";
import { Screen } from "./screen";

export class StartScreen extends Screen {

    private container: HTMLElement;
    private header: HTMLElement;
    private menuContainer?: HTMLElement;

    constructor() {
        super();

        this.container = document.createElement("div");
        vert(this.container);

        this.header = document.createElement("div");
        this.header.style.marginBottom = "2rem";
        title(this.header);

        this.container.appendChild(this.header);
        this.elem.appendChild(this.container);
    }

    onMenu(prompt: string, count: number, items: Item[]): void {
        this.header.innerHTML = prompt;

        if (this.menuContainer) {
            this.container.removeChild(this.menuContainer);
        }

        this.menuContainer = document.createElement('div');
        vert(this.menuContainer);
        this.container.appendChild(this.menuContainer);

        items.forEach(i => {
            const btn = this.createButton(`${String.fromCharCode(i.accelerator)} - ${i.str}`);
            if (i.active) {
                btn.classList.add('active');
            }
            this.menuContainer?.appendChild(btn);
        });
    }

}
