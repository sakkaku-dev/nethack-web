import { BackupFiles } from "../components/backup-files";
import { Dialog } from "../components/dialog";
import { title, vert } from "../styles";
import { Screen } from "./screen";

export class StartScreen extends Screen {
    onStartGame = () => { };

    constructor() {
        super();

        const div = document.createElement("div");
        vert(div);

        const header = document.createElement("div");
        header.innerHTML = "Welcome to NetHack";
        header.style.marginBottom = "2rem";
        title(header);
        div.appendChild(header);

        div.appendChild(this.createButton("Start Game", () => this.onStartGame()));
        div.appendChild(this.createButton("Load from Backup", () => this.openBackupFiles()));

        this.elem.appendChild(div);
    }

    public openBackupFiles() {
        const files = window.nethackJS.getBackupFiles();
        const backup = new BackupFiles(files);
        backup.onSelect = (files: string[]) => {
            if (files.length) {
                window.nethackJS.setBackupFile(files[0]);
            }
            this.resetInput();
            Dialog.removeAll();
        };
        this.changeInput(backup);
        this.elem.appendChild(backup.elem);
    }
}
