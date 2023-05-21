import { Item } from "../../models";
import { Dialog } from "./dialog";
import { CANCEL_KEY, CONTINUE_KEY, InputHandler } from "../input";
import { TileSet } from "./tilemap";

export class Menu extends Dialog implements InputHandler {

    public onSelect = (ids: number[]) => { };

    private accelMap: Record<string, HTMLInputElement> = {};
    private submitButton: HTMLButtonElement;

    constructor(prompt: string, items: Item[], private count: number, private tileset: TileSet) {
        super(prompt);
        this.elem.appendChild(this.createMenu(items, count));

        this.submitButton = this.createSelectButton()
        this.elem.appendChild(this.submitButton);
    }

    onInput(e: KeyboardEvent): void {
        if (CANCEL_KEY.includes(e.key)) {
            this.onSelect([]);
        } else if (CONTINUE_KEY.includes(e.key)) {
            this.submitButton.click();
        } else {
            const option = this.accelMap[e.key];
            if (option && !option.disabled) {
                option.checked = !option.checked;
                // if (this.count === 1) {
                //     this.submitButton.click();
                // }
            }
        }
    }

    private createSelectButton() {
        const btn = document.createElement("button");
        btn.innerHTML = "Submit";
        btn.onclick = () => {
            const inputs = Array.from(document.querySelectorAll("#menu input")) as HTMLInputElement[];
            const ids = inputs.filter((i) => i.checked && !i.disabled).map((i) => parseInt(i.value));
            this.onSelect(ids);
        };
        return btn;
    }

    private createMenu(items: Item[], count: number) {
        let accelStart = 'a'.charCodeAt(0);
        this.accelMap = {};

        const list = document.createElement("div");
        list.style.display = "flex";
        list.style.flexDirection = "column";
        list.id = "menu";

        items.forEach((i) => {
            const div = document.createElement("div");
            if (i.identifier !== 0) {
                const elem = document.createElement("input");
                const label = document.createElement("label");
                const id = `menu-${i.identifier}`;
                const hasAccel = i.accelerator !== 0;
                // Hopefully when accel does not exist, then none of the items have one
                const accel = String.fromCharCode(hasAccel ? i.accelerator : accelStart);
                accelStart += 1;

                this.accelMap[accel] = elem;

                elem.type = count === 1 ? "radio" : "checkbox";
                elem.name = "menuSelect";
                elem.id = id;
                elem.disabled = i.identifier === 0;
                elem.checked = i.active;
                elem.value = `${i.identifier}`;
                label.htmlFor = id;
                label.innerHTML = `${accel} - ${i.str}`;
                div.appendChild(elem);
                div.appendChild(label);
            } else {
                div.appendChild(document.createTextNode(i.str || ' '));
            }

            list.appendChild(div);

        });

        return list;
    };

}