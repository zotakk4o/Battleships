import {BattlefieldController} from "./controllers/BattlefieldController";
import Battlefield from "./configs/Battlefield";

//Starting the game
new BattlefieldController(Battlefield.ROWS, Battlefield.COLS, Battlefield.SHIPS);