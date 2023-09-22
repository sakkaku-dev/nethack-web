import { Subject } from 'rxjs';
import { Vector, Tile, mult, add, sub } from '../../models';
import { center, rel, topRight } from '../styles';

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

    createEmptyTile() {
        const div = document.createElement('div');
        div.style.width = `${this.tileSize}px`;
        div.style.height = `${this.tileSize}px`;
        return div;
    }

    createBackgroundImage(tile: number, accelerator: number = 0) {
        const div = this.createEmptyTile();
        if (tile >= 0) {
            div.style.backgroundImage = `url('${this.file}')`;
            div.style.backgroundRepeat = 'no-repeat';

            const pos = this.getTilePosition(tile);
            const realPos = mult(pos, { x: this.tileSize, y: this.tileSize });
            div.style.backgroundPosition = `-${realPos.x}px -${realPos.y}px`;
        }

        if (accelerator !== 0) {
            const accel = document.createElement('div');
            accel.innerHTML = String.fromCharCode(accelerator);
            accel.classList.add('accel');
            div.appendChild(accel);

            rel(div);
            if (tile < 0) {
                accel.style.background = '#33333399';
                center(div);
            } else {
                accel.style.padding = '0 0.1rem';
                accel.style.background = '#00000099';
                topRight(accel);
            }
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
    private tiles: Pick<Tile, 'tile' | 'peaceful'>[][] = [];
    private canvas: HTMLCanvasElement;
    private cursor: HTMLImageElement;
    private mapSize: Vector = { x: 79, y: 21 }; // Fixed map size? Might change in other version?
    private mapBorder = true;
    private isRogue = false;

    onTileSetChange$ = new Subject<void>();

    constructor(root: HTMLElement, public tileSet?: TileSet, public rogueTileSet?: TileSet) {
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

    get currentTileSet() {
        return this.isRogue ? this.rogueTileSet : this.tileSet;
    }

    setMapBorder(enableMapBorder: boolean) {
        this.mapBorder = enableMapBorder;
        this.rerender();
    }

    setTileSets(tileset: TileSet, rogueTileSet: TileSet) {
        this.tileSet = tileset;
        this.rogueTileSet = rogueTileSet;

        this.onTileSetChange$.next();
        this.rerender();
    }

    private setRogueLevel(isRogue: boolean) {
        this.isRogue = isRogue;
        this.onTileSetChange$.next();
    }

    isRogueLevel() {
        return this.isRogue;
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

    printTile(tile: Tile) {
        this.setRogueLevel(tile.rogue); // not the most efficient way, but works
        if (!this.tiles[tile.x]) this.tiles[tile.x] = [];

        const current = this.tiles[tile.x][tile.y];
        if (current?.tile === tile.tile && current?.peaceful === tile.peaceful) return;

        this.tiles[tile.x][tile.y] = { tile: tile.tile, peaceful: tile.peaceful };
        this.drawTile(tile.x, tile.y);
    }

    private drawTile(x: number, y: number) {
        const tile = this.tiles[x][y];
        if (!this.currentTileSet || tile == null) return;

        const set = this.currentTileSet;
        const source = set.getCoordinateForTile(tile.tile);
        const size = set.tileSize;
        const localPos = this.localToCanvas({ x, y });

        this.context.drawImage(
            // Source
            set.image,
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

        if (tile.peaceful) {
            const radius = 3;
            const padding = 2;
            this.context.beginPath();
            this.context.arc(
                localPos.x + size - radius - padding,
                localPos.y + radius + padding,
                radius,
                0,
                2 * Math.PI
            );
            this.context.fillStyle = '#FF99FF';
            this.context.fill();
        }
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
        return { x: this.currentTileSet?.tileSize || 0, y: this.currentTileSet?.tileSize || 0 };
    }

    private get canvasCenter(): Vector {
        return { x: this.canvas.width / 2, y: this.canvas.height / 2 };
    }
}
