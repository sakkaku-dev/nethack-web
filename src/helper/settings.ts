const SETTINGS_KEY = 'sakkaku-dev-nethack-settings';

export interface Settings {
    enableMapBorder: boolean;
    tileSetImage: TileSetImage;
    playerName: string;
}

export enum TileSetImage {
    Nevanda = 'Nevanda',
    Dawnhack = 'Dawnhack',
    Default = 'Default Nethack',
}

export function loadSettings(): Settings {
    const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    return {
        enableMapBorder: true,
        tileSetImage: TileSetImage.Nevanda,
        playerName: 'Unnamed',
        ...settings,
    };
}

export function updateSettings(settings: Settings, changeFn: (s: Settings) => void) {
    changeFn(settings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
