import {Battleship} from "../models/Battleship";
import {Destroyer} from "../models/Destroyer";

export default {
    ROWS: 10,
    COLS: 10,
    SHIPS: [
        new Battleship("Yram"),
        new Destroyer("Htebazile"),
        new Destroyer("Nyelob Enna")
    ]
};