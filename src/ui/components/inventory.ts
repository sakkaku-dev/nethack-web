import { InventoryItem } from '../../models';
import { bucState, horiz, pointer, vert } from '../styles';
import { TileMap } from './tilemap';

export class Inventory {
    private elem: HTMLElement;
    private expanded = false;
    private items: InventoryItem[] = [];
    private anim: Animation;
    private ignoreNextChangeHint = true;
    private enableHint = true;

    constructor(root: HTMLElement, private tileMap: TileMap) {
        this.elem = document.createElement('div');
        this.elem.id = 'inventory';
        vert(this.elem);
        root.appendChild(this.elem);

        this.anim = this.elem.animate(
            [{ background: "#000000DD" }, { background: '#FFFFFF33' }, { background: '#000000DD' }],
            {
                fill: "forwards",
                easing: "ease-in-out",
                duration: 1000,
            },
        );
        this.anim.cancel();

        tileMap.onTileSetChange$.subscribe(() => this.updateItems(this.items));
    }

    setEnableHint(enable: boolean) {
        this.enableHint = enable;
    }

    private clear() {
        Array.from(this.elem.children).forEach((c) => this.elem.removeChild(c));
    }

    toggle(update = false) {
        this.expanded = !this.expanded;
        this.ignoreNextChangeHint = true;

        // Update not always necessary, the toggle key (i) will automatically request a reload of the inventory
        if (update) {
            this.updateItems(this.items);
        }
    }

    updateItems(items: InventoryItem[], hint_change = false) {
        this.items = items;
        this.clear();

        // Hint that something changed in inventory, mainly for death after identifying items so player notices it
        if (this.enableHint && hint_change && !this.ignoreNextChangeHint) {
            this.anim.play();
        }
        this.ignoreNextChangeHint = false;

        this.elem.onclick = () => {
            this.expanded = !this.expanded;
            this.updateItems(this.items);
        }
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

                // Using text allowed naming items with 'C'
                bucState(container, item.str);

                // if (item.buc === BUCState.BLESSED) {
                //     container.classList.add('blessed');
                // } else if (item.buc === BUCState.CURSED) {
                //     container.classList.add('cursed');
                // }

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
        if (!this.tileMap.currentTileSet) return null;

        let img = this.tileMap.currentTileSet.createBackgroundImage(this.tileMap.isRogueLevel() ? -1 : item.tile, item.accelerator);
        if (!this.tileMap.isRogueLevel() && item.count > 1) {
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
