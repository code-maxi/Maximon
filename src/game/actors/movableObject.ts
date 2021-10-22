import * as ex from "excalibur"
import { GameActor } from "./gameActor"
import { Ground } from "./ground"

export class MovableObject extends GameActor {
    /*settings: ObjectDataI

    constructor(s: ObjectDataI, args: ex.ActorArgs) {
        super(args)
        this.settings = s
    }*/

    /*ground(touching?: boolean) {
        const g = this.szene().grounds().filter(
            g => 
                g.pos.x <= this.center.x && 
                g.pos.x+g.width >= this.center.x
        ).sort(g => Math.trunc(g.pos.y - this.pos.y))
        const gs = g.length > 0 ? g[0] : undefined

        gs ? (
            touching === true ? (
                gs.body.collider.collide(this.body.collider) ? gs : null
            ) : gs
        ) : null
    }*/
}