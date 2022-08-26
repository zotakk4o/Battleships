import {Ship} from "./Ship";
import BattlefieldErrors from "../errors/BattlefieldErrors";

enum Direction {
    Left,
    Right,
    Up,
    Down
}

export class Battlefield {
    private _rows: number;
    private _cols: number;
    private _ships: Ship[];
    private _battleField: number[][];

    constructor(rows : number, cols : number, ships : Ship[]) {
        //Cannot have a private setter and a public getter
        this.setRows(rows);
        this.setCols(cols);
        this.setShips(ships);

        this._battleField = [];
        this.init();
    }

    /**
     * Destroys a sector from a ship if a successful hit was made
     * @param row
     * @param col
     * @returns whether a ship was successfully hit by an attack at (row, col)
     */
    wasShipHit(row : number, col : number) : boolean {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            return false;
        }

        if (this.battleField[row][col] === 0) {
            return false;
        }

        let ship : Ship = this.getShipByPosition(row, col);
        ship.destroySector();

        return true;
    }

    /**
     * Retrieves data of a ship from the battlefield by coordinates
     * @param row
     * @param col
     * @throws if no ship was found an error is thrown
     * @returns the ship at those coordinates
     */
    getShipByPosition(row : number, col : number) : Ship {
        if (!this.isShipAtPosition(row, col)) {
            throw RangeError(BattlefieldErrors.INVALID_SHIP_POSITION);
        }

        return this.ships[this.battleField[row][col] - 1];
    }

    /**
     * Checks whether there is a ship at a given position on the battlefield
     * @param row
     * @param col
     * @returns true if a part of a ship is located at (row, col)
     */
    isShipAtPosition(row : number, col : number) : boolean {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols || this.battleField[row][col] === 0) {
            return false;
        }

        return true;
    }

    /**
     * Used to initialize a battlefield and position the ships
     */
    private init() : void {
        this.initializeBattlefield();
        this.positionShips();
    }

    /**
     * Creates an empty battlefield without any ships
     */
    private initializeBattlefield() : void {
        for(let row = 0; row < this._rows; row++) {
            this._battleField.push(new Array(this._cols).fill(0));
        }
    }

    /**
     * Randomly positions the ships on the battlefield
     * @throws Error if the battlefield is too small for the ships to fit
     */
    private positionShips() : void {
        for(let i = 0; i < this._ships.length; i++) {
            let ship : Ship = this._ships[i];
            try {
                //positionShip will throw an error if the maximum call stack size is exceeded, which happens when the battlefield is too small for the ships to fit
                //The 2D cutting stock problem is NP Hard :)
                this.positionShip(ship, i + 1);
            } catch (e) {
                throw Error(BattlefieldErrors.SMALL_BATTLEFIELD);
            }
        }
    }

    /**
     * Positions a ship randomly on the battlefield
     * @param ship the ship to be positioned on the battlefield
     * @param nthShip used to fill the battlefield with the index of the ship in this._ships + 1
     */
    private positionShip(ship : Readonly<Ship>, nthShip : Readonly<number>) : void {
        let shipStartRow : number = this.generateShipStartPositionRow();
        let shipStartCol : number = this.generateShipStartPositionCol();

        if (this._battleField[shipStartRow][shipStartCol] !== 0) {
            this.positionShip(ship, nthShip);
            return;
        }

        let direction : Direction = Battlefield.generateShipDirection();
        if (!this.testShipPositioning(shipStartRow, shipStartCol, direction, ship.sectorsRemaining, nthShip)) {
            this.positionShip(ship, nthShip);
            return;
        }
    }

    /**
     * A helper function to position a ship starting from (row, col) and "floating" in a given direction
     * @param row
     * @param col
     * @param direction
     * @param sectorsRemaining
     * @param nthShip
     */
    private testShipPositioning(row : number, col : number, direction : Readonly<Direction>, sectorsRemaining : number, nthShip : number) : boolean {
        switch(direction) {
            case Direction.Left:
                return this.tryPositionLeft(row, col, sectorsRemaining, nthShip);
            case Direction.Right:
                return this.tryPositionRight(row, col, sectorsRemaining, nthShip);
            case Direction.Up:
                return this.tryPositionUp(row, col, sectorsRemaining, nthShip);
            case Direction.Down:
                return this.tryPositionDown(row, col, sectorsRemaining, nthShip);
        }
    }

    /**
     * A helper function to position a ship starting from (row, col) and "floating" left from it
     * @param row
     * @param col
     * @param sectorsRemaining
     * @param nthShip
     */
    private tryPositionLeft(row : number, col : number, sectorsRemaining : number, nthShip : number) : boolean {
        for (let i = 0; i < sectorsRemaining; i++) {
            let newCol = col - i;
            if (newCol < 0 || this._battleField[row][newCol] !== 0) {
                return false;
            }
        }

        //Fill the number of the ship on the battlefield
        for(; sectorsRemaining > 0; sectorsRemaining--) {
            this._battleField[row][col--] = nthShip;
        }
        return true;
    }

    /**
     * A helper function to position a ship starting from (row, col) and "floating" right from it
     * @param row
     * @param col
     * @param sectorsRemaining
     * @param nthShip
     */
    private tryPositionRight(row : number, col : number, sectorsRemaining : number, nthShip : number) : boolean {
        for (let i = 0; i < sectorsRemaining; i++) {
            let newCol = col + i;
            if (newCol >= this._cols || this._battleField[row][newCol] !== 0) {
                return false;
            }
        }

        //Fill the number of the ship on the battlefield
        for(; sectorsRemaining > 0; sectorsRemaining--) {
            this._battleField[row][col++] = nthShip;
        }
        return true;
    }

    /**
     * A helper function to position a ship starting from (row, col) and "floating" up from it
     * @param row
     * @param col
     * @param sectorsRemaining
     * @param nthShip
     */
    private tryPositionUp(row : number, col : number, sectorsRemaining : number, nthShip : number) : boolean {
        for (let i = 0; i < sectorsRemaining; i++) {
            let newRow = row - i;
            if (newRow < 0 || this._battleField[newRow][col] !== 0) {
                return false;
            }
        }

        //Fill the number of the ship on the battlefield
        for(; sectorsRemaining > 0; sectorsRemaining--) {
            this._battleField[row--][col] = nthShip;
        }
        return true;
    }

    /**
     * A helper function to position a ship starting from (row, col) and "floating" down from it
     * @param row
     * @param col
     * @param sectorsRemaining
     * @param nthShip
     */
    private tryPositionDown(row : number, col : number, sectorsRemaining : number, nthShip : number) : boolean {
        for (let i = 0; i < sectorsRemaining; i++) {
            let newRow = row + i;
            if (newRow >= this._rows || this._battleField[newRow][col] !== 0) {
                return false;
            }
        }

        //Fill the number of the ship on the battlefield
        for(; sectorsRemaining > 0; sectorsRemaining--) {
            this._battleField[row++][col] = nthShip;
        }
        return true;
    }

    private generateShipStartPositionRow() : number {
        return Math.round(Math.random() * (this._rows - 1));
    }

    private generateShipStartPositionCol() : number {
        return Math.round(Math.random() * (this._cols - 1));
    }

    private static generateShipDirection() : Direction {
        return Direction[Direction[Math.round(Math.random() * 3)]];
    }

    private setRows(width: number) {
        if (width <= 0) {
            throw RangeError(BattlefieldErrors.BATTLEFIELD_ROWS_ERROR);
        }

        this._rows = width;
    }

    private setCols(height: number) {
        if (height <= 0) {
            throw RangeError(BattlefieldErrors.BATTLEFIELD_COLS_ERROR);
        }

        this._cols = height;
    }

    private setShips(ships : Readonly<Ship[]>) {
        if (ships.length == 0) {
            throw RangeError(BattlefieldErrors.NO_SHIPS_ERROR);
        }

        this._ships = ships.slice();//https://stackoverflow.com/questions/3978492/fastest-way-to-duplicate-an-array-in-javascript-slice-vs-for-loop
    }

    private get ships() : Ship[] {
        return this._ships;
    }

    get shipsCount() : number {
        return this._ships.length;
    }

    get rows(): number {
        return this._rows;
    }

    get cols(): number {
        return this._cols;
    }

    get battleField() : Readonly<number[][]> {
        return this._battleField;
    }
}