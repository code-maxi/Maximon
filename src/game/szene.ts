import * as ex from "excalibur"
import { Ground } from "./actors/ground"
import { BoxI, elementType, SzeneDataI, SzeneDataObjI, SzeneDataOptI, DebugOptI, VectorI } from "./dec"
import { Game } from "./game"

export class GameSzene extends ex.Scene {
    static hoverColor = 'rgba(255, 144, 0'
    static sizeSelection: elementType[] = ['ground']

    settings: SzeneDataI
    name = ''
    
    addPrev: BoxI | undefined = undefined    
    refPoint: VectorI | undefined = undefined
    pointer: ex.Vector | null = null

    constructor(s: SzeneDataI) {
        super()
        this.settings = s
        this.setup()
    }

    setup() {
        this.initInputs()

        this.on('postdraw', e => {
            e.ctx.fillStyle = 'blue'
            e.ctx.fillRect(100,100,100,100)
            if (this.game().editMode) {
                if (this.pointer) this.drawHoverRect(
                    e.ctx,
                    this.pointer.x,
                    this.pointer.y,
                    1, 1, 'f', 0.15
                )
                if (this.addPrev) {
                    this.drawHoverRect(
                        e.ctx,
                        this.addPrev.x,
                        this.addPrev.y,
                        this.addPrev.w,
                        this.addPrev.h, 
                        'fd', 0.15
                    )
                }
            }
        })

        this.importData(this.settings.obj)
        this.updateOpts(this.settings.opt)
    }

    initInputs() {
        this.game().input.pointers.on('down', e => {
            const s = this.game().addType
            if (s) {
                const b = GameSzene.sizeSelection.includes(s)

                if (b) {
                    if (this.addPrev) this.onCreate(s, this.addPrev)
                    else this.refPoint = {
                        x: e.worldPos.x,
                        y: e.worldPos.y
                    }
                }

                else this.onCreate(s, {
                    x: this.grid(e.worldPos.x),
                    y: this.grid(e.worldPos.y),
                    w: 1, h: 1
                })
            }
        })

        this.game().input.pointers.on('move', e => {
            this.pointer = e.worldPos

            if (this.refPoint) {
                const [x1, x2, y1, y2] = [
                    e.worldPos.x,
                    this.refPoint.x,
                    e.worldPos.y,
                    this.refPoint.y
                ]
                this.addPrev = {
                    x: this.grid(x1 < x2 ? x1 : x2),
                    y: this.grid(y1 < y2 ? y1 : y2),
                    w: this.grid(Math.abs(x1 - x2)),
                    h: this.grid(Math.abs(y1 - y2))
                }
            }
        })

        this.game().input.pointers.on('leave', e => { this.pointer = null })
        this.game().input.pointers.on('enter', e => { this.pointer = e.worldPos })
    }

    private drawHoverRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, style: string, i?: number) {
        g.strokeStyle = GameSzene.hoverColor + ')'
        g.lineWidth = 1
        g.fillStyle = GameSzene.hoverColor + ', ' +(i ? i : 0.3) + ')'
        const xx = this.grid(x)
        const yy = this.grid(y)
        const ww = w * this.unit()
        const hh = h * this.unit()
        if (style.includes('f')) g.fillRect(xx, yy, ww, hh)
        if (style.includes('s')) g.strokeRect(xx, yy, ww, hh)
    }

    onCreate(type: elementType, box: BoxI) {
        if (type === 'ground') this.add(new Ground(box))
        this.addPrev = undefined
    }

    game() { return this.engine as Game }
    unit() { return this.settings.opt.cellSize }

    grid(s: number) { return Math.trunc(s / this.unit()) }

    rc(v: ex.Vector) { return ex.vec(
        Math.trunc(v.x / this.unit()),
        Math.trunc(v.y / this.unit()) 
    ) }

    updateOpts(ns: SzeneDataOptI) {
        this.settings.opt = ns

        ex.Physics.acc = new ex.Vector(
            0, -this.settings.opt.globalGravity * 0.1)
    }

    importData(ns: SzeneDataObjI) {
        this.settings.obj = ns
    }

    grounds() {
        return this.actors.filter(g => g instanceof Ground) as Ground[]
    }
}