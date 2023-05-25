const SAVE_FILES_STORAGE_KEY = "sakkaku-dev-nethack-savefiles";

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
      var buf = new ArrayBuffer(bytes.length);
      var array = new Uint8Array(buf);
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
      if (file === "record") continue; // This is just in save folder, so it gets persisted, nethack should not delete it like the save file

      file = "/nethack/save/" + file;
      try {
        const data = btoa(
          String.fromCharCode.apply(null, module.FS.readFile(file, { encoding: "binary" }))
        );
        localStorage.setItem(`${SAVE_FILES_STORAGE_KEY}-${file}`, JSON.stringify({ data }));
      } catch (e) {
        console.warn("Failed to sync save file", file);
      }
    }
  } catch (e) {}
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
