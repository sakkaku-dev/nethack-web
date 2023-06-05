import { center } from '../styles';

export function Icon(name: string) {
    const icon = document.createElement('i');
    icon.classList.add(`gg-${name}`);
    return icon;
}

export function IconButton(name: string) {
    const container = document.createElement('div');
    center(container);
    container.style.justifyContent = 'end';
    container.appendChild(Icon(name));
    container.style.height = '16px';
    container.style.cursor = 'pointer';
    return container;
}
