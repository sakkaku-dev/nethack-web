export function Sprite(file: string, size: number, frames: number, durationInSec: number = 1, loop = true) {
    const sprite = document.createElement("div");
    sprite.style.backgroundImage = `url(${file})`;
    sprite.style.backgroundSize = `${size * frames}px`;
    sprite.style.width = `${size}px`;
    sprite.style.height = `${size}px`;
    sprite.style.backgroundPositionX = `-${frames * size}px`;
    sprite.classList.add('pixel');

    const positions = [];
    for (let i = 0; i < frames; i++) {
        positions.push(-i * size);
    }

    const anim = sprite.animate({ backgroundPositionX: positions }, { duration: 1000 * durationInSec, iterations: loop ? Infinity : 1, easing: `steps(${frames})` });
    anim.cancel();
    return { sprite, anim };
}
