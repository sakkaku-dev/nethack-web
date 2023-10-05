import { horiz } from '../styles';

export class Console {
    private elem: HTMLElement;

    constructor(root: HTMLElement) {
        this.elem = document.createElement('pre');
        this.elem.id = 'output';
        root.appendChild(this.elem);

        this.elem.onclick = (e) => {
            if (e.ctrlKey) return;

            if (this.elem.style.height) {
                this.elem.style.height = '';
                setTimeout(() => this.scrollBottom(), 200); // Wait until transition finished
            } else {
                this.elem.style.height = '30rem';
            }
        };
    }

    // See Dialog
    // https://stackoverflow.com/questions/6234773/can-i-escape-html-special-chars-in-javascript
    private escapeHtml(unsafe: string) {
        return unsafe
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    appendLine(line: string) {
        const text = document.createElement('span');
        horiz(text);
        const linkStyleUpdate = (active: boolean, child?: HTMLElement) => {
            const style = active ? 'underline' : 'none';
            [...text.children].forEach((x) => {
                const c = x as HTMLElement;
                if (child) {
                    if (child === c) {
                        c.style.textDecoration = style;
                    } else {
                        c.style.textDecoration = 'none';
                    }
                } else {
                    c.style.textDecoration = style;
                }
            });
        };
        text.onkeydown = (e) => linkStyleUpdate(e.ctrlKey);
        text.onmouseover = (e) => linkStyleUpdate(e.ctrlKey);
        text.onmouseout = (e) => linkStyleUpdate(false);

        text.onclick = (e) => {
            if (!e.ctrlKey) return;
            this.openWikiLink(line);
        };

        line.split(' ').forEach((part) => {
            const el = document.createElement('span');
            el.innerHTML = this.escapeHtml(part);
            el.onmousemove = (e) => linkStyleUpdate(e.ctrlKey, el);
            el.onclick = (e) => {
                if (!e.ctrlKey) return;
                e.preventDefault();
                e.stopPropagation();
                this.openWikiLink(part);
            };

            text.appendChild(el);
        });

        this.elem.appendChild(text);
        this.scrollBottom();
    }

    private openWikiLink(text: string) {
        const keyword = text.replaceAll(' ', '_');
        window.open(`https://nethackwiki.com/${keyword}`, '_blank')?.focus();
    }

    append(elem: HTMLElement) {
        this.elem.appendChild(elem);
        this.scrollBottom();
    }

    private scrollBottom() {
        this.elem.scrollTo(0, this.elem.scrollHeight);
    }
}
