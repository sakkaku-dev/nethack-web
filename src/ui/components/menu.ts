import { Item } from "../../models";
import { Dialog } from "./dialog";
import { TileSet } from "./tilemap";
import { horiz } from "../styles";

export class Menu extends Dialog {
  constructor(prompt: string, private tileset?: TileSet) {
    super(prompt);
  }

  updateMenu(items: Item[], count: number) {
    this.elem.childNodes.forEach((x) => x.remove());
    this.elem.appendChild(this.createMenu(items, count));
  }

  private createMenu(items: Item[], count: number) {
    const list = document.createElement("div");
    list.style.display = "flex";
    list.style.flexDirection = "column";
    list.id = "menu";

    let currentGroupTitle: Text | null = null;
    let currentGroupAccels: number[] = [];

    const prependGroupAccel = () => {
      if (currentGroupTitle != null && currentGroupAccels.length > 0) {
        const title = currentGroupTitle as Text;
        if (title.textContent !== "") {
          // e.g 'D' - it will have an empty title
          // In case there are more than one group accel, but hopefully not
          const groupAccel = currentGroupAccels
            .map((c) => String.fromCharCode(c))
            .join(", ");
          title.textContent = groupAccel + " - " + title.textContent;
        }
      }
    };

    items.forEach((i) => {
      const div = document.createElement("div");
      horiz(div);

      if (i.identifier !== 0) {
        const id = `menu-${i.identifier}`;

        const elem = document.createElement("input");
        elem.type = count === 1 ? "radio" : "checkbox";
        elem.name = "menuSelect";
        elem.id = id;
        elem.checked = i.active || false;
        elem.value = `${i.identifier}`;

        const accel = i.accelerator;
        if (i.groupAcc !== 0 && !currentGroupAccels.includes(i.groupAcc)) {
          currentGroupAccels.push(i.groupAcc);
        }

        const label = document.createElement("label");
        label.htmlFor = id;
        label.innerHTML = i.str;

        div.appendChild(elem);
        if (i.tile && this.tileset) {
          const img = this.tileset.createBackgroundImage(i.tile, accel);
          div.appendChild(img);
        } else {
          label.innerHTML = `${String.fromCharCode(accel)} - ${label.innerHTML
            }`;
        }
        div.appendChild(label);
      } else {
        prependGroupAccel();
        currentGroupAccels = [];
        currentGroupTitle = document.createTextNode(i.str || " ");
        div.appendChild(currentGroupTitle);
      }

      list.appendChild(div);
    });
    prependGroupAccel();

    return list;
  }
}
