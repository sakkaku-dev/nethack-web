import { Item } from "../../models";
import { TileSet } from "./tilemap";
import { vert } from "../styles";
import { AccelButton } from "./accel-btn";

export class Menu {
    public elem: HTMLElement;
    public label: HTMLElement;

    private menuContainer?: HTMLElement;

    constructor(private prompt: string, private tileset?: TileSet) {
        this.elem = document.createElement("div");
        vert(this.elem);

        this.label = this.createLabel();
        this.elem.appendChild(this.label);
    }

    updateMenu(items: Item[], count: number) {
        if (this.menuContainer) {
            this.elem.removeChild(this.menuContainer);
        }
        this.menuContainer = document.createElement('div');
        vert(this.menuContainer);
        this.createMenu(items, this.menuContainer)

        this.elem.appendChild(this.menuContainer);
    }

    private createLabel() {
        const label = document.createElement("div");
        label.innerHTML = this.prompt;
        return label;
    }

    private createMenu(items: Item[], container: HTMLElement) {
        items.forEach((i) => {
            if (i.identifier !== 0) {
                container.appendChild(AccelButton(i, true, this.tileset));
            } else if (i.str !== "") {
                container.appendChild(AccelButton(i, false, this.tileset));
            }
        });

        return container;
    }
}
