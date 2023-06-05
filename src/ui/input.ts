export interface InputHandler {
    onInput(e: KeyboardEvent): void;
}

export const CONTINUE_KEY = ['Enter', ' '];
export const CANCEL_KEY = ['Escape'];
