import { elementType, fullElementName, GeoActorI, geomShape, VectorI } from "../../../../game/dec"
import { Creative, Vec } from "../../../adds"
import { gameCanvas } from "../gameEditor"
import { ControlPointI, EditorObjectControlPoints } from "./control-points"
import { EditorObjectParamsI, elementSettingTemplates } from "./element-templates"

export class EditorObjectGeneric<T> extends EditorObjectControlPoints {
    data: GeoActorI<T>
    params: EditorObjectParamsI
    wasIMoved = false

    constructor(
        k: elementType, 
        custom: T,
        pos: VectorI,
        w: number,
        h: number,
        createCPs?: boolean
    ) {
        super()
        this.params = {
            key: k,
            selected: false,
            zIndex: 0
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
        if (createCPs !== false) this.createControlPoints()
    }

    startCPs(): ControlPointI[] {
        return [
            {
                key: 'move body',
                shape: this.shape(),
                active: true,
                snap: true,
                zIndex: -1,
                pos: Vec.zero(),
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
    name() { return fullElementName(this.data) }
    
    origin(): VectorI { return Vec.zero() }

    ltCornerVec() { // left-top corner
        return Vec.mulVec(
            this.origin(), 
            Vec.vec(-this.g().width, -this.g().height)
        )
    }
    ltCornerPos() { return Vec.add(this.g().pos, this.ltCornerVec()) }

    shiftPos(s: number) {
        this.data.geo.pos.y += s
    }

    moveTo(v: VectorI) {
        this.data.geo.pos = Vec.add(v, this.ltCornerVec())
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
            Vec.vec(this.gWP(), this.gHP()),
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
        if (Vec.distance(omp, nmp) > 0.5) this.wasIMoved = true
        return super.movedCPPos(nmp, omp, key)
    }

    onMouseUp(evt: MouseEvent, mousePos: VectorI) {
        super.onMouseUp(evt, mousePos)
        if (!this.wasIMoved) this.selectEvt(evt, mousePos)
        this.wasIMoved = false
        gameCanvas.setCursor('default')
    }

    snap(): 'center' | 'corner' | undefined { return 'center' }
    shape(): geomShape { return 'rect' }

    includesPoint(v: VectorI) {
        let b = false
        if (this.shape() === 'rect') b = Vec.includesPointInRect(v, this.ltCornerPos(), { x:this.g().width, y:this.g().height })
        if (this.shape() === 'circle') b = Vec.distance(v, this.g().pos) < this.g().width/2
        return b
    }
    isInView(pos: VectorI, size: VectorI): boolean {
        return Vec.intersectRects({
            pos: pos, size: size
        }, {
            pos: this.g().pos,
            size: Vec.vec(this.g().width, this.g().height)
        })
    }
}