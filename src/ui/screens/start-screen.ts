import { Item } from '../../models';
import { VERSION } from '../../version';
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

        const version = document.querySelector('#version') as HTMLLinkElement;
        version.innerHTML = VERSION;
        version.href = `https://github.com/sakkaku-dev/nethack-web/releases/tag/${VERSION}`;
        console.log('Running version', VERSION);
    }

    onDialog(text: string) {
        super.onDialog(text, false);
    }

    onMenu(prompt: string, count: number, items: Item[]): void {
        this.menu.label.innerHTML = prompt;
        this.menu.updateMenu(items, count);
    }
}
