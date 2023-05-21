import { Dialog } from "./dialog";

export class BackupFiles extends Dialog {
    public onFileSelect = (file: string) => { };

    constructor(files: string[]) {
        super('Backup Files');

        const list = document.createElement('div')
        list.style.display = 'flex';
        list.style.flexDirection = 'column';
        list.id = 'menu';

        files.forEach(file => {
            const item = document.createElement('div');

            const input = document.createElement('input');
            input.type = 'radio';
            input.value = file;
            input.name = ''

            const label = document.createElement('label');
            label.innerHTML = file;

            item.appendChild(input);
            item.appendChild(label);
            list.appendChild(item);
        });

        this.elem.appendChild(list);
        this.elem.append(this.createSelectButton());
    }

    private createSelectButton() {
        const btn = document.createElement("button");
        btn.innerHTML = "Submit";
        btn.onclick = () => {
            const inputs = Array.from(document.querySelectorAll("#menu input")) as HTMLInputElement[];
            const ids = inputs.filter((i) => i.checked && !i.disabled).map(i => i.value);
            if (ids.length > 0) {
                this.onFileSelect(ids[0]);
            }
        };
        return btn;
    }
}