import * as ex from "excalibur"
import { GeoDataI, elementType } from "../dec";
import { GameActor } from "./gameActor";

export class GeoActor extends GameActor {
    geo: GeoDataI

    constructor(type: elementType, data: GeoDataI) {
        super(type)
        this.geo = data
        this.setGeo()
    }
    
    setEdgeCollider() {
        return new ex.EdgeCollider({
            begin: ex.vec(0,0),
            end: ex.vec(this.geo.width, this.geo.height)
        })
    }

    setGeo(dd?: GeoDataI) {
        const d = dd ? dd : this.geo
        if (this.geo !== d || dd === undefined) {
            this.geo = d
            this.pos = ex.vec(d.pos.x, d.pos.y)
            const c = this.useCollider()
            if (c) this.collider.set(c)
        }
    }

    useCollider(): ex.Collider | undefined {
        return this.setEdgeCollider()
    }

    gridx() { return Math.trunc(this.geo.pos.x/this.unit()) }
    gridy() { return Math.trunc(this.geo.pos.y/this.unit()) }
    gridw() { return Math.trunc(this.geo.width/this.unit()) }
    gridh() { return Math.trunc(this.geo.height/this.unit()) }
}