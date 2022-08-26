import {Ship} from "./Ship";
const destroyerSize : number = 4;

export class Destroyer extends Ship {
    constructor(name) {
        super(destroyerSize, name);
    }
}