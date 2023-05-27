const SAVE_FILES_STORAGE_KEY = "sakkaku-dev-nethack-savefiles";
const RECORD_FILE_STORAGE_KEY = "sakkaku-dev-nethack-records";

export function listBackupFiles() {
  const result: string[] = [];
  for (let i = 0, len = localStorage.length; i < len; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(SAVE_FILES_STORAGE_KEY)) {
      result.push(key.substring(SAVE_FILES_STORAGE_KEY.length + 1));
    }
  }

  return result;
}

function loadBackupSaveFile(file: string, module: any) {
  const strData = localStorage.getItem(`${SAVE_FILES_STORAGE_KEY}-${file}`);
  if (strData) {
    const { data } = JSON.parse(strData);
    try {
      const bytes = atob(data);
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
        file = "/nethack/save/" + file;
        const data = readFile(module, file);
        localStorage.setItem(RECORD_FILE_STORAGE_KEY, data);
      } else {
        file = "/nethack/save/" + file;
        try {
          const data = readFile(module, file);
          localStorage.setItem(`${SAVE_FILES_STORAGE_KEY}-${file}`, JSON.stringify({ data }));
        } catch (e) {
          console.warn("Failed to sync save file", file);
        }
      }

    }
  } catch (e) { }
}

function readFile(module: any, file: string) {
  return btoa(
    String.fromCharCode.apply(null, module.FS.readFile(file, { encoding: "binary" }))
  );
}

export function loadSaveFiles(module: any, backupFile: string) {
  try {
    module.FS.mkdir("/nethack/save");
  } catch (e) { }
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
  const data =  localStorage.getItem(RECORD_FILE_STORAGE_KEY) || '';
  return atob(data);
}