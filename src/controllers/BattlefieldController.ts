import {Battlefield} from "../models/Battlefield";
import {BattlefieldView} from "../views/BattlefieldView";
import {Ship} from "../models/Ship";
import BattlefieldErrors from "../errors/BattlefieldErrors";
import Messages from "../messages/Messages";
import {Legend} from "../configs/Legend";

export class BattlefieldController {
    private battlefield : Battlefield;
    private view : BattlefieldView;
    private shots : number;
    private shipsDestroyed : number;

    constructor(rows : number, cols : number, ships : Ship[]) {
        this.battlefield = new Battlefield(rows, cols, ships);
        this.view = new BattlefieldView();
        this.view.printBattleField(this.battlefield);
        this.view.attachShowButtonHandler(this.showHideBattlefieldHandler.bind(this));
        this.view.attachAttackButtonHandler(this.attackButtonHandler.bind(this));
        this.shots = 0;
        this.shipsDestroyed = 0;
    }

    /**
     * Shows or hides the debug battlefield
     * Any progress made on the real battlefield will be saved when changing the mode
     *
     * @param showDebugBattleField - whether the click was for showing or hiding the debug battlefield
     */
    private showHideBattlefieldHandler(showDebugBattleField : boolean) : void {
        this.view.printBattleField(this.battlefield, showDebugBattleField);
    }

    /**
     * Handles the attack made by a user at given coordinates
     * @param coordinates - the row and column of the square to attack, e.g. A5
     */
    private attackButtonHandler(coordinates : string) : void {
        let row : number;
        let col : number;

        try {
            row = this.getRowCoordinate(coordinates.substring(0, 1));
            col = this.getColCooridnate(coordinates.substring(1));
        } catch (e) {
            this.view.showOutputMessage(e.message);
            return ;
        }

        this.shots++;

        if (!this.battlefield.wasShipHit(row, col)) {
            this.view.changeSymbolAtPosition(row, col, Legend.MISSED_SYMBOL);
            this.view.showOutputMessage(Messages.MISS_MESSAGE);
            return;
        }

        let ship : Ship = this.battlefield.getShipByPosition(row, col);
        if (ship.isDestroyed()) {
            this.view.showOutputMessage(Messages.SUNK_MESSAGE + "-" + ship.name);
            this.shipsDestroyed++;
        } else {
            this.view.showOutputMessage(Messages.HIT_MESSAGE);
        }

        this.view.changeSymbolAtPosition(row, col, Legend.SHIP_HIT_SYMBOL);

        if (this.shipsDestroyed === this.battlefield.shipsCount) {
            this.endGame();
        }
    }

    /**
     * Ends the game visually
     */
    private endGame() : void {
        this.view.endGame(this.shots);
    }

    /**
     * A helper function to validate the user input for the row coordinate
     * @param rowCoordinate - the user inputted row coordinate
     * @throws RangeError if the row chosen is not on the battlefield
     * @returns the row coordinate that is on the battlefield
     */
    private getRowCoordinate(rowCoordinate : string) : number {
        let row : number = rowCoordinate.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
        if (row < 0 || row >= this.battlefield.rows) {
            throw RangeError(BattlefieldErrors.INVALID_ROW_ATTACK);
        }

        return row;
    }

    /**
     * A helper function to validate the user input for the col coordinate
     * @param colCoordinate - the use inputted col coordinate
     * @throws RangeError if the col chosen is not on the battlefield
     * @returns the col coordinate that is on the battlefield
     */
    private getColCooridnate(colCoordinate : string) : number {
        let col : number = Number(colCoordinate) - 1;
        if (Number.isNaN(col) || col < 0 || col >= this.battlefield.cols) {
            throw RangeError(BattlefieldErrors.INVALID_COL_ATTACK);
        }

        return col;
    }
}