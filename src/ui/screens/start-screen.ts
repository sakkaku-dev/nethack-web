import { BackupFiles } from "../components/backup-files";
import { Dialog } from "../components/dialog";
import { center, topLeft } from "../styles";
import { Screen } from "./screen";

export class StartScreen extends Screen {

    onStartGame = () => { };

    constructor() {
        super();

        const settings = document.createElement('div');
        topLeft(settings);

        const backupBtn = document.createElement('button');
        backupBtn.innerHTML = 'B';
        backupBtn.onclick = () => this.openBackupFiles();
        settings.appendChild(backupBtn);

        const btn = document.createElement('button');
        btn.innerHTML = 'Start Game';
        btn.onclick = () => this.onStartGame();

        center(this.elem);
        this.elem.appendChild(btn);
        this.elem.appendChild(settings);
    }

    public openBackupFiles() {
        const files = window.nethackJS.getBackupFiles();
        const backup = new BackupFiles(files);
        backup.onFileSelect = (file) => {
            window.nethackJS.setBackupFile(file);
            Dialog.removeAll();
        };
        this.elem.appendChild(backup.elem);
    }

}