import { Settings } from './helper/settings';
import { StyledText } from './helper/visual';

export interface NetHackJS {
    sendInput: (key: number) => void;
    sendLine: (line: string | null) => void;
}

// In Godot all parameters will be in one array, so don't nest them
export interface NetHackUI {
    openMenu: (id: number, prompt: string, count: number, ...items: Item[]) => void;
    openDialog: (id: number, msg: string) => void;
    openGetLine: (question: string, ...autocomplete: string[]) => void;
    openGetTextArea: (value: string) => void;

    openQuestion: (question: string, defaultChoice: string, ...choices: string[]) => void;
    answerQuestion: (choice: string) => void;

    printLine: (msg: string) => void;
    closeDialog: (id: number) => void;

    moveCursor: (x: number, y: number) => void;
    centerView: (x: number, y: number) => void;
    clearMap: () => void;
    printTile: (tile: Tile) => void;
    updateStatus: (status: Status) => void;
    updateInventory: (...items: InventoryItem[]) => void;
    toggleInventory: () => void;
    updateState: (state: GameState) => void;

    updateSettings: (settings: Settings) => void;
}

export enum GameState {
    START,
    RUNNING,
    DIED,
    GAMEOVER,
}

export interface Vector {
    x: number;
    y: number;
}

export function add(v1: Vector, v2: Vector): Vector {
    return { x: v1.x + v2.x, y: v1.y + v2.y };
}

export function sub(v1: Vector, v2: Vector): Vector {
    return { x: v1.x - v2.x, y: v1.y - v2.y };
}

export function mult(v1: Vector, v2: Vector): Vector {
    return { x: v1.x * v2.x, y: v1.y * v2.y };
}

export interface Tile {
    x: number;
    y: number;
    tile: number;
    peaceful: boolean;
    rogue: boolean;
}

export interface Item {
    tile: number;
    accelerator: number;
    groupAcc: number;
    attr: number;
    str: string;
    identifier: number;
    active: boolean;
    count?: number;
}

export enum BUCState {
    BLESSED = 'blessed',
    UNCURSED = 'uncursed',
    CURSED = 'cursed',
}

export interface InventoryItem extends Item {
    count: number;
    buc: BUCState | null;
    description: string;
}

// See botl.c
interface StatusAll {
    str: string; // Strength can be like 18/50
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;

    title: string;
    align: string;

    gold: number;
    power: number;
    powerMax: number;
    exp: number;
    expLvl: number;
    armor: number;
    hp: number;
    hpMax: number;

    score: string;
    carryCap: string;
    hunger: string;
    dungeonLvl: string;
    // condition?: string;

    time?: number;
    hd?: number;
}

export type Status = Partial<Record<keyof StatusAll, StyledText>> & { condition?: StyledText[] };
