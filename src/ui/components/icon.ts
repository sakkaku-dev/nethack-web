export function Icon(name: string) {
    const icon = document.createElement('i');
    icon.classList.add(`gg-${name}`);
    return icon;
}