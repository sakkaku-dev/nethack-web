import { Item } from '../../models';
import { Menu } from '../components/menu';
import { title } from '../styles';
import { Screen } from './screen';

export class StartScreen extends Screen {
    private menu: Menu;

    constructor() {
        super();

        this.menu = new Menu('Test');
        this.menu.label.style.marginBottom = '2rem';
        title(this.menu.label);

        this.elem.appendChild(this.menu.elem);
    }

    onDialog(text: string) {
        super.onDialog(text, false);
    }

    onMenu(prompt: string, count: number, items: Item[]): void {
        this.menu.label.innerHTML = prompt;
        this.menu.updateMenu(items, count);
    }
}
