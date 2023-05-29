import { InventoryItem, Item } from "../../models";
import { horiz, vert } from "../styles";
import { Icon, IconButton } from "./icon";
import { TileSet } from "./tilemap";

export class Inventory {
  private elem: HTMLElement;
  private expanded = false;
  private items: InventoryItem[] = [];

  constructor(root: HTMLElement, private tileset: TileSet) {
    this.elem = document.createElement("div");
    this.elem.id = "inventory";
    vert(this.elem);
    root.appendChild(this.elem);
  }

  private clear() {
    Array.from(this.elem.children).forEach((c) => this.elem.removeChild(c));
  }

  toggle() {
    this.expanded = !this.expanded;
    // Update not necessary, the toggle key will automatically request a reload of the inventory
  }

  open() {
    this.expanded = true;
    this.updateItems(this.items); // This is called manually, so we need to update it
  }

  updateItems(items: InventoryItem[]) {
    this.items = items;
    this.clear();

    const container = IconButton('arrows-h-alt');
    container.onclick = () => {
      this.toggle();
      this.updateItems(this.items);
    }
    this.elem.appendChild(container);

    this.createInventoryRows(items);
  }

  private createInventoryRows(items: InventoryItem[]) {
    items.forEach((item) => {
      if (item.str.toLowerCase() === "coins" || item.accelerator === "$".charCodeAt(0)) {
        return; // we have the coins in the status
      }

      if (item.identifier === 0) {
        if (this.expanded) {
          const title = document.createElement("div");
          title.style.marginBottom = "0.5rem 0";
          title.innerHTML = item.str;
          this.elem.appendChild(title);
        }
      } else {
        const container = document.createElement("div");
        horiz(container);

        const img = this.createItemImage(item);
        container.appendChild(img);

        if (this.expanded) {
          const text = document.createElement("div");
          text.innerHTML = item.str;
          container.appendChild(text);
        }

        this.elem.appendChild(container);
      }
    });
  }

  private createItemImage(item: InventoryItem) {
    const img = this.tileset.createBackgroundImage(item.tile, item.accelerator);
    if (item.count > 1) {
      const count = document.createElement("div");
      count.classList.add("count");
      count.innerHTML = `${item.count}`;
      img.appendChild(count);
    }

    img.classList.add("item");
    if (item.active) {
      img.classList.add("active");
    }
    img.title = item.description;

    return img;
  }
}
