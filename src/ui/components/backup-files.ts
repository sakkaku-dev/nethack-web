import { Menu } from "./menu";

export class BackupFiles extends Menu {

    constructor(files: string[]) {
        super('Select Backup File', [], 1);//files.map(f => ({ text: f, id: f })), 1);

        // const list = document.createElement('div')
        // list.style.display = 'flex';
        // list.style.flexDirection = 'column';
        // list.id = 'menu';

        // files.forEach(file => {
        //     const item = document.createElement('div');

        //     const input = document.createElement('input');
        //     input.type = 'radio';
        //     input.value = file;
        //     input.name = ''

        //     const label = document.createElement('label');
        //     label.innerHTML = file;

        //     item.appendChild(input);
        //     item.appendChild(label);
        //     list.appendChild(item);
        // });

        // this.elem.appendChild(list);

        // this.submitButton = this.createSelectButton();
        // this.elem.append(this.submitButton);
    }
}