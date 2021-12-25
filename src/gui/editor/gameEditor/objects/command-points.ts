import { CommandDataI, editorColors, geomShape, VectorI } from "../../../../game/dec";
import { Creative, def, Num, Vec } from "../../../adds";
import { gameCanvas } from "../gameEditor";
import { ControlPointI } from "./control-points";
import { EditorObjectGeneric } from "./element-generic";

export interface CommandStyleI {
    iconKey?: string,
    relativeSize?: number,
    color: editorColors
}

export const commandPointStyle: [string, CommandStyleI][] = [
    [ '/jumper/set-speechbuble', {
        iconKey: 'cp/speechbuble',
        color: 'blue'
    } ],
    [ '/jumper/set-gravity', {
        iconKey: 'cp/gravity',
        color: 'blue'
    } ],
    [ '/camera/zoom', {
        iconKey: 'cp/zoom',
        color: 'yellow'
    } ]
]

export class CommandPoint extends EditorObjectGeneric<CommandDataI> {
    static command_point_size = 0.45 
    static max_y_pos = 80
    static min_y_pos = 30

    yPos = 30

    constructor(d: CommandDataI, pos: VectorI) {
        super(
            'command',
            d, pos,
            CommandPoint.command_point_size,
            CommandPoint.command_point_size
        )
        this.setToPos(pos)
    }

    shape(): geomShape { return 'circle' }

    style() { return commandPointStyle.find(cps => cps[0] === this.custom().command)![1] }
    setData(d: any, _?: boolean) { this.data = d }

    origin() { return Vec.vec(0.5,0.5) }
    pos() { return Vec.vec(this.custom().time, this.yPos) }
    worldPos() { return Vec.vec(
        this.custom().time,
        gameCanvas.worldCoords(Vec.vec(0, gameCanvas.canvas.height - this.yPos)).y
    ) }
    screenPos() { return Vec.vec(
        gameCanvas.screenCoords(Vec.vec(this.custom().time, 0)).x,
        gameCanvas.canvas.height - this.yPos
    ) }
    scaling() {
        const s = ((gameCanvas.getScaling() - 1) * 0.4 + 1)
        return 1//s > 2? 2 : (s < 0.5? 0.5 : s)
    }
    radius() {
        return CommandPoint.command_point_size
            * def(1, this.style().relativeSize)
            * this.scaling()
    }
    setToPos(v: VectorI) {
        this.yPos = gameCanvas.canvas.height - gameCanvas.screenCoords(v).y
        this.data.custom.time = v.x
    }

    paintSelf(g: CanvasRenderingContext2D): void {
        Creative.paintIconPoint(
            g,
            this.style(), 
            this.screenPos(), 
            this.radius() * this.cellSize(),
            this.scaling()
        )
    }

    paintBordersAround(g: CanvasRenderingContext2D, padding?: number, strokeStyle?: string) {
        const r = this.radius()
        const pos = this.screenPos()
        Creative.paintBordersAround(
            g, 
            Vec.sub(pos, Vec.square(r * this.cellSize())), 
            Vec.square(r*2 * this.cellSize()),
            strokeStyle, padding
        )
    }

    getCPPos(key: string) {
        if (key === 'move body') return this.worldPos()
        else return super.getCPPos(key)
    }
    setCPPos(cp: VectorI, key: string) {
        super.setCPPos(cp, key)
        if (key === 'move body') this.setToPos(cp)
    }
    
    movedCPPos(
        newMousePos: VectorI, 
        oldMousePos: VectorI,
        cpn: ControlPointI
    ) {
        if (cpn.key === 'move body') {
            let d = Vec.delta(oldMousePos, newMousePos)
            let res = Vec.add(cpn.oldMovingPos!, d)
            const resScreenY = Num.range(
                gameCanvas.canvas.height - CommandPoint.max_y_pos, 
                gameCanvas.screenCoords(res).y,
                gameCanvas.canvas.height - CommandPoint.min_y_pos
            )
            res.y = gameCanvas.worldCoords(Vec.vec(0, resScreenY)).y
            if (cpn.allowOutOfRange !== true) res = gameCanvas.inRange(res)
            res = Vec.vec(gameCanvas.snapPos(res, 'grid-point').x, res.y)
            return res
        }
        else return super.movedCPPos(newMousePos, oldMousePos, cpn)
    }

    includesPoint(v: VectorI): boolean {
        return Vec.pointInShape('circle', v, this.worldPos(), this.radius())
    }

    static commandPointRange() {
        return [
            gameCanvas.canvas.height - this.max_y_pos - this.min_y_pos,
            gameCanvas.canvas.height
        ]
    }
    
    static paintCommandPointRange(g: CanvasRenderingContext2D) {
        const yRange = this.commandPointRange()
        g.fillStyle = 'rgba(255,255,255, 0.6)'
        g.fillRect(0, yRange[0], gameCanvas.canvas.width, -(yRange[0] - yRange[1]))
        
        g.strokeStyle = 'rgb(100,100,100)'
        g.lineWidth = 0.5

        g.beginPath()
        g.moveTo(0, yRange[0])
        g.lineTo(gameCanvas.canvas.width, yRange[0])
        g.stroke()

        Creative.strokeTextBorder(
            g,
            {
                text: 'Zeit-Kommandos',
                pos: Vec.vec(10, yRange[0] + 25),
                align: 'right',
                distance: 0
            },
            {
                backgroundColor: 'rgba(0,0,0, 0.1)',
                textColor: 'black',
                font: {
                    size: 15,
                    style: 'sans-serif'
                }
            }
        )

        g.shadowBlur = 0
        g.shadowColor = ''
    }
}