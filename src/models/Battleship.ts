import {Ship} from "./Ship";
const battleshipSize : number = 5;

export class Battleship extends Ship {
    constructor(name) {
        super(battleshipSize, name);
    }
}