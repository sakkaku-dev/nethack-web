const SETTINGS_KEY = 'sakkaku-dev-nethack-settings';

export interface Settings {
    enableMapBorder: boolean;
    tileSetImage: TileSetImage;
    playerName: string;
    options: string;
}

export enum TileSetImage {
    Nevanda = 'Nevanda',
    Dawnhack = 'Dawnhack',
    Default = 'Default Nethack',
    Chozo = 'Chozo',
}

export const defaultSetting: Settings = {
    enableMapBorder: true,
    tileSetImage: TileSetImage.Nevanda,
    playerName: 'Unnamed',
    options: '',
}

export function loadSettings(): Settings {
    const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    return {
        ...defaultSetting,
        ...settings,
    };
}

export function saveSettings(s: Settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export async function loadDefaultOptions() {
    return fetch('nethackrc.default').then(x => x.text());
}