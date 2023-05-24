export class AccelIterator {
  private start = "a".charCodeAt(0);
  private end = "z".charCodeAt(0);

  private start2 = "A".charCodeAt(0);
  private end2 = "Z".charCodeAt(0);

  // Hopefully there won't be more that this
  private start3 = "0".charCodeAt(0);
  private end3 = "9".charCodeAt(0);

  private current = this.start;

  nextChar() {
    return String.fromCharCode(this.next());
  }

  next() {
    const accel = this.current;

    if (accel === this.end) {
      this.current = this.start2;
    } else if (accel === this.end2) {
      this.current = this.start3;
    } else {
      this.current += 1;
    }


    return accel;
  }

  reset() {
    this.current = this.start;
  }
}
