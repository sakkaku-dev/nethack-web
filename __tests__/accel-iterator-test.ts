import { AccelIterator } from '../src/helper/accel-iterator';

describe('AccelIterator', () => {
    it('should create accel sequence starting lower case', () => {
        const c = new AccelIterator();

        expect(c.nextChar()).toEqual('a');
        expect(c.nextChar()).toEqual('b');
        expect(c.nextChar()).toEqual('c');
    });

    it('should continue sequence with upper case', () => {
        const c = new AccelIterator();

        let x = '';
        while ((x = c.nextChar()) != 'z') {}

        expect(c.nextChar()).toEqual('A');
        expect(c.nextChar()).toEqual('B');
        expect(c.nextChar()).toEqual('C');
    });

    it('should continue sequence with numbers', () => {
        const c = new AccelIterator();

        let x = '';
        while ((x = c.nextChar()) != 'Z') {}

        expect(c.nextChar()).toEqual('0');
        expect(c.nextChar()).toEqual('1');
        expect(c.nextChar()).toEqual('2');
    });

    it('should reset accel sequence', () => {
        const c = new AccelIterator();

        expect(c.nextChar()).toEqual('a');
        expect(c.nextChar()).toEqual('b');
        expect(c.nextChar()).toEqual('c');

        c.reset();
        expect(c.nextChar()).toEqual('a');
        expect(c.nextChar()).toEqual('b');
    });
});
