import { Status } from "../../models";

export class StatusLine {
    private elem: HTMLElement

    constructor(root: HTMLElement) {
        this.elem = document.createElement('pre');
        this.elem.id = 'status';
        root.appendChild(this.elem);
    }

    update(s: Status) {
        this.elem.innerHTML = `${s.title} ${s.align} \t ${s.hunger || ''}`; // TODO: set player name
        this.elem.innerHTML += `\nStr: ${s.str} Dex: ${s.dex} Con: ${s.con} Int: ${s.int} Wis: ${s.wis} Cha: ${s.cha}`;
        this.elem.innerHTML += `\nDlvl ${s.dungeonLvl} HP: ${s.hp}/${s.hpMax} Pw: ${s.power}/${s.powerMax} AC: ${s.armor} EXP: ${s.expLvl} $: ${s.gold}`;
    }
}