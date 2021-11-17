import { Vector } from "excalibur"
import { elementType, GeoActorI, GroundDataI, ScoreDataI, StartEndDataI, VectorI } from "../../../../game/dec"
import { V } from "../../../adds"
import { cellSize } from "../../editor"
import { gameCanvas, gameEditor } from "../gameEditor"

export interface EditorObjectParams {
    key: elementType,
    img?: string,
    fix: boolean,
    selected: boolean
}

export interface EditorObject {
    params: EditorObjectParams
    getData(): any
    setData(d: any): void
    moveTo(v: VectorI): void
    paint(g: CanvasRenderingContext2D): void
    includesPoint(v: VectorI): boolean
    onMouseDown(evt: MouseEvent, mousePos: VectorI): void
    onMouseMove(evt: MouseEvent, buttonPos: (VectorI|undefined)[], mousePos: VectorI): void
    onMouseUp(evt: MouseEvent, mousePos: VectorI): void
}

export class EditorObjectGeneric<T> implements EditorObject {
    data: GeoActorI<T>
    params: EditorObjectParams
    cp1: VectorI | undefined = undefined
    cp2: VectorI | undefined = undefined
    amITouched: VectorI | undefined = undefined
    wasIMoved = false
    snapPoint: VectorI | undefined = undefined

    constructor(
        k: elementType, 
        custom: T,
        w: number,
        h: number,
        img?: string,
    ) {
        this.params = {
            key: k,
            img: img,
            fix: false,
            selected: false
        }
        this.data = {
            type: k,
            geo: {
                width: w,
                height: h,
                pos: { x:0, y:0 }
            },
            custom: custom
        }
    }

    g() { return this.data.geo }
    getData() { return this.data }
    setData(d: GeoActorI<T>) { this.data = d }

    moveTo(v: VectorI) {
        this.g().pos.x = v.x
        this.g().pos.y = v.y
    }

    paint(g: CanvasRenderingContext2D) {
        if (this.creationType() === 'one-point' || this.params.fix || true) {
            g.fillStyle = this.params.fix ? 'rgb(50, 150, 255)' : 'rgba(50, 150, 255, 0.5)'
            g.fillRect(
                this.g().pos.x, 
                this.g().pos.y, 
                this.g().width,
                this.g().height
            )
            if (this.params.selected) this.paintBordersAround(g)
            this.paintSnap(g)
        }
    }

    paintSnap(g: CanvasRenderingContext2D) {
        if (this.snapPoint) {
            g.fillStyle = 'rgba(0, 150, 255, 0.4)'
            g.fillRect(
                this.snapPoint.x,
                this.snapPoint.y,
                this.g().width,
                this.g().height
            )
        }
    }

    paintBordersAround(g: CanvasRenderingContext2D, strokeStyle?: string) {
        g.strokeStyle = strokeStyle ? strokeStyle : 'red'
        g.lineWidth = 3
        g.lineCap = 'round'
        g.beginPath()

        const corner = (p1: VectorI, p2: VectorI, p3: VectorI) => {
            const cs = (this.g().width+this.g().height)/200 * 10 + 5
            const padd = 3
            const p = V.add(
                V.add(
                    V.mulVec(p2, { x:this.g().width + 2*padd, y:this.g().height + 2*padd }),
                    { x:-padd, y:-padd }
                ),
                this.g().pos
            )
            const line = (v: VectorI, move: boolean) => {
                if (move) g.moveTo(v.x, v.y)
                else g.lineTo(v.x, v.y)
            }
            line(V.add(V.mul(p1, cs), p), true)
            line(p, false)
            line(V.add(V.mul(p3, cs), p), false)
        }

        corner(
            {x:0, y:1},
            {x:0, y:0},
            {x:1, y:0}
        )
        corner(
            {x:-1, y:0},
            {x:1, y:0},
            {x:0, y:1}
        )
        corner(
            {x:0, y:-1},
            {x:1, y:1},
            {x:-1, y:0}
        )
        corner(
            {x:0, y:-1},
            {x:0, y:1},
            {x:1, y:0}
        )

        g.stroke()
    }

    fixMeEvt(evt: MouseEvent, mousePos: VectorI) {
        console.log('calling fix-me-evt')
        if (!this.params.fix && evt.button === 0) {
            if (this.creationType() === 'one-point') {
                this.data.geo.pos = mousePos
                gameCanvas().fixAddingElement()
                this.params.fix = true
            }
            else {
                if (!this.cp1) {
                    this.cp1 = mousePos
                    console.log('Saved p1')
                }
                else {
                    console.log('Saved p2')
                    console.log(this.data.geo)
                    gameCanvas().fixAddingElement()
                    this.params.fix = true
                }
            }
        }
    }

    snapPos(v: VectorI) { return V.mul(V.trunc(V.mul(v, 1/cellSize)), cellSize) }

    updateSnap() {
        if (this.snap() === 'center') {
            const halfSize = V.mul({
                x: this.g().width,
                y: this.g().height
            }, 0.5)
            const center = V.add(this.g().pos, halfSize)
            this.snapPoint = V.sub(V.add(this.snapPos(center), V.square(cellSize)), halfSize)
        }
        if (this.snap() === 'corner') {
            const lc1 = this.g().pos
            const lc2 = V.add(lc1, V.square(cellSize))
            const lcm = V.mul(V.delta(lc1, lc2), 0.5)
            this.snapPoint = this.snapPos(lcm)
        }
    }

    updateFixEvt(mousePos: VectorI) {
        if (this.creationType() === 'two-point' && this.cp1) {
            this.cp2 = mousePos
            this.updatePoints(this.cp1, this.cp2)
        }
    }

    selectEvt(evt: MouseEvent, mousePos: VectorI) {
        if (this.includesPoint(mousePos) && this.params.fix)
            gameCanvas().select(this)
    }

    onMouseDown(evt: MouseEvent, mousePos: VectorI) {
        this.fixMeEvt(evt, mousePos)
        if (this.includesPoint(mousePos) && evt.button === 0 && this.params.fix) {            
            this.amITouched = this.data.geo.pos
            this.updateSnap()
        }
    }

    onMouseMove(
        evt: MouseEvent, 
        buttonPos: (VectorI|undefined)[],
        mousePos: VectorI
    ) {
        if (!this.params.fix) {
            if (this.creationType() === 'one-point') this.data.geo.pos = mousePos
            else this.updateFixEvt(mousePos)
        } else {
            const b = buttonPos[0]
            if (b && this.amITouched) {
                if (!this.wasIMoved) gameCanvas().setCursor('move')
                this.data.geo.pos = V.add(this.amITouched, V.delta(b, mousePos))
                this.updateSnap()
                this.wasIMoved = true
            }
        }
    }

    onMouseUp(evt: MouseEvent, mousePos: VectorI) {
        if (!this.wasIMoved) this.selectEvt(evt, mousePos)
        if (this.snapPoint) this.data.geo.pos = this.snapPoint
        this.amITouched = undefined
        this.wasIMoved = false
        this.snapPoint = undefined
        gameCanvas().setCursor('default')
    }

    updatePoints(p1: VectorI, p2: VectorI) {
        const rightCp1 = {
            x: p1.x < p2.x ? p1.x : p2.x,
            y: p1.y < p2.y ? p1.y : p2.y
        }
        const size = V.abs(V.delta(p1, p2))
        this.data.geo = {
            width: size.x,
            height: size.y,
            pos: rightCp1
        }
    }

    creationType(): 'one-point' | 'two-point' { return 'one-point' }
    snap(): 'center' | 'corner' | undefined { return 'center' }

    includesPoint(v: VectorI) {
        return V.includesPoint(v, this.g().pos, { x:this.g().width, y:this.g().height })
    }
}

export class GroundEditorObject extends EditorObjectGeneric<GroundDataI> {
    constructor(
        k: elementType, 
        custom: GroundDataI,
        _w: number,
        _h: number,
        img?: string,
    ) { super(k, custom, 0, 0, img) }

    creationType(): 'one-point' | 'two-point' { return 'two-point' }
}

export const editorTemplates: {
    title: string,
    items: {
        name: string,
        templ: (cs: number) => any
    }[]
}[] = [
    {
        title: 'Punkte Sammeln',
        items: [
            {
                name: 'Stern',
                templ: (cs) => new EditorObjectGeneric<ScoreDataI>(
                    'score', { type: 'star' },
                    0.5*cs, 0.5*cs
                )
            },
            {
                name: 'Münze',
                templ: (cs) => new EditorObjectGeneric<ScoreDataI>(
                    'score', { type: 'coin' },
                    0.5*cs, 0.5*cs
                )
            },
        ]
    },
    {
        title: 'Start und Ziel',
        items: [
            {
                name: 'Start',
                templ: (cs) => new EditorObjectGeneric<StartEndDataI>(
                    'start-end', { type: 'start' },
                    0.5*cs, 0.5*cs
                )
            },
            {
                name: 'Ziel',
                templ: (cs) => new EditorObjectGeneric<StartEndDataI>(
                    'start-end', { type: 'end' },
                    0.5*cs, 0.5*cs
                )
            },
        ]
    },
    {
        title: 'Böden',
        items: [
            {
                name: 'Normaler Boden',
                templ: (cs) => new GroundEditorObject(
                    'ground', {},
                    3*cs, 1*cs
                )
            },
            {
                name: 'Ein-Kästchen Boden',
                templ: (cs) => new GroundEditorObject(
                    'ground', {},
                    cs, cs
                )
            },
            {
                name: 'Roter Boden',
                templ: (cs) => new GroundEditorObject(
                    'ground', {
                        dangerousEdges: {
                            top: true,
                            left: true,
                            bottom: true,
                            right: true
                        }
                    },
                    3*cs, 1*cs
                )
            },
            {
                name: 'Wand',
                templ: (cs) => new GroundEditorObject(
                    'ground', {},
                    0*cs, 3*cs
                )
            },
        ]
    }
]
