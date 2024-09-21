const SETTINGS_KEY = 'sakkaku-dev-nethack-settings';

export interface Settings {
    enableMapBorder: boolean;
    tileSetImage: TileSetImage;
    rogueTileSetImage: TileSetImage;
    playerName: string;
    inventoryHint: boolean;
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
    rogueTileSetImage: TileSetImage.Chozo,
    playerName: 'Unnamed',
    inventoryHint: true,
    options: '',
};

export function loadSettings(): Settings {
    const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}');
    console.log("loading settings", settings.options);
    return {
        ...defaultSetting,
        ...settings,
    };
}

export function saveSettings(s: Settings) {
    console.log('saving settings', s.options);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export async function loadDefaultOptions() {
    return fetch('nethackrc.default').then((x) => x.text());
}
