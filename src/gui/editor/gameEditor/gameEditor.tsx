import ex from "excalibur";
import React from "react";
import { EditorObject } from "./objects/object";

interface GameEditorStateI {
    cWidth: number,
    cHeight: number
}

interface GameEditorPropsI {}

export let gameEditor: GameEditor

export class GameEditor extends React.Component<GameEditorPropsI, GameEditorStateI> {
    private canvas: HTMLCanvasElement | null = null
    gameCanvas: GameEditorCanvas | undefined = undefined
    constructor(p: any) {
        super(p)
        this.state = {
            cWidth: 0,
            cHeight: 0
        }
        gameEditor = this
    }
    render() {
        return <div className="game-editor">
            <canvas ref={ e => {
                this.canvas = e
                if (this.gameCanvas && e) this.gameCanvas.canvas = e!
            } } width={ this.state.cWidth } height={ this.state.cHeight } />
        </div>
    }
    packSize() {
        const w = this.canvas!.parentElement!.clientWidth
        const h = this.canvas!.parentElement!.clientHeight
        this.setState({
            ...this.state,
            cWidth: w,
            cHeight: h
        })
    }
    componentDidMount() {
        this.gameCanvas = new GameEditorCanvas(this.canvas!)
        this.packSize()
    }
}

export class GameEditorCanvas {
    canvas: HTMLCanvasElement
    private cursor = ex.vec(0,0)
    private eye = ex.vec(0,0)
    private oldEye = this.eye
    private addingElement: EditorObject | undefined = undefined

    private elements: EditorObject[] = []

    constructor(gc: HTMLCanvasElement) {
        this.canvas = gc
        this.canvas.onmousemove = m => {
            this.setCursor(m)
            this.addingElement?.moveTo(this.cursor)
            this.paint()
        }
        this.canvas.onclick = m => {
            if (m.button === 1 && this.addingElement) {
                this.addingElement.params.fix = false
                this.elements.push(this.addingElement)
                this.addingElement = undefined
            }
        }
        this.canvas.ondrag = d => {
            if (d.button === 2) {
                this.eye = this.oldEye.add(ex.vec(d.clientX, d.clientY).sub(this.oldEye))
                this.paint()
            }
        }

        this.canvas.ondragleave = d => { if (d.button === 2) this.oldEye = this.eye }
    }

    setCursor(m: MouseEvent) { this.cursor = this.eye.add(ex.vec(m.clientX, m.clientY)) }
    setAddingElement(o: EditorObject) { this.addingElement = o }

    paint() {
        const g = this.canvas.getContext('2d')!
        g.fillStyle = 'rgb(200, 210, 255)'
        g.fillRect(0,0, this.canvas.width, this.canvas.height)
        g.translate(-this.eye.x, -this.eye.y)
        this.elements.forEach(e => e.paint(g))
    }
}