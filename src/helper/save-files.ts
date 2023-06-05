const SAVE_FILES_STORAGE_KEY = "sakkaku-dev-nethack-savefiles";
const RECORD_FILE_STORAGE_KEY = "sakkaku-dev-nethack-records";

const SAVE_FOLDER = "/nethack/save/";

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
  const prefix = SAVE_FOLDER + "0";
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
        result.push({file, player, modified});
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
      const bytes = atob(data.data);
      const buf = new ArrayBuffer(bytes.length);
      const array = new Uint8Array(buf);
      for (var i = 0; i < bytes.length; ++i) array[i] = bytes.charCodeAt(i);
      module.FS.writeFile(file, array, { encoding: "binary" });
    } catch (e) {
      console.warn("Failed to load backup file", e);
    }
  }
}

export function syncSaveFiles(module: any) {
  console.log("Syncing save files");
  module.FS.syncfs((err: any) => {
    if (err) {
      console.warn("Failed to sync FS. Save might not work", err);
    }
  });

  saveBackupFiles(module);
}

function saveBackupFiles(module: any) {
  try {
    const savefiles = module.FS.readdir("/nethack/save");
    for (let i = 0; i < savefiles.length; ++i) {
      let file = savefiles[i];
      if (file == "." || file == "..") continue;

      if (file === "record") {
        file = SAVE_FOLDER + file;
        const data = readFile(module, file);
        localStorage.setItem(RECORD_FILE_STORAGE_KEY, data);
      } else {
        file = SAVE_FOLDER + file;
        try {
          const data = readFile(module, file);
          localStorage.setItem(
            `${SAVE_FILES_STORAGE_KEY}-${file}`,
            JSON.stringify({ data, modified: new Date().toISOString() } as StoragedSaveData)
          );
        } catch (e) {
          console.warn("Failed to sync save file", file);
        }
      }
    }
  } catch (e) {}
}

function readFile(module: any, file: string) {
  return btoa(String.fromCharCode.apply(null, module.FS.readFile(file, { encoding: "binary" })));
}

export function loadSaveFiles(module: any, backupFile: string) {
  try {
    module.FS.mkdir("/nethack/save");
  } catch (e) {}
  module.FS.mount(module.IDBFS, {}, "/nethack/save");
  module.FS.syncfs(true, (err: any) => {
    if (err) {
      console.warn("Failed to sync FS. Save might not work", err);
    }
  });

  if (backupFile) {
    loadBackupSaveFile(backupFile, module);
  }
}

export function loadRecords() {
  const data = localStorage.getItem(RECORD_FILE_STORAGE_KEY) || "";
  return atob(data);
}
