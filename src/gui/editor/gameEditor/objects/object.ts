import { elementType, VectorI } from "../../../../game/dec"
import { V } from "../../../adds"
import { ControlPointI } from "./control-points"

export interface EditorObjectParams {
    key: elementType,
    img?: string,
    selected: boolean
}

export interface EditorObject {
    params: EditorObjectParams
    getData(): any
    setData(d: any, fromGUI?: boolean): void
    paint(g: CanvasRenderingContext2D): void
    includesPoint(v: VectorI): boolean
    onMouseDown(evt: MouseEvent, mousePos: VectorI): void
    onMouseMove(evt: MouseEvent, buttonPos: (VectorI|undefined)[], mousePos: VectorI): void
    onMouseUp(evt: MouseEvent, mousePos: VectorI): void
    onSelect(b: boolean): void
    shiftPos(s: number): void
}

export function moveCPTemplate(p: {
    key: string, 
    tooltipText: string, 
    lockedAxis?: 'x' | 'y',
    snap?: boolean,
    lazy?: number
}): ControlPointI {
    return {
        key: p.key,
        parentKey: 'move body',
        shape: 'circle',
        snap: p.snap,
        lockedAxis: p.lockedAxis,
        lazy: p.lazy,
        size: 12,
        hoverTooltip: {
            align: 'top',
            tooltip: () => ({
                text: p.tooltipText,
                style: {
                    backgroundColor: 'rgba(255, 230, 0, 0.5)',
                    textColor: 'black'
                }
            })
        },
        paint: {
            fillColor: 'yellow',
            strokeColor: 'red',
            size: 6
        },
        active: false,
        pos: V.zero()
    }
}

/*

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
    paint(g: CanvasRenderingContext2D): void
    includesPoint(v: VectorI): boolean
    onMouseDown(evt: MouseEvent, mousePos: VectorI): void
    onMouseMove(evt: MouseEvent, buttonPos: (VectorI|undefined)[], mousePos: VectorI): void
    onMouseUp(evt: MouseEvent, mousePos: VectorI): void
}

export interface ControlPointI {
    pos: VectorI,
    key: string,
    size?: number,
    color?: number,
    icon?: string,
    includesPoint?: (c: ControlPointI, mouse: VectorI) => boolean
    lockedAxis?: 'x' | 'y'
}
export abstract class EditorObjectAbstract implements EditorObject {
    abstract params: EditorObjectParams
    abstract getData(): any
    abstract setData(d: any): void
    abstract paint(g: CanvasRenderingContext2D): void
    abstract includesPoint(v: VectorI): boolean

    // giving snap and control points
    // Snap
    controlPoints: ControlPointI[]
    cpPressed: {
        point: ControlPointI,
        oldPos: VectorI
    } | undefined

    constructor(cpt: ControlPointI[]) {
        this.controlPoints = cpt.map(e => ({ ...e, pos: V.zero() }))
    }

    snapPos(v: VectorI, divides?: boolean, center?: boolean) {
        const s = gameCanvas.data.cellSize / (divides === true ? gameCanvas.data.cellDivides : 1) 
        return V.add(V.mul(V.trunc(V.mul(v, 1/s)), s), center === true ? { x: s/2, y: -s/2 } : V.zero())
    }

        
    // Control Points

    getCPPos(key: string) { return this.controlPoints.find(c => c.key === key)!.pos }
    setCPPos(vec: VectorI, key: string) {
        this.controlPoints.map(cp => cp.key === key ? { ...cp, pos: vec } : cp)
    }

    movedCPPos(
        newMousePos: VectorI, 
        oldMousePos: VectorI,
        oldCPPos: VectorI,
        cpn: ControlPointI
    ) {
        let d = V.delta(oldMousePos, newMousePos)
        if (cpn.lockedAxis === 'x') d = V.mulVec(d, { x:1, y:0 })
        if (cpn.lockedAxis === 'y') d = V.mulVec(d, { x:0, y:1 })
        return V.add(oldCPPos, d)
    }

    updateControlPoints(newMousePos: VectorI, oldMousePos: VectorI) {
        if (this.cpPressed?.point) {
            this.setCPPos(this.movedCPPos(
                newMousePos, 
                oldMousePos, 
                this.cpPressed.oldPos,
                this.cpPressed.point
            ), this.cpPressed.point.key)
        }
    }

    onMouseDown(evt: MouseEvent, mousePos: VectorI) {
        if (this.cpActive()) this.controlPoints.forEach(c => {
            if (this.controlPointIncluded(c, mousePos) && evt.button === 0) {
                this.cpPressed = {
                    point: c,
                    oldPos: this.getCPPos(c.key)
                }
            }
        })
    }

    onMouseMove(
        _: MouseEvent, 
        buttonPos: (VectorI|undefined)[],
        mousePos: VectorI
    ) {
        if (this.cpActive()) {
            const lm = buttonPos[0]
            if (lm) this.updateControlPoints(mousePos, lm)
        }
    }

    onMouseUp(evt: MouseEvent, mousePos: VectorI) {
        this.cpPressed = undefined
    }

    cpActive() { return true }

    private controlPointIncluded(cp: ControlPointI, mousePos: VectorI) {
        return cp.includesPoint ? cp.includesPoint(cp, mousePos)
                    : V.distance(mousePos, this.getCPPos(cp.key)) <= cp.size!
    }
}

export class EditorObjectGeneric<T> extends EditorObjectAbstract {
    data: GeoActorI<T>
    params: EditorObjectParams
    amITouched: VectorI | undefined = undefined
    wasIMoved = false
    snapPoint: VectorI | undefined = undefined
    fixingStep1: VectorI | undefined = V.zero()

    constructor(
        k: elementType, 
        custom: T,
        w: number,
        h: number,
        cpt?: ControlPointI[],
        fix?: boolean
    ) {
        super([
            ...(cpt ? cpt : []),
            {
                key: 'move body',
                pos: V.zero(),
                includesPoint: (_, m) => this.includesPoint(m)
            }
        ])
        this.params = {
            key: k,
            fix: fix ? fix : false,
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
    cp1() { return this.g().pos }
    cp2() { return V.add(this.g().pos, {x: this.g().width, y: -this.g().height}) }

    moveTo(v: VectorI) {
        this.g().pos.x = v.x
        this.g().pos.y = v.y
    }

    paint(g: CanvasRenderingContext2D) {
        if (this.creationType() === 'one-point' || this.params.fix || !this.fixingStep1) {
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
        if (this.creationType() === 'two-point') {
            this.paintOuterPoints(g)
        }
    }

    paintSnap(g: CanvasRenderingContext2D) {
        if (this.snapPoint) {
            const p = 5
            g.fillStyle = 'rgba(255, 150, 0, 0.3)'
            g.strokeStyle = 'rgba(255, 150, 0)'
            g.lineWidth = 1
            g.fillRect(
                this.snapPoint.x + p,
                this.snapPoint.y + p,
                this.g().width - 2*p,
                this.g().height - 2*p
            )
            g.strokeRect(
                this.snapPoint.x + p,
                this.snapPoint.y + p,
                this.g().width - 2*p,
                this.g().height - 2*p
            )
        }
    }

    paintOuterPoints(g: CanvasRenderingContext2D) {
        const drawCp = (p: VectorI, f: number) => {
            const c = V.add(p, V.mul({x:cellSize, y:-cellSize}, 0.5*f))
            const r = cellSize * 0.25
            g.fillStyle = 'rgba(255, 150, 0, 0.7)'
            g.beginPath()
            g.arc(c.x, c.y, r, 0, Math.PI*2)
            g.fill()
        }
        if (this.fixingStep1) drawCp(this.fixingStep1, 1)
        else {
            drawCp(this.cp1(), 1)
            drawCp(this.cp2(), -1)
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

    setGeoData(p: { pos?: VectorI, width?: number, height?: number }) {
        if (p.pos) this.data.geo.pos = p.pos
        if (p.width) this.data.geo.width = p.width
        if (p.height) this.data.geo.height = p.height
    }

    fixMeEvt(evt: MouseEvent, mousePos: VectorI) {
        if (!this.params.fix && evt.button === 0) {
            if (this.creationType() === 'one-point') {
                this.setGeoData({ pos: mousePos })
                gameCanvas.fixAddingElement()
                this.params.fix = true
            }
            else {
                if (this.fixingStep1) {
                    this.setGeoData({pos: this.snapPos(mousePos)})
                    this.fixingStep1 = undefined
                }
                else {
                    gameCanvas.fixAddingElement()
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
            this.snapPoint = V.sub(V.add(this.snapPos(center), V.mul(V.square(cellSize), 0.5)), halfSize)
        }
        if (this.snap() === 'corner') {
            const lc1 = this.g().pos
            const lc2 = V.add(lc1, { x:cellSize, y:-cellSize })
            const lcm = V.add(lc1, V.mul(V.delta(lc1, lc2), 0.5))
            this.snapPoint = this.snapPos(lcm)
        }
    }

    updateFixEvt(mousePos: VectorI) {
        if (this.creationType() === 'two-point') {
            if (this.fixingStep1) this.fixingStep1 = this.snapPos(mousePos)
            else {
                const cp2 = this.snapPos(this.cp2())
                const delta = V.abs(V.delta(this.g().pos, cp2))
                this.setGeoData({ width: delta.x, height: delta.y })
            }
        }
    }

    selectEvt(evt: MouseEvent, mousePos: VectorI) {
        if (this.includesPoint(mousePos) && this.params.fix)
            gameCanvas.select(this)
    }

    getCPPos(key: string) {
        if (key === 'move body') return this.g().pos
        else return super.getCPPos(key)
    }
    setCPPos(cp: VectorI, key: string) {
        super.setCPPos(cp, key)
        if (key === 'move body') this.data.geo.pos = cp
    }

    movedCPPos(nmp: VectorI, omp: VectorI, ocpp: VectorI, key: ControlPointI) {
        if (!this.wasIMoved) gameCanvas.setCursor('move')
        this.wasIMoved = true
        return super.movedCPPos(nmp, omp, ocpp, key)
    }

    onMouseDown(evt: MouseEvent, mousePos: VectorI) {
        super.onMouseDown(evt, mousePos)
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
        super.onMouseMove(evt, buttonPos, mousePos)
        if (!this.params.fix) {
            if (this.creationType() === 'one-point') this.setGeoData({pos: mousePos})
            else this.updateFixEvt(mousePos)
        }
    }

    onMouseUp(evt: MouseEvent, mousePos: VectorI) {
        super.onMouseUp(evt, mousePos)
        if (!this.wasIMoved) this.selectEvt(evt, mousePos)
        if (this.snapPoint) this.data.geo.pos = this.snapPoint
        this.amITouched = undefined
        this.wasIMoved = false
        this.snapPoint = undefined
        gameCanvas.setCursor('default')
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
        fix?: boolean,
        w?: number,
        h?: number
    ) { super(k, custom, w ? w : 0, h ? h : 0, fix) }

    creationType(): 'one-point' | 'two-point' { return 'two-point' }
    snap(): 'center' | 'corner' | undefined { return 'corner' }
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
                    'ground', {}
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
                    }
                )
            }
        ]
    }
]


*/