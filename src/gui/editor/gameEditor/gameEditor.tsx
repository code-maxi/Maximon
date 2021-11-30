import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ex from "excalibur";
import React from "react";
import { ScoreDataI, SzeneDataI, SzeneDataObjI, SzeneDataOptI, VectorI } from "../../../game/dec";
import { modulo, V } from "../../adds";
import { EditorObject, EditorObjectGeneric, editorTemplates, GroundEditorObject } from "./objects/object";
import { Button, ButtonGroup, IconButton } from '@mui/material';
import { cellSize, editor } from '../editor';
import { image } from '../../images';
import { GameCanvas } from '../../../game/canvas';

interface GameEditorStateI {
    cWidth: number,
    cHeight: number,
    cursor: string
}

interface GameEditorPropsI {
    startData: SzeneDataOptI
}

export let gameEditor: GameEditor
export let gameCanvas: GameEditorCanvas

export class GameEditor extends React.Component<GameEditorPropsI, GameEditorStateI> {
    private canvas: HTMLCanvasElement | null = null
    gameCanvas: GameEditorCanvas | undefined = undefined
    constructor(p: any) {
        super(p)
        this.state = {
            cWidth: 0,
            cHeight: 0,
            cursor: 'default'
        }
        gameEditor = this
    }
    render() {
        return <div id="game-container">
            <canvas ref={ e => {
                this.canvas = e
                if (this.gameCanvas && e) this.gameCanvas.canvas = e!
            } } width={ this.state.cWidth } height={ this.state.cHeight } style={{
                cursor: this.state.cursor
            }} />
            <div className="zoom-button-group">
                <ButtonGroup>
                    <IconButton onClick={() => this.gameCanvas?.zoom(0.25)}>
                        <ZoomInIcon />
                    </IconButton>
                    <IconButton onClick={() => this.gameCanvas?.zoom(-0.25)}>
                        <ZoomOutIcon />
                    </IconButton>
                </ButtonGroup>
            </div>
            <Button variant="contained" className="test-button">
                Test
            </Button>
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
        this.gameCanvas = new GameEditorCanvas(this.canvas!, this.props.startData, s => {
            this.setState({ ...this.state, cursor: s })
        })
        this.packSize()
        window.onresize = () => this.packSize()
    }
}



export class GameEditorCanvas {
    canvas: HTMLCanvasElement

    private cursor: VectorI = {x:0,y:0}
    private eye: VectorI = {x:0,y:0}
    private scaling = 1
    private oldEye = this.eye
    private diffPoint: VectorI = {x:0, y:0}

    private addingType: [string, string] | undefined
    private selectedElement: EditorObject | undefined

    private elements: EditorObject[] = []
    private buttonsPressed: boolean[] = [false, false, false]
    private buttonsPos: (VectorI | undefined)[] = [undefined, undefined, undefined]

    data: SzeneDataOptI

    setCursor: (c: string) => void

    paintGrid = true
    

    constructor(gc: HTMLCanvasElement, data: SzeneDataOptI, sc: (c: string) => void) {
        this.data = data
        this.canvas = gc
        this.setCursor = sc

        gameCanvas = this

        this.canvas.onmousedown = e => {
            this.setCanvasCursor(e)

            if (e.button >= 0 && e.button <= this.buttonsPressed.length) {
                this.buttonsPressed[e.button] = true
                this.buttonsPos[e.button] = this.cursor
            }

            if (this.buttonsPressed[1]) {
                this.diffPoint = {x:e.clientX, y:e.clientY}
                this.oldEye = this.eye
                this.setCursor('move')
            }

            if (this.buttonsPressed[0]) {
                if (this.addingType) {
                    this.fixAddingElement()
                    editor.setAddingType()
                    console.log(this.elements)
                }
            }

            this.elements.forEach(o => o.onMouseDown(e, this.cursor))
            
            this.paint()
        }

        this.canvas.onmouseup = e => {
            this.setCanvasCursor(e)
            if (e.button >= 0 && e.button <= this.buttonsPressed.length) {
                this.buttonsPressed[e.button] = false
                this.buttonsPos[e.button] = undefined
            }
            this.setCursor('default')

            this.elements.forEach(o => o.onMouseUp(e, this.cursor))

            this.paint()
        }

        this.canvas.onmousemove = m => {
            this.setCanvasCursor(m)

            if (this.buttonsPressed[1])
                this.eye = V.add(this.oldEye, V.delta({x:m.clientX, y:m.clientY}, this.diffPoint))

            this.elements.forEach(o => o.onMouseMove(m, this.buttonsPos, this.cursor))

            this.paint()
        }

        this.canvas.onwheel = e => {
            this.zoom(e.deltaY * (-0.0005))
        }

        this.eye.y = -200
        this.eye.x = -200

        this.elements.push(new GroundEditorObject(
            {}, V.vec(1,1)
        ))

        this.select(this.elements[0])

        this.paint()
    }

    snapPos(v: VectorI, type?: 'grid-point' | 'field-corner' | 'field-center') {
        const t = type ? type : 'field-corner'
        let res = V.zero()

        if (t === 'field-center' || t === 'field-corner') 
            res = V.add(V.trunc(v), t === 'field-center' ? V.vec(0.5, -0.5) : V.zero())
        else 
            res = V.trunc(V.mul(V.subToNull(V.trunc(V.mul(v, 2)), V.square(-1)), 1/2))

        return res 
    }

    allElements() { return this.addingType ? [ ...this.elements, this.addingType ] : this.elements }

    fixAddingElement() {
        if (this.addingType) {
            const item = editorTemplates.find(et => et.title === this.addingType![0])!
                .items.find(i => i.name === this.addingType![1])!
            this.elements.push(item.templ(this.snapPos(this.cursor, 'field-corner')))
            this.addingType = undefined
        }
    }

    updateSelected(d: any) {
        this.selectedElement?.setData(d)
        this.paint()
    }

    select(o: EditorObject) {
        if (this.selectedElement && this.selectedElement !== o) this.selectedElement.params.selected = false
        
        if (this.selectedElement === o) {
            this.selectedElement.params.selected = false
            this.selectedElement = undefined
        }
        else {
            this.selectedElement = o
            this.selectedElement.params.selected = true
        }

        editor.setES(this.selectedElement?.getData(), true, false)

        this.paint()
    }

    zoom(s: number, center?: VectorI) {
        const diff = s * this.scaling
        const middle = this.worldCoords({x:this.canvas.width/2, y:this.canvas.height/2})
        this.eye = V.add(this.eye, V.mul(V.mulVec(center ? this.cursor : middle, {x:diff, y:-diff}), this.data.cellSize))
        this.setScaling(diff + this.scaling)
    }

    setScaling(s: number) {
        this.scaling = s
        this.paint()
    }

    getScaling() { return this.scaling }

    worldCoords(v: VectorI) { return V.mulVec(
        V.add(v, this.eye),
        V.mul(V.vec(1/this.scaling, -1/this.scaling), 1/this.data.cellSize)
    ) }

    mcs(v: VectorI) { return V.mul(v, this.data.cellSize) }

    setCanvasCursor(m: MouseEvent) { this.cursor = this.worldCoords({x:m.clientX, y:m.clientY}) }
    setAddingElement(o: [string, string]) { this.addingType = o }

    paint() {
        const g = this.canvas.getContext('2d')!
        g.save()

        g.fillStyle = 'rgb(240, 250, 255)'
        g.fillRect(0,0, this.canvas.width, this.canvas.height)

        if (this.paintGrid) this.paintMarks(g)

        g.translate(-this.eye.x, -this.eye.y)
        g.scale(this.scaling, -this.scaling)

        this.paintAdding(g)
        
        g.fillStyle = 'red'
        g.fillRect(0, 0, 20, 20)
        
        this.elements.forEach(e => e.paint(g))

        g.restore()
    }

    paintAdding(g: CanvasRenderingContext2D) {
        if (this.addingType) {
            g.fillStyle = 'rgba(255, 200, 100, 0.5)'
            const p = this.mcs(this.snapPos(this.cursor, 'field-corner'))
            g.fillRect(p.x, p.y, this.data.cellSize, this.data.cellSize)
            const size = V.square(20)
            const pc = V.addAll([p, this.mcs(V.vec(0.5,-0.5)), V.mulVec(size, V.vec(-0.5,0.5))])
            g.drawImage(image('plus')!, pc.x, pc.y, size.x, size.y)
        }
    }

    paintMarks(g: CanvasRenderingContext2D) {
        const dx = modulo(-this.eye.x, cellSize * this.scaling)
        const dy = modulo(-this.eye.y, cellSize * this.scaling)

        g.strokeStyle = 'rgba(0, 0, 0, 0.3)'
        g.lineWidth = 1
        g.beginPath()

        const line = (p1: VectorI, p2: VectorI) => {
            g.moveTo(p1.x, p1.y)
            g.lineTo(p2.x, p2.y)
        }
        for (let row = dy; row <= this.canvas.height; row += cellSize*this.scaling) {
            line(
                { x: 0, y: row }, 
                { x: this.canvas.width, y: row }
            )
        }
            
        for (let column = dx; column <= this.canvas.width; column += cellSize*this.scaling) {
            line(
                { x: column, y: 0 }, 
                { x: column, y: this.canvas.height }
            )
        }

        g.stroke()
    }
}