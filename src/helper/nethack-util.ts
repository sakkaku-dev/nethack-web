export interface NethackUtil {
  selectItems: typeof selectItems;
  toTile: typeof toTile;
}

export enum Type {
  INT = "i",
  STRING = "s",
  POINTER = "p",
}

export function toTile(glyph: number) {
  return window.module._glyph_to_tile(glyph);
}

const TYPE_SIZES = {
  [Type.INT]: 4,
  [Type.POINTER]: 4, // Pointer is also an interger
  [Type.STRING]: 4, // TODO
}

export function selectItems(itemIds: number[], selectedPointer: number) {
  const int_size = TYPE_SIZES[Type.INT];
  const size = int_size * 2; // selected object has 3 fields, in 3.6 only 2
  const total_size = size * itemIds.length;
  const start_ptr = window.module._malloc(total_size);

  // write selected items to memory
  let ptr = start_ptr;
  itemIds.forEach((id) => {
    window.nethackGlobal.helpers.setPointerValue("nethack.menu.selected", ptr, Type.INT, id);
    window.nethackGlobal.helpers.setPointerValue("nethack.menu.selected", ptr + int_size, Type.INT, -1);
    // this.global.helpers.setPointerValue("nethack.menu.selected", ptr + int_size * 2, Type.INT, 0); // Only 2 properties in 3.6

    ptr += size;
  });

  // point selected to the first item
  const selected_pp = window.nethackGlobal.helpers.getPointerValue("", selectedPointer, Type.POINTER);
  window.nethackGlobal.helpers.setPointerValue("nethack.menu.setSelected", selected_pp, Type.INT, start_ptr);
}

export function getArrayValue(start_ptr: number, index: number, type: Type) {
  const ptr = start_ptr + index * TYPE_SIZES[type];
  return window.nethackGlobal.helpers.getPointerValue("nethack.menu.setSelected", ptr, type);
}