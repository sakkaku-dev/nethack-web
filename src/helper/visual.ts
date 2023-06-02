import { ATTR, COLORS, COLOR_ATTR, CONDITION } from "../generated";
import { conditionMap } from "../nethack-models";
import { Type, getArrayValue } from "./nethack-util";

const ATTR_MAP: Record<number, ATTR> = {
  [COLOR_ATTR.HL_ATTCLR_DIM]: ATTR.ATR_DIM,
  [COLOR_ATTR.HL_ATTCLR_BLINK]: ATTR.ATR_BLINK,
  [COLOR_ATTR.HL_ATTCLR_ULINE]: ATTR.ATR_ULINE,
  [COLOR_ATTR.HL_ATTCLR_INVERSE]: ATTR.ATR_INVERSE,
  [COLOR_ATTR.HL_ATTCLR_BOLD]: ATTR.ATR_BOLD,
};

export interface StyledText {
  text: string;
  color: COLORS;
  attr: ATTR[];
}

export function createStatusText(text: string, colorValue: number): StyledText {
  // Defined in window.doc -> status_update()
  const color = colorValue & 0x00ff;

  // Bold is for some reason 2
  // Underline is 8, so to correct this shift by another bit
  const attr = colorValue >> (8 + 1);

  return { text, color, attr: [attr] };
}

// Similar to wintty.c render_status(), condcolor() and condattr()
export function createConditionStatusText(conditionBits: number, colorMask: number): StyledText[] {
  const result: StyledText[] = [];
  for (let c of Object.values(CONDITION)) {
    if (typeof c !== "number") continue;

    const condition = c as CONDITION;
    if (conditionBits & condition) {
      result.push({
        text: conditionMap[condition],
        color: parseConditionColor(condition, colorMask),
        attr: parseConditionAttr(condition, colorMask),
      });

      conditionBits &= ~condition;
    }
  }

  return result;
}

function parseConditionColor(condition: CONDITION, maskPointer: number): COLORS {
  for (let i = COLORS.CLR_BLACK; i < COLORS.CLR_MAX; i++) {
    if (i === COLORS.NO_COLOR) continue; // Has lowest priority
    const clr = getArrayValue(maskPointer, i, Type.INT);

    if ((condition & clr) !== 0) {
      return i as COLORS;
    }
  }

  return COLORS.NO_COLOR;
}

function parseConditionAttr(condition: CONDITION, maskPointer: number): ATTR[] {
  const result = [];
  for (let i = COLOR_ATTR.HL_ATTCLR_DIM; i < COLOR_ATTR.BL_ATTCLR_MAX; i++) {
    const attr = getArrayValue(maskPointer, i, Type.INT);
    if ((condition & attr) !== 0) {
      result.push(ATTR_MAP[i] as ATTR);
    }
  }

  return result;
}
