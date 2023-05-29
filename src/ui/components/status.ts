import { Status } from "../../models";
import { center, fullScreen, horiz } from "../styles";
import { Icon, IconButton } from "./icon";
import { Slider } from "./slider";
import { Sprite } from "./sprite";

const LOW_HP_THRESHOLD = 0.3;

export class StatusLine {
  private elem: HTMLElement;

  private heartIcon: HTMLElement;
  private heartAnim: Animation;

  private manaIcon: HTMLElement;
  private armorIcon: HTMLElement;

  private expand = false;
  private status?: Status;

  // private pulseBorder: HTMLElement;

  constructor(root: HTMLElement) {
    this.elem = document.createElement("div");
    this.elem.id = "status";
    root.appendChild(this.elem);

    const hp = Sprite('UI_Heart.png', 32, 2);
    this.heartIcon = hp.sprite;
    this.heartAnim = hp.anim;

    this.manaIcon = Sprite('UI_Mana.png', 32, 1).sprite;
    this.armorIcon = Sprite('UI_Armor.png', 32, 1).sprite;

    // Enable this after we have settings to disable it
    // this.pulseBorder = document.createElement('div');
    // this.pulseBorder.style.backgroundImage = 'url("PulseBorder.png")';
    // this.pulseBorder.style.backgroundPosition = 'center';
    // this.pulseBorder.style.backgroundSize = 'cover';
    // this.pulseBorder.style.backgroundRepeat = 'no-repeat';
    // this.pulseBorder.style.display = 'none;'
    // fullScreen(this.pulseBorder);
    // this.pulseBorder.animate({ opacity: [0, 0.2, 0] }, { duration: 1000 * 1.5, iterations: Infinity });
    // root.appendChild(this.pulseBorder);
  }

  private toggleExpandButton() {
    const icon = this.expand ? 'minimize-alt' : 'arrows-expand-right';
    const container = IconButton(icon);
    container.onclick = () => {
      this.expand = !this.expand;
      this.update(this.status || {});
    }
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
    if (s.expLvl) {
      lvl.innerHTML = `LV ${s.expLvl}${s.exp != null ? '/' + s.exp : ''}`;
      lvl.title = s.title || 'Untitled';
    } else if (s.hd) {
      lvl.innerHTML = `HD: ${s.hd}`;
    }
    lastRow.appendChild(lvl);

    const other = document.createElement('div');
    other.innerHTML = `${s.align || "No Alignment"} Dlvl ${s.dungeonLvl ?? "-"}`;
    other.style.flexGrow = '1';
    lastRow.appendChild(other)

    const money = document.createElement('div');
    if (s.time != null) money.innerHTML += `T: ${s.time} `;

    money.innerHTML += `$: ${s.gold ?? "-"}`;

    lastRow.appendChild(money)

    if (this.expand) {
      const stats = this.createRow();
      stats.innerHTML += `\nStr: ${s.str ?? "-"} Dex: ${s.dex ?? "-"} Con: ${s.con ?? "-"} Int: ${s.int ?? "-"} Wis: ${s.wis ?? "-"} Cha: ${s.cha ?? "-"}`;
      stats.style.justifyContent = 'end';
    }

    if (s.hp && s.hpMax) {
      const hpPercent = s.hp / s.hpMax
      if (hpPercent < LOW_HP_THRESHOLD) {
        if (this.heartAnim.playState !== 'running') {
          this.heartAnim.play();
        }
      } else {
        this.heartAnim.cancel();
      }
    }
  }

  private createRow() {
    const row = document.createElement('div');
    horiz(row);
    this.elem.appendChild(row);
    return row;
  }

  private createIconText(icon: HTMLElement, txt: string) {
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

  private createMinMaxValue(icon: HTMLElement, fg: string, bg: string, v?: number, maxV?: number) {
    const elem = document.createElement('div');
    horiz(elem);
    elem.style.gap = '0';

    icon.style.marginRight = '-1rem';
    icon.style.zIndex = '1';
    elem.appendChild(icon);

    elem.appendChild(Slider(v || 0, maxV || 1, fg, bg));
    return elem;
  }
}
