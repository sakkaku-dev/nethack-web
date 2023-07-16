import { Item } from '../../models';
import { horiz } from '../styles';
import { TileSet } from './tilemap';

const createAccel = (accel: number) => {
    const accelElem = document.createElement('div');
    accelElem.classList.add('accel');
    accelElem.innerHTML = String.fromCharCode(accel);
    return accelElem;
};

export function MenuButton(item: Item, prepend = true, tileset?: TileSet) {
    const btn = document.createElement('button');
    btn.disabled = item.accelerator === 0;
    horiz(btn);

    if (item.str.toLowerCase().match(/(?<!un)cursed/)) {
        btn.classList.add('cursed');
    } else if (item.str.toLowerCase().includes('blessed')) {
        btn.classList.add('blessed');
    }

    btn.onclick = () => window.nethackJS.sendInput(item.accelerator);
    if (item.active) {
        btn.classList.add('active');
    }

    const label = document.createElement('span');
    label.innerHTML = item.str;

    if (prepend) {
        btn.appendChild(createAccel(item.accelerator));
    }

    if (item.tile && tileset) {
        const img = tileset.createBackgroundImage(item.tile);
        btn.appendChild(img);
    }

    btn.appendChild(label);

    if (!prepend) {
        btn.appendChild(createAccel(item.accelerator));
    }

    return btn;
}
