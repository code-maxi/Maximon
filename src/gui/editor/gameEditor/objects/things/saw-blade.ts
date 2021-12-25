import { SawBladeDataI, VectorI } from "../../../../../game/dec"
import { Vec } from "../../../../adds"
import { image } from "../../../../images"
import { gameCanvas } from "../../gameEditor"
import { ControlPointI } from "../control-points"
import { moveCPTemplate } from "../element-templates"
import { EditorObjectGeneric } from "../element-generic"

export class SawBladeEditorObject extends EditorObjectGeneric<SawBladeDataI> {
    constructor(
        custom: SawBladeDataI,
        pos: VectorI
    ) {
        super('saw-blade', custom, pos, 1, 1, false)
        this.setRadius()
        this.createControlPoints()
    }

    origin(): VectorI { // origin of object to the center
        return Vec.vec(0.5,0.5)
    }

    startCPs(): ControlPointI[] {
        return [
            ...super.startCPs(),
            moveCPTemplate({ key: 'radius-cp', tooltipText: 'Ziehe, um Größe zu verändern.', lockedAxis: 'x', lazy: 0.5 })
        ]
    }

    setCPPos(cp: VectorI, key: string) {
        super.setCPPos(cp, key)
        if (key === 'radius-cp') this.setRadius(Math.abs(cp.x - this.g().pos.x))
    }
    getCPPos(key: string) {
        if (key === 'radius-cp') return Vec.vec(this.data.custom.radius, 0)
        else return super.getCPPos(key)
    }

    selectPoint(key: string) { super.selectPoint(key) }
    onlyActiveCPsSelect() { return [ 'radius-cp' ] }

    setRadius(r?: number) {
        if (r) this.data.custom.radius = r
        this.data.geo.width = this.data.custom.radius * 2
        this.data.geo.height = this.data.custom.radius * 2
    }

    setData(d: any, fromGUI?: boolean) {
        if (fromGUI === true) {
            
        } else this.data = d

        this.setRadius()
    }

    paint(g: CanvasRenderingContext2D) {
        let center = this.g().pos
        let pos = this.ltCornerPos()
        center = gameCanvas.mcs(center)
        pos = gameCanvas.mcs(pos)
        const width = this.custom().radius * 2 * gameCanvas.cellSize()

        g.drawImage(image('saw-blade')!, pos.x, pos.y, width, width)

        if (this.params.selected) this.paintBordersAround(g, -1)

        this.paintAllCPs(g)
    }

    includesPoint(v: VectorI) {
        return Vec.distance(v, this.g().pos) < this.custom().radius
    }
}