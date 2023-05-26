import { Status } from "../../models";
import { center, fullScreen, horiz } from "../styles";
import { Icon } from "./icon";
import { Slider } from "./slider";

export class StatusLine {
  private elem: HTMLElement;
  private heartIcon: HTMLImageElement;
  private manaIcon: HTMLImageElement;
  private armorIcon: HTMLImageElement;

  private expand = false;
  private status?: Status;

  constructor(root: HTMLElement) {
    this.elem = document.createElement("div");
    this.elem.id = "status";
    root.appendChild(this.elem);

    this.heartIcon = this.createIcon('UI_Heart.png');
    this.manaIcon = this.createIcon('UI_Mana.png');
    this.armorIcon = this.createIcon('UI_Armor.png');

  }

  private toggleExpandButton() {
    const icon = this.expand ? 'minimize-alt' : 'arrows-expand-right';
    const container = document.createElement('div');
    center(container);
    container.appendChild(Icon(icon));
    container.style.height = '16px';

    container.onclick = () => {
      this.expand = !this.expand;
      this.update(this.status || {});
    }
    container.style.cursor = 'pointer';
    return container;
  }

  update(s: Status) {
    Array.from(this.elem.children).forEach(c => this.elem.removeChild(c));
    this.status = s;

    const firstRow = this.createRow();

    const conditions = document.createElement('div');
    conditions.innerHTML = s.hunger || '';
    conditions.style.fontWeight = 'bold';
    conditions.style.flexGrow = '1';
    firstRow.appendChild(conditions);
    firstRow.appendChild(this.toggleExpandButton());

    this.elem.appendChild(this.createMinMaxValue(this.heartIcon, '#D33', '#600', s.hp, s.hpMax));
    this.elem.appendChild(this.createMinMaxValue(this.manaIcon, '#33D', '#006', s.power, s.powerMax));

    const lastRow = this.createRow();
    lastRow.appendChild(this.createIconText(this.armorIcon, `${s.armor ?? '-'}`));

    const lvl = document.createElement('div');
    lvl.innerHTML = `LV ${s.expLvl}${s.exp != null ? '/' + s.exp : ''}`;
    lvl.title = s.title || 'Untitled';
    lastRow.appendChild(lvl);

    const other = document.createElement('div');
    other.innerHTML = `${s.align || "No Alignment"} Dlvl ${s.dungeonLvl ?? "-"}`;
    other.style.flexGrow = '1';
    lastRow.appendChild(other)

    const money = document.createElement('div');
    money.innerHTML = `$: ${s.gold ?? "-"}`;
    lastRow.appendChild(money)

    if (this.expand) {
      const stats = this.createRow();
      stats.innerHTML += `\nStr: ${s.str ?? "-"} Dex: ${s.dex ?? "-"} Con: ${s.con ?? "-"} Int: ${s.int ?? "-"} Wis: ${s.wis ?? "-"} Cha: ${s.cha ?? "-"}`;
      stats.style.justifyContent = 'end';

      const extras = this.createRow();
      extras.style.justifyContent = 'end';

      if (s.time != null) extras.innerHTML += `T: ${s.time}`;
    }
  }

  private createRow() {
    const row = document.createElement('div');
    horiz(row);
    this.elem.appendChild(row);
    return row;
  }

  private createIconText(icon: HTMLImageElement, txt: string) {
    const elem = document.createElement('div');
    elem.style.position = 'relative';

    const label = document.createElement('div');
    fullScreen(label);
    center(label);
    label.innerHTML = txt;
    label.title = txt;

    elem.appendChild(icon);
    elem.appendChild(label);
    return elem;
  }

  private createMinMaxValue(icon: HTMLImageElement, fg: string, bg: string, v?: number, maxV?: number) {
    const elem = document.createElement('div');
    horiz(elem);
    elem.style.gap = '0';

    icon.style.marginRight = '-1rem';
    icon.style.zIndex = '1';
    elem.appendChild(icon);

    elem.appendChild(Slider(v || 0, maxV || 1, fg, bg));
    return elem;
  }

  private createIcon(file: string) {
    const img = new Image();
    img.src = file;
    return img;
  }
}
