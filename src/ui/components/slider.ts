import { fullScreen, horiz } from "../styles";

export function Slider(value: number, maxValue: number, fg: string, bg: string) {
    const slider = document.createElement('div');
    horiz(slider);
    slider.style.height = '16px';
    slider.style.backgroundColor = bg;
    slider.style.flexGrow = '1';
    slider.style.position = 'relative';
    slider.style.alignItems = 'stretch';

    const filled = (value / maxValue) * 100;
    const fill = document.createElement('div');
    fill.style.width = `${filled}%`;
    fill.style.backgroundColor = fg;

    const text = document.createElement('span');
    fullScreen(text);
    text.style.textAlign = 'center';
    text.innerHTML = `${value} / ${maxValue}`;

    slider.appendChild(text);
    slider.appendChild(fill);
    return slider;
}