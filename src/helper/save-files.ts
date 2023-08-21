const SAVE_FILES_STORAGE_KEY = 'sakkaku-dev-nethack-savefiles';
const RECORD_FILE_STORAGE_KEY = 'sakkaku-dev-nethack-records';

const SAVE_FOLDER = '/nethack/save/';

export interface SaveFile {
    file: string;
    player: string;
    modified?: Date;
}

interface StoragedSaveData {
    data: string;
    modified?: string; // Old save files might not include this field
}

function parsePlayerName(file: string) {
    const prefix = SAVE_FOLDER + '0';
    return file.substring(prefix.length);
}

export function listBackupFiles(): SaveFile[] {
    const result: SaveFile[] = [];
    for (let i = 0, len = localStorage.length; i < len; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(SAVE_FILES_STORAGE_KEY)) {
            const file = key.substring(SAVE_FILES_STORAGE_KEY.length + 1);
            const data = getStoragedSaveFileData(file);
            if (data) {
                const player = parsePlayerName(file);
                const modified = data.modified ? new Date(data.modified) : undefined;
                result.push({ file, player, modified });
            }
        }
    }

    return result;
}

function getStoragedSaveFileData(file: string): StoragedSaveData | null {
    const strData = localStorage.getItem(`${SAVE_FILES_STORAGE_KEY}-${file}`);
    if (strData) {
        return JSON.parse(strData);
    }
    return null;
}

function loadBackupSaveFile(file: string, module: any) {
    const data = getStoragedSaveFileData(file);
    if (data) {
        try {
            const array = decodeData(data);
            module.FS.writeFile(file, array, { encoding: 'binary' });
        } catch (e) {
            console.warn('Failed to load backup file', e);
        }
    }
}

function decodeData(data: StoragedSaveData) {
    const bytes = atob(data.data);
    const buf = new ArrayBuffer(bytes.length);
    const array = new Uint8Array(buf);
    for (var i = 0; i < bytes.length; ++i) array[i] = bytes.charCodeAt(i);
    return array;
}

export function syncSaveFiles(module: any, player?: string) {
    module.FS.syncfs((err: any) => {
        if (err) {
            console.warn('Failed to sync FS. Save might not work', err);
        }
    });

    saveBackupFiles(module, player);
}

function saveBackupFiles(module: any, player?: string) {
    try {
        console.log('Saving backup file for player ', player);
        const savefiles = module.FS.readdir('/nethack/save');
        for (let i = 0; i < savefiles.length; ++i) {
            let file = savefiles[i];
            if (file == '.' || file == '..') continue;

            if (file === 'record') {
                file = SAVE_FOLDER + file;
                const data = readFile(module, file);
                localStorage.setItem(RECORD_FILE_STORAGE_KEY, data);
            } else {
                file = SAVE_FOLDER + file;
                var name = parsePlayerName(file);
                if (!player || name === player) {
                    console.log('Saving file', file);
                    try {
                        const data = readFile(module, file);
                        saveFileData(file, data);
                        console.log('Save successful');
                    } catch (e) {
                        console.warn('Failed to save save file', e);
                    }
                }
            }
        }
    } catch (e) {
        console.warn('Failed to save backup file', e);
    }
}

function saveFileData(file: string, data: string) {
    localStorage.setItem(
        `${SAVE_FILES_STORAGE_KEY}-${file}`,
        JSON.stringify({ data, modified: new Date().toISOString() } as StoragedSaveData)
    );
}

function readFile(module: any, file: string) {
    return btoa(String.fromCharCode.apply(null, module.FS.readFile(file, { encoding: 'binary' })));
}

export function loadSaveFiles(module: any, backupFile: string) {
    try {
        module.FS.mkdir('/nethack/save');
    } catch (e) {}
    module.FS.mount(module.IDBFS, {}, '/nethack/save');
    module.FS.syncfs(true, (err: any) => {
        if (err) {
            console.warn('Failed to sync FS. Save might not work', err);
        }
    });

    if (backupFile) {
        loadBackupSaveFile(backupFile, module);
    }
}

export function loadRecords() {
    const data = localStorage.getItem(RECORD_FILE_STORAGE_KEY) || '';
    return atob(data);
}

export function exportSaveFile(file: SaveFile) {
    const data = getStoragedSaveFileData(file.file);
    if (data) {
        const blob = new Blob([decodeData(data)], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        downloadURL(url, file.file.substring(SAVE_FOLDER.length));
        setTimeout(function () {
            return window.URL.revokeObjectURL(url);
        }, 1000);
    } else {
        console.warn('Failed to create export save file. Stored save file data missing or invalid.', file);
    }
}

export async function importSaveFile(file: File) {
    const buf = await file.arrayBuffer();
    const array = new Uint8Array(buf);
    const data = btoa(String.fromCharCode.apply(null, array as any));
    saveFileData(SAVE_FOLDER + file.name, data);
}

function downloadURL(data: any, fileName: string) {
    const a = document.createElement('a');
    a.href = data;
    a.download = fileName;
    document.body.appendChild(a);
    a.style.display = 'none';
    a.click();
    a.remove();
}

export function formatRecords(records: string) {
    const header = ['No', 'Score', 'Dungeon', 'Player', 'HP', 'Start', 'End', 'Death'].map(x => `<th>${x}</th>`);
    const lines = records
        .split('\n')
        .filter(line => line.length > 0)
        .map((line) => {
            const col = line.split(' ');
            const last = [];
            for(let i = 15; i < col.length; i++) {
                last.push(col[i]);
            }

            const nameDeath = last.join(' ').split(',');

            return {
                version: col[0],
                score: parseInt(col[1]),
                dungeon: mapToDungeon(col[2]),
                dungeonLvl: parseInt(col[3]),
                maxLvl: parseInt(col[4]),
                hp: parseInt(col[5]),
                maxHp: parseInt(col[6]),
                numOfDeath: parseInt(col[7]),
                endDate: parseDate(col[8]),
                startDate: parseDate(col[9]),
                role: col[11],
                race: col[12],
                gender: col[13],
                align: col[14],
                name: nameDeath[0],
                deathReason: nameDeath[1],
            } as Record;
        })
        .map((r, i) => [
            i+1,
            `${r.score}`,
            `${r.dungeon} ${r.dungeonLvl}/${r.maxLvl}`,
            `${r.name}, ${r.role}-${r.race}-${r.gender}-${r.align}`,
            `${r.hp}/${r.maxHp}`,
            r.startDate,
            r.endDate,
            r.deathReason,
        ])
        .map(cols => `<tr>${cols.map(c => `<td>${c}</td>`).join('')}</tr>`);
    
    return `<table id="records"><tr>${header.join('')}</tr>${lines.join('')}</table>`;
}

function parseDate(str: string): string {
    if (str.length !== 8) {
        return str;
    }
    const year = str.substring(0, 4);
    const month = str.substring(4, 6);
    const day = str.substring(6, 8);

    return `${year}-${month}-${day}`;
    // return new Date(`${year}-${month}-${day}`);
}

function mapToDungeon(value: string) {
    const num = parseInt(value);
    switch (num) {
        case 0:
            return Dungeon.DOOM;
        case 1:
            return Dungeon.GEHENNOM;
        case 2:
            return Dungeon.MINES;
        case 3:
            return Dungeon.QUEST;
        case 4:
            return Dungeon.SOKOBAN;
        case 5:
            return Dungeon.FORT;
        case 6:
            return Dungeon.VLAD;
        case 7:
            return Dungeon.PLANES;
    }

    return Dungeon.DOOM;
}

interface Record {
    version: string;
    score: number;
    dungeon: Dungeon;
    dungeonLvl: number;
    maxLvl: number;
    hp: number;
    maxHp: number;
    numOfDeath: number;
    endDate: string;
    startDate: string;
    role: string;
    race: string;
    gender: string;
    align: string;
    name: string;
    deathReason: string;
}

enum Dungeon {
    DOOM = 'The Dungeons of Doom',
    GEHENNOM = 'Gehennom',
    MINES = 'The Gnomish Mines',
    QUEST = 'The Quest',
    SOKOBAN = 'Sokoban',
    FORT = 'Fort Ludios',
    VLAD = "Vlad's Tower",
    PLANES = 'Elemental Planes',
}
