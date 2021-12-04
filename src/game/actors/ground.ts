import * as ex from "excalibur"
import { Vector } from "excalibur";
import { BoxI, GeoActorI, GroundDataI } from "../dec";
import { GeoActor } from "./geoActor";

export const groundConsts = {
    trianglePerUnit: 2
}

export class Ground extends GeoActor {
    settings: GroundDataI

    constructor(box: BoxI, s?: GroundDataI) {
        super('ground', {
            pos: {
                x: box.x,
                y: box.y
            },
            width: box.w,
            height: box.h
        })
        this.settings = s ? s : {
            vertical: false,
            width: 1
        }
    }

    setup() {
        this.anchor = new ex.Vector(0,0)
        this.body.collisionType = ex.CollisionType.Fixed
    }

    setSettings(s: GeoActorI<GroundDataI>) {
        this.settings = s.custom
        this.setGeo(s.geo)
    }

    onDraw(g: CanvasRenderingContext2D, e: ex.PostDrawEvent) {
        const u = this.szene().unit()
        for (let y = 0; y < this.height; y ++) {
            for (let x = 0; x < this.width; y ++) {
                g.save()
                g.fillRect(0, 0, u, u)
                g.strokeStyle = 'white'
                g.strokeRect(0, 0, u, u)
                if (x === 0 && this.settings.dangerousEdges?.top === false) {
                    g.fillStyle = 'green'
                    g.fillRect(0,0 - u/3, u, u/3)
                }
                g.restore()
            }
        }
    }

    useCollider() {
        const s = this.settings ? this.settings : {}
        let lt = new ex.Vector(0,0)
        let lb = new ex.Vector(0,this.height)
        let rb = new ex.Vector(this.width,this.height)
        let rt = new ex.Vector(this.width,0)

        /*if (s.dangerousEdges) {
            const t = s.dangerousEdges.top ? 1 : 0
            const l = s.dangerousEdges.left ? 1 : 0
            const b = s.dangerousEdges.bottom ? 1 : 0
            const r = s.dangerousEdges.right ? 1 : 0
            const ts = this.unit() / groundConsts.trianglePerUnit

            lt = lt.add(new Vector(-l * ts, -t * ts))
            lb = lt.add(new Vector(-l * ts,  b * ts))
            rb = lt.add(new Vector( r * ts,  b * ts))
            rt = lt.add(new Vector( r * ts, -t * ts))
        }*/
        
        return new ex.PolygonCollider({
            points: [ lt, lb, rb, rt ]
        })
    }

    static firstPoint?: ex.Vector = undefined
}