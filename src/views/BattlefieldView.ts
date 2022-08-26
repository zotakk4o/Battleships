import $ from 'jquery'
import {Legend} from "../configs/Legend";
import {Battlefield} from "../models/Battlefield";
import {ButtonsText} from "../configs/ButtonsText";
import Messages from "../messages/Messages";

export class BattlefieldView {
    private outputTimer : number;
    private showDebugBattleField : boolean;
    private endGameTimeout : number;
    private showMessageTimeout : number;
    private showButtonSelector : string;
    private attackButtonSelector : string;
    private inputSelector : string;
    private outputSelector : string;
    private battleFieldSelector : string;

    constructor() {
        this.showDebugBattleField = true;
        this.endGameTimeout = 2000;
        this.showMessageTimeout = 5000;
        this.showButtonSelector = "#show";
        this.attackButtonSelector = "#attack";
        this.inputSelector = "#coordinates";
        this.outputSelector = "#output";
        this.battleFieldSelector = "#battlefield";
    }

    /**
     * Used to attach a click handler from the controller to show or hide debug mode battlefield
     * @param handler
     */
    attachShowButtonHandler(handler : (hide : boolean) => void) : void {
        $(() => {
            $(this.showButtonSelector).on('click', (event : JQuery.Event) => {
                handler(this.showDebugBattleField);
                this.showDebugBattleField = !this.showDebugBattleField;
                if (this.showDebugBattleField) {
                    $(this.showButtonSelector).text(ButtonsText.SHOW);
                } else {
                    $(this.showButtonSelector).text(ButtonsText.HIDE);
                }
            });
        });
    }

    /**
     * Used to attach a click handler from the controller to handle user triggered attacks
     * @param handler
     */
    attachAttackButtonHandler(handler : (input : string) => void) : void {
        $(() => {
            $(this.attackButtonSelector).on('click', (event : JQuery.Event) => {
                handler(this.getInputText());
            });
        });
    }

    /**
     * Retrieves user coordinates input
     */
    getInputText() : string {
        return $(this.inputSelector).val().toString();
    }

    /**
     * Extracts the current symbol from the battlefield at (row, col)
     * @param row
     * @param col
     */
    getSymbolAtPosition(row : number, col : number) : string {
        row += 1;
        col += 2;

        return $(`${this.battleFieldSelector} tbody tr:nth-child(${row}) td:nth-child(${col})`).text();
    }

    /**
     * Changes the symbol on the battlefield at (row, col)
     * @param row
     * @param col
     * @param symbol
     */
    changeSymbolAtPosition(row : number, col : number, symbol : Legend) : void {
        row += 1;
        col += 2;

        $(`${this.battleFieldSelector} tbody tr:nth-child(${row}) td:nth-child(${col})`).text(symbol.toString());
    }

    /**
     * Displays a user-friendly message that disappears after hideMessageTimeout
     * @param message - the message to show
     * @param hideMessageTimeout - the time in milliseconds after which the message will hide. By default is set to 5 seconds
     */
    showOutputMessage(message : string, hideMessageTimeout : number = this.showMessageTimeout) : void {
        let outputField : JQuery<HTMLElement> = $(this.outputSelector);
        outputField.text(message);
        outputField.fadeIn(0);
        clearTimeout(this.outputTimer);
        this.outputTimer = setTimeout(function(){
            outputField.fadeOut();
            outputField.text("");
        },hideMessageTimeout);
    }

    /**
     * Generates the battlefield HTML
     * @param battlefield
     * @param debug - whether to show the battlefield in debug mode or not
     */
    printBattleField(battlefield : Readonly<Battlefield>, debug : boolean = false) : void {
        let rows = battlefield.rows;
        let cols = battlefield.cols;

        let thead : string = "<thead><tr><th> </th>";
        for(let i = 0; i < cols; i++) {
            thead += `<th>${i + 1}</th>`;
        }
        thead += "</tr></thead>";

        let tbody : string = "<tbody>";

        for(let row = 0; row < rows; row++) {
            tbody += `<tr><th>${String.fromCharCode("A".charCodeAt(0) + row)}</th>`;
            for(let col = 0; col < cols; col++) {
                tbody += `<td>${this.getSymbolForPosition(row, col, battlefield, debug)}</td>`;
            }
            tbody += "</tr>";
        }

        tbody += "</tbody>";
        $(() => {
            $(this.battleFieldSelector).html(thead + tbody);
        });
    }

    /**
     * After this.endGameTimeout the message for end of game is displayed and the attack button is hidden
     * @param shots - the number of shots made for winning the game
     */
    endGame(shots : number) : void {
        setTimeout(() => {
            this.showOutputMessage(Messages.END_GAME_MESSAGE.replace("{{n}}", shots.toString()));
            $(this.attackButtonSelector).hide();
        }, this.endGameTimeout)
    }

    /**
     * A helper function used to determine the symbol at given position when switching from and to debug mode
     * Symbol for a miss and that for a successful hit are not changed
     * @param row
     * @param col
     * @param battlefield
     * @param debug
     */
    private getSymbolForPosition(row : number, col : number, battlefield: Readonly<Battlefield>, debug : boolean) : string {

        let currentSymbol = this.getSymbolAtPosition(row, col);
        //Do not discard progress made so far
        if (currentSymbol === Legend.MISSED_SYMBOL || currentSymbol === Legend.SHIP_HIT_SYMBOL) {
            return currentSymbol;
        }

        let symbol : string;
        if (debug) {
            symbol = battlefield.isShipAtPosition(row, col) ? Legend.SHIP_DEBUG_SYMBOL :  Legend.HIDE_SYMBOL
        } else {
            //Used to generate a battlefield when the game starts
            symbol = Legend.DEFAULT_SYMBOL;
        }

        return symbol;
    }
}
