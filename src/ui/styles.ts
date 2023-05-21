export function fullScreen(elem: HTMLElement) {
    elem.style.position = 'absolute';
    elem.style.top = '0';
    elem.style.left = '0';
    elem.style.right = '0';
    elem.style.bottom = '0';
}

export function topLeft(elem: HTMLElement) {
    elem.style.position = 'absolute';
    elem.style.top = '0';
    elem.style.left = '0';
}

export function center(elem: HTMLElement) {
    elem.style.display = 'flex';
    elem.style.justifyContent = 'center';
    elem.style.alignItems = 'center';
}