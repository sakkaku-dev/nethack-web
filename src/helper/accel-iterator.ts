export class AccelIterator {
    private start = 'a'.charCodeAt(0);
    private end = 'z'.charCodeAt(0);

    private start2 = 'A'.charCodeAt(0);
    private end2 = 'Z'.charCodeAt(0);

    private current = this.start;

    nextChar() {
        const code = this.next();
        return code > 0 ? String.fromCharCode(code) : '';
    }

    next() {
        const accel = this.current;

        if (accel === this.end) {
            this.current = this.start2;
        } else if (accel === this.end2) {
            this.current = 0;
        } else if (accel > 0) {
            this.current += 1;
        }

        return accel;
    }

    reset() {
        this.current = this.start;
    }
}
