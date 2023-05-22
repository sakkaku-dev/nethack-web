import { Item } from "../../models";
import { Dialog } from "./dialog";
import { CANCEL_KEY, CONTINUE_KEY, InputHandler } from "../input";
import { TileSet } from "./tilemap";
import { horiz } from "../styles";

export interface MenuItem {
    tile?: number;
    accelerator?: number;
    active?: boolean;

    text: string;
    id: number | string;
}

export class Menu extends Dialog implements InputHandler {

    public onSelect = (ids: string[]) => { };

    private accelMap: Record<string, HTMLInputElement> = {};
    private submitButton: HTMLButtonElement;

    constructor(prompt: string, items: MenuItem[], count: number, private tileset?: TileSet) {
        super(prompt);
        this.elem.appendChild(this.createMenu(items, count));

        this.submitButton = this.createSelectButton()
        this.elem.appendChild(this.submitButton);
    }

    onInput(e: KeyboardEvent): void {
        e.preventDefault();

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
            const ids = inputs.filter((i) => i.checked && !i.disabled).map((i) => i.value);
            this.onSelect(ids);
        };
        return btn;
    }

    private createMenu(items: MenuItem[], count: number) {
        let accelStart = 'a'.charCodeAt(0);
        this.accelMap = {};

        const list = document.createElement("div");
        list.style.display = "flex";
        list.style.flexDirection = "column";
        list.id = "menu";

        items.forEach((i) => {
            const div = document.createElement("div");
            horiz(div);
            if (i.id !== 0) {
                const id = `menu-${i.id}`;

                const elem = document.createElement("input");
                elem.type = count === 1 ? "radio" : "checkbox";
                elem.name = "menuSelect";
                elem.id = id;
                elem.checked = i.active || false;
                elem.value = `${i.id}`;

                // Hopefully when accel does not exist, then none of the items have one
                const accel = !!i.accelerator ? i.accelerator : accelStart;
                accelStart += 1;
                this.accelMap[String.fromCharCode(accel)] = elem;

                const label = document.createElement("label");
                label.htmlFor = id;
                label.innerHTML = i.text;

                div.appendChild(elem);
                if (i.tile && this.tileset) {
                    const img = this.tileset.createBackgroundImage(i.tile, accel);
                    div.appendChild(img);
                } else {
                    label.innerHTML = `${String.fromCharCode(accel)} - ${label.innerHTML}`;
                }
                div.appendChild(label);

            } else {
                div.appendChild(document.createTextNode(i.text || ' '));
            }

            list.appendChild(div);

        });

        return list;
    };

}