import { Item } from '../../models';
import { TileMap } from './tilemap';
import { vert } from '../styles';
import { MenuButton } from './accel-btn';

export class Menu {
    public elem: HTMLElement;
    public label: HTMLElement;

    private menuContainer?: HTMLElement;

    constructor(private prompt: string, private tileMap?: TileMap) {
        this.elem = document.createElement('div');
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
        this.createMenu(items, this.menuContainer, count === 0);

        this.elem.appendChild(this.menuContainer);
    }

    private createLabel() {
        const label = document.createElement('div');
        label.innerHTML = this.prompt;
        return label;
    }

    private createMenu(items: Item[], container: HTMLElement, disable: boolean) {
        items.forEach((i) => {
            if (i.identifier !== 0) {
                container.appendChild(MenuButton(i, true, this.tileMap, disable));
            } else if (i.str !== '') {
                container.appendChild(MenuButton(i, false, this.tileMap, disable));
            }
        });

        return container;
    }
}
