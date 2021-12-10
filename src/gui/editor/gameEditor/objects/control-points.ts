import { VectorI } from "../../../../game/dec"
import { directionT, V } from "../../../adds"
import { EditorTooltipI, gameCanvas } from "../gameEditor"
import { EditorObject, EditorObjectParams } from "./object"

export interface ControlPointI {
    pos: VectorI
    key: string
    size?: number
    lockedAxis?: 'x' | 'y'
    zIndex?: number
    shape: 'rect' | 'circle'
    parentKey?: string
    hoverTooltip?: {
        tooltip: () => EditorTooltipI,
        align: directionT
    }
    lazy?: number
    hovered?: boolean
    paint?: {
        fillColor?: string
        strokeColor?: string
        icon?: string
        shadow?: [ string, number ],
        size?: number,
        hoverText?: string
    }
    allowOutOfRange?: boolean
    snap?: boolean
    active?: boolean
    oldMovingPos?: VectorI
    selfPaint?: (g: CanvasRenderingContext2D, c: ControlPointI, cPos: VectorI) => void
    includesPoint?: (c: ControlPointI, mouse: VectorI) => boolean
}

export abstract class EditorObjectControlPoints implements EditorObject {
    abstract params: EditorObjectParams
    abstract getData(): any
    abstract setData(d: any, fromGUI?: boolean): void
    abstract paint(g: CanvasRenderingContext2D): void
    abstract includesPoint(v: VectorI): boolean
    abstract onSelect(b: boolean): void
    abstract shiftPos(s: number): void
    
    controlPoints: ControlPointI[] = []

    abstract startCPs(): ControlPointI[]

    createControlPoints() {
        this.controlPoints = this.startCPs().map(
            e => ({ 
                ...e, 
                pos: this.getCPPos(e.key), 
                zIndex: e.zIndex ? e.zIndex : 0,
                hovered: false 
            })
        )
    }
        
    // Control Points

    sortedCPs() { return this.controlPoints.sort((a,b) => (a.zIndex ? a.zIndex : 0) - (b.zIndex ? b.zIndex : 0)) }

    getCP(key: string) { return this.controlPoints.find(c => c.key === key) }
    getCPPos(key: string): VectorI {
        return this.getCP(key)!.pos
    }
    getCPPos2(key: string): VectorI { // With parenting
        const cp = this.getCP(key)!
        const cpParentPos = cp.parentKey ? this.getCPPos2(cp.parentKey) : V.zero()
        return V.add(cpParentPos, this.getCPPos(key))
    }
    setCPPos(vec: VectorI, key: string) {
        this.controlPoints.map(cp => cp.key === key ? { ...cp, pos: vec } : cp)
    }

    movingCP() { return this.controlPoints.find(cp => cp.oldMovingPos !== undefined) }

    movedCPPos(
        newMousePos: VectorI, 
        oldMousePos: VectorI,
        cpn: ControlPointI
    ) {
        let d = V.delta(oldMousePos, newMousePos)
        if (cpn.lazy) d = V.mul(d, cpn.lazy)
        if (cpn.lockedAxis === 'x') d = V.mulVec(d, { x:1, y:0 })
        if (cpn.lockedAxis === 'y') d = V.mulVec(d, { x:0, y:1 })
        let res = V.add(cpn.oldMovingPos!, d)
        if (cpn.allowOutOfRange !== true) res = gameCanvas.inRange(res)
        return cpn.snap ? d = gameCanvas.snapPos(res, 'grid-point') : res
    }

    updateControlPoints(newMousePos: VectorI, oldMousePos: VectorI) {
        const mcp = this.movingCP()
        if (mcp && mcp.active === true) {
            this.setCPPos(this.movedCPPos(
                newMousePos, 
                oldMousePos, 
                mcp
            ), mcp.key)
        }
    }

    selectPoint(selected: string) {
        this.controlPoints = this.controlPoints.map(
            cp => selected && cp.key === selected ? { ...cp, oldMovingPos: this.getCPPos2(cp.key) } : cp)
    }

    updateTooltips(mousePos: VectorI) {
        this.controlPoints.forEach(cp => {
            if (
                cp.active === true && 
                cp.hoverTooltip &&  
                this.controlPointIncluded(cp, mousePos)
            ) {
                gameCanvas.setTooltip(
                    cp.hoverTooltip.align, 
                    cp.hoverTooltip.tooltip()
                )
            }
        })
    }

    onMouseDown(evt: MouseEvent, mousePos: VectorI) {
        if (evt.button === 0) {
            let selected: [string,number] | undefined = undefined
            this.controlPoints.forEach(cp => {
                if (
                    cp.active === true && 
                    this.controlPointIncluded(cp, mousePos) && 
                    (!selected || (selected && selected[1] < cp.zIndex!))
                ) {
                    selected = [ cp.key, cp.zIndex! ]
                }
            })
            if (selected) this.selectPoint(selected[0])
        }
        this.updateTooltips(mousePos)
    }

    onMouseMove(
        _: MouseEvent, 
        buttonPos: (VectorI|undefined)[],
        mousePos: VectorI
    ) {
        const lm = buttonPos[0]
        if (lm) this.updateControlPoints(mousePos, lm)
        else this.updateTooltips(mousePos)
    }

    onMouseUp(_evt: MouseEvent, mousePos: VectorI) {
        this.controlPoints = this.controlPoints.map(cp => ({ ...cp, oldMovingPos: undefined }))
        this.updateTooltips(mousePos)
    }

    logCPs() {
        this.controlPoints.forEach(cp => {
            console.log(cp.key +  ': ' + V.toString(this.getCPPos2(cp.key)))
        })
    }

    paintOneCP(g: CanvasRenderingContext2D, cp: ControlPointI) {
        const pos = this.getCPPos2(cp.key)

        if (cp.active === true) {
            if (cp.selfPaint) cp.selfPaint(g, cp, pos)
            else if (cp.paint && cp.paint.size) {
                const transp = 'rgba(0,0,0)'
                g.lineWidth = 3
                g.strokeStyle = cp.paint.strokeColor ? cp.paint.strokeColor : transp
                g.fillStyle = cp.paint.fillColor ? cp.paint.fillColor : transp
                
                g.beginPath()

                const pos2 = gameCanvas.mcs(pos)

                if (cp.shape === 'circle') g.arc(pos2.x, pos2.y, cp.paint.size, 0, Math.PI*2)
                if (cp.shape === 'rect') {
                    const mt = (x: number, y: number, f?: boolean) => {
                        const p = V.add(pos2, V.mulVec(V.square(cp.paint!.size!), V.vec(x,y)))
                        if (f === true) g.moveTo(p.x, p.y)
                        else g.lineTo(p.x, p.y)
                    }
                    mt(0, 0, true); mt(1, 0); mt(1, 1); mt(0, 1)
                }
                g.stroke()
                
                if (cp.paint.shadow) {
                    g.shadowColor = cp.paint.shadow[0]
                    g.shadowBlur = cp.paint.shadow[1]
                }
                g.fill()
            }
        }
    }

    paintAllCPs(g: CanvasRenderingContext2D) {
        this.sortedCPs().forEach(cp => this.paintOneCP(g, cp))
    }

    controlPointIncluded(cp: ControlPointI, mousePos: VectorI) {
        return cp.includesPoint ? cp.includesPoint(cp, mousePos)
                    : V.distance(mousePos, this.getCPPos2(cp.key)) <= cp.size!/gameCanvas.data.cellSize
    }
}
