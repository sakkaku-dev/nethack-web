import { BUCState, InventoryItem } from '../../models';
import { horiz, pointer, vert } from '../styles';
import { IconButton } from './icon';
import { TileSet } from './tilemap';

export class Inventory {
    private elem: HTMLElement;
    private expanded = false;
    private items: InventoryItem[] = [];

    constructor(root: HTMLElement, private tileset?: TileSet) {
        this.elem = document.createElement('div');
        this.elem.id = 'inventory';
        vert(this.elem);
        root.appendChild(this.elem);
    }

    private clear() {
        Array.from(this.elem.children).forEach((c) => this.elem.removeChild(c));
    }

    setTileSet(tileset: TileSet) {
        this.tileset = tileset;
        this.updateItems(this.items);
    }

    toggle(update = false) {
        this.expanded = !this.expanded;
        // Update not always necessary, the toggle key (i) will automatically request a reload of the inventory
        if (update) {
            this.updateItems(this.items);
        }
    }

    open() {
        this.expanded = true;
        this.updateItems(this.items); // This is called manually, so we need to update it
    }

    updateItems(items: InventoryItem[]) {
        this.items = items;
        this.clear();
        this.elem.onclick = () => this.toggle(true);
        pointer(this.elem);
        this.createInventoryRows(items);
    }

    private createInventoryRows(items: InventoryItem[]) {
        items.forEach((item) => {
            if (item.str.toLowerCase() === 'coins' || item.accelerator === '$'.charCodeAt(0)) {
                return; // we have the coins in the status
            }

            if (item.identifier === 0) {
                if (this.expanded) {
                    const title = document.createElement('div');
                    title.style.marginBottom = '0.5rem 0';
                    title.innerHTML = item.str;
                    this.elem.appendChild(title);
                }
            } else {
                const container = document.createElement('div');
                horiz(container);
                if (item.buc === BUCState.BLESSED) {
                    container.classList.add('blessed');
                } else if (item.buc === BUCState.CURSED) {
                    container.classList.add('cursed');
                }

                const img = this.createItemImage(item);
                if (img) {
                    container.appendChild(img);
                }

                if (this.expanded) {
                    const text = document.createElement('div');
                    text.innerHTML = item.str;
                    container.appendChild(text);
                }

                this.elem.appendChild(container);
            }
        });
    }

    private createItemImage(item: InventoryItem) {
        if (!this.tileset) return null;

        const img = this.tileset.createBackgroundImage(item.tile, item.accelerator);
        if (item.count > 1) {
            const count = document.createElement('div');
            count.classList.add('count');
            count.innerHTML = `${item.count}`;
            img.appendChild(count);
        }

        img.classList.add('item');
        if (item.active) {
            img.classList.add('active');
        }
        img.title = item.description;

        return img;
    }
}
