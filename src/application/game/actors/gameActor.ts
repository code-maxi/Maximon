import * as ex from "excalibur"
import { GraphicsComponent } from "excalibur";
import { elementType } from "../dec";
import { Game } from "../game";
import { GameSzene } from "../szene";

export class GameActor extends ex.Actor {
    type: elementType

    constructor(type: elementType, args?: ex.ActorArgs) {
        super(args)
        
        this.type = type

        this.on('postdraw', g => {
            this.onDraw(g.ctx, g)
        })
        this.setup()
    }
    
    setup() {}

    szene() { return this.scene as GameSzene }
    game() { return this.szene().game() as Game }
    unit() { return this.szene().unit() }

    onDraw(g: CanvasRenderingContext2D, e: ex.PostDrawEvent) {

    }
}