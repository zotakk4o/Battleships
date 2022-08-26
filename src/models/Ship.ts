import ShipErrors from '../errors/ShipErrors';

export abstract class Ship {
    private _sectorsRemaining : number;
    private _name : string;

    constructor(sizeInSquares : number, name : string) {
        this.sectorsRemaining = sizeInSquares;
        this.name = name;
    }

    isDestroyed() : boolean {
        return this.sectorsRemaining == 0;
    }

    /**
     * A ship is made up of sectors (squares on the battlefield)
     */
    destroySector() : void {
        if (this._sectorsRemaining <= 0) {
            return;
        }

        this._sectorsRemaining--;
    }

    set sectorsRemaining(sizeInSquares : number) {
        if (sizeInSquares <= 0) {
            throw RangeError(ShipErrors.SHIP_LENGTH_ERROR);
        }

        this._sectorsRemaining = sizeInSquares;
    }

    get sectorsRemaining() : number {
        return this._sectorsRemaining;
    }

    set name(name : string) {
        this._name = name;
    }

    get name() : string {
        return this._name;
    }
}