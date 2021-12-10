import { elementType, fullElementName, GeoActorI, VectorI } from "../../../../game/dec"
import { Creative, V } from "../../../adds"
import { gameCanvas } from "../gameEditor"
import { ControlPointI, EditorObjectControlPoints } from "./control-points"
import { EditorObjectParams } from "./object"

export class EditorObjectGeneric<T> extends EditorObjectControlPoints {
    data: GeoActorI<T>
    params: EditorObjectParams
    wasIMoved = false

    constructor(
        k: elementType, 
        custom: T,
        pos: VectorI,
        w: number,
        h: number
    ) {
        super()
        this.params = {
            key: k,
            selected: false
        }
        this.data = {
            type: k,
            geo: {
                width: w,
                height: h,
                pos: pos
            },
            custom: custom
        }
        this.createControlPoints()
    }

    startCPs(): ControlPointI[] {
        return [
            {
                key: 'move body',
                shape: 'rect',
                active: true,
                snap: true,
                zIndex: -1,
                pos: V.zero(),
                hoverTooltip: {
                    align: 'top',
                    tooltip: () => ({
                        text: this.name(),
                        style: {}
                    })
                },
                includesPoint: (_, m) => this.includesPoint(m)
            }
        ]
    }

    custom() { return this.data.custom }
    g() { return this.data.geo }
    gPosP() { return gameCanvas.mcs(this.ltCornerPos()) }
    gWP() { return this.g().width * gameCanvas.data.cellSize }
    gHP() { return this.g().height * gameCanvas.data.cellSize }
    getData() { return this.data }
    setData(d: any, fromGUI?: boolean) { if (fromGUI !== false) this.data = d } // must be overridden
    name() { return fullElementName(this.data) + (this.params.selected ? ' – ausgewählt' : '') }
    
    origin(): VectorI { return V.zero() }

    ltCornerVec() { // left-top corner
        return V.mulVec(
            this.origin(), 
            V.vec(-this.g().width, -this.g().height)
        )
    }
    ltCornerPos() { return V.add(this.g().pos, this.ltCornerVec()) }

    shiftPos(s: number) {
        this.data.geo.pos.y += s
    }

    moveTo(v: VectorI) {
        this.data.geo.pos = V.add(v, this.ltCornerVec())
    }

    paintSelf(g: CanvasRenderingContext2D) {
        g.fillStyle = 'rgba(21, 154, 255, 0.5)'
        g.lineWidth = 3
        Creative.paintRoundedRectangle(g, this.gPosP().x, this.gPosP().y, this.gWP(), this.gHP(), 20)
        g.fill()
    }

    paint(g: CanvasRenderingContext2D) {
        this.paintSelf(g)
        if (this.params.selected) this.paintBordersAround(g)
    }

    paintBordersAround(g: CanvasRenderingContext2D, padding?: number, strokeStyle?: string) {
        Creative.paintBordersAround(
            g, this.gPosP(), 
            V.vec(this.gWP(), this.gHP()),
            strokeStyle, padding
        )
    }

    selectEvt(_: MouseEvent, mousePos: VectorI) {
        if (this.includesPoint(mousePos)) {
            gameCanvas.select(this)
        }
    }

    onSelect(b: boolean) {
        const list = this.onlyActiveCPsSelect()
        this.controlPoints = this.controlPoints.map(
            cp => list.includes(cp.key) ? { ...cp, active: b } : cp
        )
    }

    onlyActiveCPsSelect(): string[] { return [] }

    getCPPos(key: string) {
        if (key === 'move body') return this.g().pos
        else return super.getCPPos(key)
    }
    setCPPos(cp: VectorI, key: string) {
        super.setCPPos(cp, key)
        if (key === 'move body') {
            this.data.geo.pos = cp
        }
    }

    movedCPPos(nmp: VectorI, omp: VectorI, key: ControlPointI) {
        if (!this.wasIMoved) gameCanvas.setCursor('move')
        if (V.distance(omp, nmp) > 0.5) this.wasIMoved = true
        return super.movedCPPos(nmp, omp, key)
    }

    onMouseUp(evt: MouseEvent, mousePos: VectorI) {
        super.onMouseUp(evt, mousePos)
        if (!this.wasIMoved) this.selectEvt(evt, mousePos)
        this.wasIMoved = false
        gameCanvas.setCursor('default')
    }

    snap(): 'center' | 'corner' | undefined { return 'center' }

    includesPoint(v: VectorI) {
        return V.includesPoint(v, this.ltCornerPos(), { x:this.g().width, y:this.g().height })
    }
}