import { Item } from '../../models';
import { bucState, horiz, topRight } from '../styles';
import { TileSet } from './tilemap';

const createAccel = (accel: number) => {
    const accelElem = document.createElement('div');
    if (accel > 0) {
        accelElem.classList.add('accel');
        accelElem.innerHTML = String.fromCharCode(accel);
    }
    return accelElem;
};

export function MenuButton(item: Item, prepend = true, tileset?: TileSet) {
    const btn = document.createElement('button');
    btn.disabled = item.identifier === 0;
    btn.style.position = 'relative';
    horiz(btn);
    bucState(btn, item.str);

    btn.onclick = () => window.nethackJS.sendInput(item.accelerator || item.identifier);
    if (item.active) {
        btn.classList.add('active');
    }

    const label = document.createElement('span');
    label.innerHTML = item.str;

    if ((item.count || 0) > 0) {
        const count = document.createElement('span');
        count.innerHTML += ` x${item.count}`;
        topRight(count);
        count.style.top = '-5px';
        count.style.background = '#333';
        count.style.borderRadius = '100%';

        // Make it fit and rounder
        count.style.padding = '0.25rem 0';
        count.style.paddingRight = '0.5rem';

        btn.appendChild(count);
    }

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
