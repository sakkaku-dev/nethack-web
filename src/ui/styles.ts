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

export function topRight(elem: HTMLElement) {
    elem.style.position = 'absolute';
    elem.style.top = '0';
    elem.style.right = '0';
}

export function center(elem: HTMLElement) {
    elem.style.display = 'flex';
    elem.style.justifyContent = 'center';
    elem.style.alignItems = 'center';
}

export function horiz(elem: HTMLElement) {
    elem.style.display = 'flex';
    elem.style.gap = '0.5rem';
    elem.style.alignItems = 'center';
}

export function rel(elem: HTMLElement) {
    elem.style.position = 'relative';
}

export function accelStyle(elem: HTMLElement) {
    topRight(elem)
    elem.style.background = '#00000099';
    elem.style.padding = '0 0.1rem';
}