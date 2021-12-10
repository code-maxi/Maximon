import { GroundDataI, VectorI } from "../../../../../game/dec"
import { Creative, V } from "../../../../adds"
import { image } from "../../../../images"
import { gameCanvas } from "../../gameEditor"
import { ControlPointI } from "../control-points"
import { moveCPTemplate } from "../object"
import { EditorObjectGeneric } from "../object-generic"

export class GroundEditorObject extends EditorObjectGeneric<GroundDataI> {
    oldW = 0

    constructor(
        custom: GroundDataI,
        pos: VectorI
    ) {
        super('ground', custom, pos, 1, 1)
        this.updateCP()
    }

    startCPs(): ControlPointI[] {
        return [
            ...super.startCPs(),
            moveCPTemplate({ key: 'st-corner', tooltipText: 'Ziehe, um Größe zu verändern.', lockedAxis: 'x', snap: true}),
            moveCPTemplate({ key: 'nd-corner', tooltipText: 'Ziehe, um Größe zu verändern.', lockedAxis: 'x', snap: true })
        ]
    }

    getCPPos(key: string) {
        const addVec = V.vec(0, this.custom().vertical === false && this.custom().elevated === 'b' ? 1 - this.g().height : 0)
        if (key === 'st-corner') return addVec
        else if (key === 'nd-corner') {
            const s = this.size()
            const c = this.custom().vertical
            return V.add(V.vec(c ? 0 : s.x, c ? s.y : 0), addVec)
        }
        else return super.getCPPos(key)
    }

    setCPPos(cp: VectorI, key: string) {
        super.setCPPos(cp, key)
        if (key === 'st-corner') this.data.geo.pos = cp
    }

    selectPoint(key: string) {
        super.selectPoint(key)
        this.oldW = this.custom().width
    }

    onlyActiveCPsSelect() {
        return [ 'st-corner', 'nd-corner' ]
    }

    ltCornerVec(): VectorI {
        return this.custom().elevated === 'b' && this.custom().vertical === false ? V.vec(0, 1 - this.g().height) : V.zero()
    }

    size(n?: number) {
        return V.vec(
            this.custom().vertical ? (n ? n : 1) : this.custom().width, 
            this.custom().vertical ? this.custom().width : (this.custom().elevated ? 1/3 : 1) * (n ? n : 1)
        )
    }
    updateSize() {
        const size = this.size()
        this.data.geo.width = size.x
        this.data.geo.height = size.y
    }

    setData(d: any, fromGUI?: boolean) {
        if (fromGUI === true) {
            this.data.custom.vertical = d.custom.vertical
            this.data.custom.elevated = d.custom.elevated
            this.data.custom.groundType = d.custom.groundType
        } else this.data = d

        this.updateCP()
        this.updateSize()
    }

    updateCP() {
        this.controlPoints = this.controlPoints.map(
            cp => cp.key === 'st-corner' || cp.key === 'nd-corner' ? { ...cp, lockedAxis: this.custom().vertical ? 'y' : 'x' } : cp)
        this.updateSize()
    }

    movedCPPos(
        newMousePos: VectorI, 
        oldMousePos: VectorI,
        cpn: ControlPointI
    ) {
        if (cpn.key === 'st-corner' || cpn.key === 'nd-corner') {
            const v = this.custom().vertical
            const d = V.delta(oldMousePos, newMousePos)
            const res = gameCanvas.snapPos(V.add(cpn.oldMovingPos!, d), 'grid-point')
            const direc = (a: VectorI) => v ? a.y : a.x
            let diff = (direc(res)) - direc(cpn.oldMovingPos!)

            this.data.custom.width = this.oldW + diff * (cpn.key === 'st-corner' ? -1 : 1)
            if (this.custom().width < 1) this.data.custom.width = 1
            this.updateSize()
            if (cpn.key === 'st-corner') {
                this.data.geo.pos = res
            }
        }
        return super.movedCPPos(newMousePos, oldMousePos, cpn)
    }

    paint(g: CanvasRenderingContext2D) {
        const sbn = <T>(s:T,b:T,n:T) => this.custom().groundType === 'ice' ? s : (this.custom().groundType === 'barrier' ? b : n)
        g.fillStyle = sbn('rgba(50, 170, 230, 0.5)', 'rgba(240, 80, 0, 0.5)', 'rgba(147, 78, 0, 0.5)')
        g.strokeStyle = sbn('rgba(50, 170, 230, 1)', 'rgba(240, 80, 0, 1)', 'rgba(147, 78, 0, 1)')
        g.lineWidth = 2
        Creative.paintRoundedRectangle(g, this.gPosP().x, this.gPosP().y, this.gWP(), this.gHP(), 8)
        g.fill()
        g.stroke()

        g.setLineDash([4,7])
        g.lineCap = 'round'

        if (this.custom().groundType === 'grass') {
            g.lineWidth = 6
            g.strokeStyle = 'rgb(64, 140, 13)'
            g.beginPath()
            const inset = 8
            const p1 = V.add(this.gPosP(), V.vec(inset/2, -inset))
            const p2 = V.add(V.addX(this.gPosP(), this.gWP()), V.vec(-inset/2, -inset))
            g.moveTo(p1.x, p1.y)
            g.lineTo(p2.x, p2.y)
            g.stroke()
        }
        if (this.custom().groundType === 'barrier') {
            g.lineWidth = 3
            g.strokeStyle = 'rgb(200, 0, 0)'
            const padding = 3
            const pos2 = V.add(this.gPosP(), V.square(-padding))
            const size2 = V.add(V.vec(this.gWP(), this.gHP()), V.square(padding*2))
            Creative.paintRoundedRectangle(g, pos2.x, pos2.y, size2.x, size2.y, 8)
            g.stroke()
        }

        g.setLineDash([0])
        //if (this.params.selected) this.paintBordersAround(g)
        this.paintAllCPs(g)
    }
}
