import { Vector, Tile, mult, add, sub } from '../../models';
import { accelStyle, rel } from '../styles';

export class TileSet {
    image: HTMLImageElement;

    constructor(private file: string, public tileSize: number, private tileCol: number) {
        this.image = new Image();
        this.image.src = file;
    }

    private getTilePosition(tile: number) {
        const row = Math.floor(tile / this.tileCol);
        const col = tile % this.tileCol;

        return { x: col, y: row };
    }

    getCoordinateForTile(tile: number): Vector {
        const pos = this.getTilePosition(tile);
        return { x: pos.x * this.tileSize, y: pos.y * this.tileSize };
    }

    createBackgroundImage(tile: number, accelerator: number = 0) {
        const div = document.createElement('div');
        div.style.width = `${this.tileSize}px`;
        div.style.height = `${this.tileSize}px`;
        div.style.backgroundImage = `url('${this.file}')`;
        div.style.backgroundRepeat = 'no-repeat';

        const pos = this.getTilePosition(tile);
        const realPos = mult(pos, { x: this.tileSize, y: this.tileSize });
        div.style.backgroundPosition = `-${realPos.x}px -${realPos.y}px`;

        if (accelerator !== 0) {
            const accel = document.createElement('div');
            accel.innerHTML = String.fromCharCode(accelerator);
            accel.classList.add('accel');
            div.appendChild(accel);

            rel(div);
            accelStyle(accel);
        }

        return div;
    }

    equals(other?: TileSet) {
        if (!other) return false;
        return this.image.src === other.image.src;
    }
}

export class TileMap {
    private context: CanvasRenderingContext2D;
    private center: Vector = { x: 0, y: 0 };
    private tiles: number[][] = [];
    private canvas: HTMLCanvasElement;
    private cursor: HTMLImageElement;
    private mapSize: Vector = { x: 79, y: 21 }; // Fixed map size? Might change in other version?
    private mapBorder = true;

    constructor(root: HTMLElement, private tileSet?: TileSet) {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'map';
        this.cursor = document.createElement('img');
        this.cursor.src = 'cursor.png';
        this.cursor.id = 'cursor';

        root.appendChild(this.canvas);
        root.appendChild(this.cursor);

        this.context = this.canvas.getContext('2d')!;
        this.updateCanvasSize();
        this.clearCanvas();
    }

    setMapBorder(enableMapBorder: boolean) {
        this.mapBorder = enableMapBorder;
        this.rerender();
    }

    setTileSet(tileset: TileSet) {
        this.tileSet = tileset;
        this.rerender();
    }

    onResize() {
        this.updateCanvasSize();
        this.rerender();
    }

    private updateCanvasSize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    recenter(c: Vector) {
        this.center = c;
        this.rerender();
    }

    clearMap() {
        this.tiles = [];
        this.clearCanvas();
    }

    private clearCanvas() {
        this.cursor.style.display = 'none';
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.mapBorder) {
            const map = mult(this.mapSize, this.tileSize);
            const localPos = this.localToCanvas({ x: 1, y: 0 });

            this.context.fillStyle = '#111';
            this.context.fillRect(localPos.x, localPos.y, map.x, map.y);
        }
    }

    private rerender() {
        this.clearCanvas();
        for (let x = 0; x < this.tiles.length; x++) {
            const row = this.tiles[x];
            if (row) {
                for (let y = 0; y < row.length; y++) {
                    this.drawTile(x, y);
                }
            }
        }

        this.cursor.style.display = 'block';
    }

    addTile(...tiles: Tile[]) {
        tiles.forEach((tile) => {
            if (!this.tiles[tile.x]) this.tiles[tile.x] = [];
            this.tiles[tile.x][tile.y] = tile.tile;
            this.drawTile(tile.x, tile.y);
        });
    }

    private drawTile(x: number, y: number) {
        const tile = this.tiles[x][y];
        if (!this.tileSet || tile == null) return;

        const source = this.tileSet.getCoordinateForTile(tile);
        const size = this.tileSet.tileSize;
        const localPos = this.localToCanvas({ x, y });

        this.context.drawImage(
            // Source
            this.tileSet.image,
            source.x,
            source.y,
            size,
            size,
            // Target
            localPos.x,
            localPos.y,
            size,
            size
        );
    }

    private localToCanvas(pos: Vector) {
        const globalPos = this.toGlobal(pos);
        const globalCenter = this.toGlobal(this.center);
        const relPosFromCenter = sub(globalPos, globalCenter);
        return add(this.canvasCenter, relPosFromCenter);
    }

    private toGlobal(vec: Vector): Vector {
        return mult(vec, this.tileSize);
    }

    private get tileSize() {
        return { x: this.tileSet?.tileSize || 0, y: this.tileSet?.tileSize || 0 };
    }

    private get canvasCenter(): Vector {
        return { x: this.canvas.width / 2, y: this.canvas.height / 2 };
    }
}
