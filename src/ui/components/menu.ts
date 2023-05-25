import { Item } from "../../models";
import { Dialog } from "./dialog";
import { TileSet } from "./tilemap";
import { horiz } from "../styles";

export class Menu extends Dialog {

    constructor(prompt: string, private tileset?: TileSet) {
        super(prompt);
    }

    updateMenu(items: Item[], count: number) {
        this.elem.childNodes.forEach(x => x.remove());
        this.elem.appendChild(this.createMenu(items, count));
    }

    private createMenu(items: Item[], count: number) {
        const list = document.createElement("div");
        list.style.display = "flex";
        list.style.flexDirection = "column";
        list.id = "menu";

        items.forEach((i) => {
            const div = document.createElement("div");
            horiz(div);
            if (i.identifier !== 0) {
                const id = `menu-${i.identifier}`;

                const elem = document.createElement("input");
                elem.type = count === 1 ? "radio" : "checkbox";
                elem.name = "menuSelect";
                elem.id = id;
                elem.checked = i.active || false;
                elem.value = `${i.identifier}`;

                const accel = i.accelerator;

                const label = document.createElement("label");
                label.htmlFor = id;
                label.innerHTML = i.str;

                div.appendChild(elem);
                if (i.tile && this.tileset) {
                    const img = this.tileset.createBackgroundImage(i.tile, accel);
                    div.appendChild(img);
                } else {
                    label.innerHTML = `${String.fromCharCode(accel)} - ${label.innerHTML}`;
                }
                div.appendChild(label);
            } else {
                div.appendChild(document.createTextNode(i.str || " "));
            }

            list.appendChild(div);
        });

        return list;
    }
}
