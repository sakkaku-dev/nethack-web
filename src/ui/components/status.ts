import { ATTR, COLORS } from "../../generated";
import { StyledText } from "../../helper/visual";
import { Status } from "../../models";
import { center, fullScreen, horiz } from "../styles";
import { Icon, IconButton } from "./icon";
import { Slider } from "./slider";
import { Sprite } from "./sprite";

const COLOR_MAP = {
  [COLORS.CLR_RED]: "red",
  [COLORS.CLR_GREEN]: "green",
  [COLORS.CLR_ORANGE]: "orange",
  [COLORS.CLR_YELLOW]: "yellow",
};

export class StatusLine {
  private elem: HTMLElement;

  private heartIcon: HTMLElement;
  private heartAnim: Animation;

  private manaIcon: HTMLElement;
  private armorIcon: HTMLElement;

  private expand = true;
  private status?: Status;

  // private pulseBorder: HTMLElement;

  constructor(root: HTMLElement) {
    this.elem = document.createElement("div");
    this.elem.id = "status";
    root.appendChild(this.elem);

    const hp = Sprite("UI_Heart.png", 32, 2);
    this.heartIcon = hp.sprite;
    this.heartAnim = hp.anim;

    this.manaIcon = Sprite("UI_Mana.png", 32, 1).sprite;
    this.armorIcon = Sprite("UI_Armor.png", 32, 1).sprite;

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
    const icon = this.expand ? "minimize-alt" : "arrows-expand-right";
    const container = IconButton(icon);
    container.onclick = () => {
      this.expand = !this.expand;
      this.update(this.status || {});
    };
    return container;
  }

  private createText(text?: StyledText, pulse = false) {
    const elem = document.createElement("span");
    if (text) {
      elem.innerHTML = text.text;

      if (pulse) {
        elem.style.animationName = "pulse";
        elem.style.animationDuration = "2s";
        elem.style.animationIterationCount = "infinite";
        elem.style.animationTimingFunction = "ease-in-out";
      }

      if (text.color in COLOR_MAP) {
        const color = text.color as keyof typeof COLOR_MAP;
        elem.style.color = COLOR_MAP[color];
      }

      if (text.attr.includes(ATTR.ATR_BOLD)) {
        elem.style.fontWeight = "bold";
      }
    }

    return elem;
  }

  update(s: Status) {
    Array.from(this.elem.children).forEach((c) => this.elem.removeChild(c));
    this.status = s;

    const firstRow = this.createRow();

    const conditions = document.createElement("div");
    horiz(conditions);
    conditions.appendChild(this.createText(s.hunger, true));
    s.condition?.forEach((c) => conditions.appendChild(this.createText(c, true)));
    conditions.style.flexGrow = "1";
    conditions.style.fontSize = "1.2rem";
    firstRow.appendChild(conditions);

    // firstRow.appendChild(this.toggleExpandButton());

    this.elem.appendChild(this.createMinMaxValue(this.heartIcon, "#D33", "#600", s.hp, s.hpMax));
    this.elem.appendChild(
      this.createMinMaxValue(this.manaIcon, "#33D", "#006", s.power, s.powerMax)
    );

    const lastRow = this.createRow();
    lastRow.appendChild(this.createIconText(this.armorIcon, s.armor));

    const lvl = document.createElement("div");
    if (s.expLvl) {
      const lvlElem = this.createText(s.expLvl);
      horiz(lvl);
      lvl.style.gap = "0";

      lvl.appendChild(document.createTextNode("LV"));
      lvlElem.style.marginLeft = "0.5rem";
      lvl.appendChild(lvlElem);
      if (s.exp) {
        const expElem = this.createText(s.exp);
        lvl.appendChild(document.createTextNode("/"));
        lvl.appendChild(expElem);
      }

      lvl.title = s.title?.text || "Untitled";
    } else if (s.hd) {
      lvl.appendChild(this.createText(s.hd));
    }
    lastRow.appendChild(lvl);

    const other = document.createElement("div");
    horiz(other);
    other.appendChild(this.createText(s.align));
    other.appendChild(this.createText(s.dungeonLvl));
    other.style.flexGrow = "1";
    lastRow.appendChild(other);

    const money = document.createElement("div");
    horiz(money);
    if (s.time != null) {
      money.appendChild(document.createTextNode("T:"));
      money.appendChild(this.createText(s.time));
    }

    money.appendChild(document.createTextNode("$:"));
    money.appendChild(this.createText(s.gold));
    lastRow.appendChild(money);

    if (this.expand) {
      const stats = this.createRow();
      horiz(stats);
      stats.appendChild(document.createTextNode("Str:"));
      stats.appendChild(this.createText(s.str));
      stats.appendChild(document.createTextNode("Dex:"));
      stats.appendChild(this.createText(s.dex));
      stats.appendChild(document.createTextNode("Con:"));
      stats.appendChild(this.createText(s.con));
      stats.appendChild(document.createTextNode("Int:"));
      stats.appendChild(this.createText(s.int));
      stats.appendChild(document.createTextNode("Wis:"));
      stats.appendChild(this.createText(s.wis));
      stats.appendChild(document.createTextNode("Cha:"));
      stats.appendChild(this.createText(s.cha));
      stats.style.justifyContent = "end";
    }

    if (s.hp) {
      if (s.hp.color === COLORS.CLR_RED) {
        if (this.heartAnim.playState !== "running") {
          this.heartAnim.play();
        }
      } else {
        this.heartAnim.cancel();
      }
    }
  }

  private createRow() {
    const row = document.createElement("div");
    horiz(row);
    this.elem.appendChild(row);
    return row;
  }

  private createIconText(icon: HTMLElement, text?: StyledText) {
    const elem = document.createElement("div");
    elem.style.position = "relative";

    const label = this.createText(text);
    label.title = text?.text || "";
    fullScreen(label);
    center(label);

    elem.appendChild(icon);
    elem.appendChild(label);
    return elem;
  }

  private createMinMaxValue(
    icon: HTMLElement,
    fg: string,
    bg: string,
    v?: StyledText,
    maxV?: StyledText
  ) {
    const elem = document.createElement("div");
    horiz(elem);
    elem.style.gap = "0";

    icon.style.marginRight = "-1rem";
    icon.style.zIndex = "1";
    elem.appendChild(icon);

    elem.appendChild(Slider(parseInt(v?.text || "0"), parseInt(maxV?.text || "1"), fg, bg));
    return elem;
  }
}
