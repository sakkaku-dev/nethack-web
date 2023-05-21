import { Item } from "../../models";
import { TileSet } from "./tilemap";

// From BrowserHack
const parse_inventory_description = (item: Item) => {
    // parse count
    let description = item.str;
    let r = description.split(/^(a|an|\d+)\s+/);

    let count = 1;
    if (r.length == 3) {
        description = r[2];
        count = parseInt(r[1]) || 1;
    }

    // parse BCU
    let bcu = null;
    r = description.split(/^(blessed|uncursed|cursed)\s+/);
    if (r.length == 3) {
        description = r[2];
        bcu = r[1];
    }

    return {
        count: count,
        bcu: bcu,
        description: description
    };
};

export class Inventory {

    private elem: HTMLElement;

    constructor(root: HTMLElement, private tileset: TileSet) {
        this.elem = document.createElement('pre');
        this.elem.id = 'inventory';
        root.appendChild(this.elem);
    }

    private clear() {
        Array.from(this.elem.children).forEach((c) => this.elem.removeChild(c));
    }

    updateItems(items: Item[]) {
        this.clear();
        this.createInventoryRows(items).forEach(row => this.elem.appendChild(row));
    }

    private createInventoryRows(items: Item[]) {
        const rows: HTMLElement[] = [];

        const newRow = () => {
            const row = document.createElement("div");
            row.classList.add('row');
            return row;
        }

        let current = newRow();
        items
            .forEach((item) => {
                if (item.identifier === 0) {
                    if (current.childNodes.length > 0) {
                        rows.push(current);
                        current = newRow();
                    }

                    current.innerHTML = item.str;
                    current.classList.remove('row');
                    current.classList.add('title');
                    rows.push(current);
                    current = newRow();
                } else {
                    const img = this.tileset.createBackgroundImage(item.tile);

                    // Inventory should always have accelerator
                    const accel = document.createElement('div');
                    accel.innerHTML = String.fromCharCode(item.accelerator);
                    accel.classList.add('accel');
                    img.appendChild(accel);

                    const desc = parse_inventory_description(item);
                    if (desc.count > 1) {
                        const count = document.createElement('div');
                        count.classList.add('count');
                        count.innerHTML = `${desc.count}`;
                        img.appendChild(count);
                    }


                    img.classList.add('item');
                    if (item.active) {
                        img.classList.add('active');
                    }
                    img.title = item.str;
                    current.appendChild(img);
                }
            });

        if (current.childNodes.length > 0) {
            rows.push(current);
            current = newRow();
        }

        return rows;
    };

}