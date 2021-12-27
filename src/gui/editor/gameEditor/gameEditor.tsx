import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import React from "react";
import { geomShape, SzeneDataOptI, VectorI } from "../../../game/dec";
import { Creative, directionT, modulo, TextBorderStyleI, Vec } from "../../adds";
import { Button, ButtonGroup, IconButton } from '@mui/material';
import { cellSize, editor } from '../editor';
import { image } from '../../images';
import { dataSetPos, EditorObjectI, elementAddButtonTemplates, gameEditorAddStyle, newElementByType } from './objects/element-templates';
import { CommandPoint } from './objects/command-points';
import { SawBladeEditorObject } from './objects/things/saw-blade';
import { registerShortcut } from '../../shortcuts';

interface GameEditorStateI {
    cWidth: number,
    cHeight: number,
    cursor: string
}

interface GameEditorPropsI {
    startData: SzeneDataOptI
}

export interface AddStyleI {
    roundCorners: number,
    width: number,
    height: number,
    addText: string,
    duplicateText: string,
    color: string,
    snapType: string,
    snapCoords?: string,
    scaled?: boolean,
    origin: VectorI,
    shape: geomShape,
    xtremeX?: (g: GameEditorCanvas) => [number, number],
    xtremeY?: (g: GameEditorCanvas) => [number, number]
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
    componentDidUpdate() {
        this.gameCanvas?.paint()
    }
}

export interface EditorTooltipI {
    text: string,
    style: TextBorderStyleI
}

export class GameEditorCanvas {
    canvas: HTMLCanvasElement

    private cursor: VectorI = {x:0,y:0}
    private screenCursor: VectorI = {x:0,y:0}
    private eye: VectorI = {x:0,y:0}
    private scaling = 1
    private oldEye = this.eye
    private diffPoint: VectorI = {x:0, y:0}

    private addingObject: {
        addPath?: [string, string],
        addingStyle: AddStyleI,
        pos: VectorI,
        duplicateObjectData?: any
    } | undefined

    private selectedElement: EditorObjectI | undefined

    private elements: EditorObjectI[] = []
    private buttonsPressed: boolean[] = [false, false, false]
    private buttonsPos: (VectorI | undefined)[] = [undefined, undefined, undefined]

    private data: SzeneDataOptI

    setCursor: (c: string) => void

    paintGrid = true
    
    toolTips: {
        top?: EditorTooltipI,
        left?: EditorTooltipI,
        right?: EditorTooltipI,
        bottom?: EditorTooltipI, 
    } = {}

    sortedElements() {
        return this.elements.sort((a, b) => b.params.zIndex - a.params.zIndex)
    }
    
    constructor(gc: HTMLCanvasElement, data: SzeneDataOptI, sc: (c: string) => void) {
        this.data = data
        this.canvas = gc
        this.setCursor = sc

        gameCanvas = this

        const elementsMouseEvent = (f: (e: EditorObjectI) => void) => {
            const sorted = this.sortedElements()
            const viewPos = this.worldCoords(Vec.vec(0,0))
            const viewSize = Vec.delta(viewPos, this.worldCoords(Vec.vec(this.canvas.width, this.canvas.height)))
            let resFound = false
            for (let i = 0; i < sorted.length; i ++) {
                const item = sorted[i]
                const inView = item.isInView(viewPos, viewSize)
                if (!resFound && item.includesPoint(this.cursor)) {
                    item.setHovered(true)
                    resFound = true
                } else item.setHovered(false)
                if (inView) f(item)
            }
        }

        this.canvas.onmousedown = evt => {
            this.setCanvasCursor(evt)

            if (evt.button >= 0 && evt.button <= this.buttonsPressed.length) {
                this.buttonsPressed[evt.button] = true
                this.buttonsPos[evt.button] = this.cursor
            }

            if (this.buttonsPressed[1]) {
                this.diffPoint = {x:evt.clientX, y:evt.clientY}
                this.oldEye = this.eye
                this.setCursor('move')
            }

            elementsMouseEvent(o => o.onMouseDown(evt, this.cursor))

            if (this.buttonsPressed[0]) {
                if (this.addingObject) {
                    this.fixAddingElement()
                    editor.setAddingType()
                }
            }
            
            this.paint()
        }

        this.canvas.onmouseup = evt => {
            this.setCanvasCursor(evt)
            if (evt.button >= 0 && evt.button <= this.buttonsPressed.length) {
                this.buttonsPressed[evt.button] = false
                this.buttonsPos[evt.button] = undefined
            }
            this.setCursor('default')

            elementsMouseEvent(o => o.onMouseUp(evt, this.cursor))

            this.paint()
        }

        this.canvas.onmousemove = evt => {
            this.setCanvasCursor(evt)

            if (this.buttonsPressed[1])
                this.eye = Vec.add(this.oldEye, Vec.delta({x:evt.clientX, y:evt.clientY}, this.diffPoint))

            if (this.addingObject) this.setAddingObjectPos()

            this.toolTips.top = undefined
            this.toolTips.right = undefined

            elementsMouseEvent(o => o.onMouseMove(evt, this.buttonsPos, this.cursor))

            this.paint()
        }

        registerShortcut('d', { shiftDown: true }, () => {
            this.duplicateSelected()
            this.paint()
        })
        registerShortcut('Escape', {}, () => {
            this.cancelAdding()
            this.paint()
        })
        registerShortcut('Delete', {}, () => {
            this.removeSelected()
            this.paint()
        })

        this.canvas.onwheel = e => {
            this.zoom(e.deltaY * (-0.0005))
        }

        this.eye.y = -200
        this.eye.x = -200

        /*this.elements.push(new GroundEditorObject(
            { vertical: true, groundType: 'grass', width: 3 }, V.vec(1,1)
        ))*/
        this.elements.push(new SawBladeEditorObject(
            {
                type: 'saw-blade',
                custom: {
                    radius: 0.5
                },
                geo: {
                    pos: Vec.vec(1,1),
                    width: 1,
                    height: 1
                }
            }
        ))
        /*this.elements.push(new CommandPoint({
            command: '/jumper/set-speechbuble',
            time: 4,
            custom: {
                text: 'Hello, world!'
            }
        }, V.vec(4, 5)))*/

        this.select(this.elements[0])

        this.paint()
    }

    cellSize() {
        return this.data.cellSize
    }

    setTooltip(d: directionT, tooltip?: EditorTooltipI) {
        this.toolTips[d] = tooltip
    }
    clearTooltips() {
        // cleat all tooltips
        this.setTooltip('top')
        this.setTooltip('left')
        this.setTooltip('bottom')
        this.setTooltip('right')
    }

    updateSettings(s: SzeneDataOptI) {
        if (this.data.height !== s.height) {
            this.eye.y += (s.height - this.data.height)
            this.elements.forEach(e => {
                e.shiftPos(s.height - this.data.height)
            })
        }
        this.data = s
        this.paint()
    }

    snapPos(v: VectorI, type?: 'grid-point' | 'field-corner' | 'field-center', coords?: string) {
        const t = type ? type : 'field-corner'
        let res = Vec.zero()

        if (t === 'field-center' || t === 'field-corner') res = Vec.add(
            Vec.trunc(v),
            t === 'field-center' ? Vec.vec(0.5, 0.5) : Vec.zero()
        )
        else res = Vec.trunc(
            Vec.mul(
                Vec.subToNull(
                    Vec.trunc(Vec.mul(v, 2)), 
                    Vec.square(-1)
                ),
                1/2
            )
        )

        if (coords) {
            const x = coords.includes('x')
            const y = coords.includes('y')
            res = Vec.vec(x ? res.x : v.x, y ? res.y : v.y)
        }        

        return res 
    }

    allElements() { return this.addingObject ? [ ...this.elements, this.addingObject ] : this.elements }

    fixAddingElement() {
        if (this.addingObject) {
            let item: EditorObjectI | undefined = undefined

            if (this.addingObject.duplicateObjectData) {
                item = newElementByType(dataSetPos(
                    JSON.parse(JSON.stringify(this.addingObject.duplicateObjectData)),
                    this.addingObject.pos
                ))
            }
            else if (this.addingObject.addPath) {
                item = elementAddButtonTemplates
                    .find(et => et.titleId === this.addingObject!.addPath![0])!
                    .items.find(ea => ea.itemId === this.addingObject!.addPath![1])!
                    .templ(this.addingObject.pos)
            }

            if (item) {
                this.elements.push(item)

                this.addingObject = undefined
                this.setTooltip('bottom')
            } else throw 'Item is undefined. (during adding element)'
        }
    }

    updateSelected(d: any) {
        this.selectedElement?.setData(d, true)
        this.paint()
    }

    select(o: EditorObjectI) {
        if (this.selectedElement && this.selectedElement !== o) {
            this.selectedElement.params.selected = false
            this.selectedElement.onSelect(false)
        }
        
        if (this.selectedElement === o) {
            this.selectedElement.params.selected = false
            this.selectedElement.onSelect(false)
            this.selectedElement = undefined
        }
        else {
            this.selectedElement = o
            this.selectedElement.params.selected = true
            this.selectedElement.onSelect(true)
        }

        editor.setES(this.selectedElement?.getData(), true, false)

        this.paint()
    }

    removeSelected() {
        if (this.selectedElement) {
            const se = this.selectedElement
            if (se.params.selected) this.select(se)
            this.elements = this.elements.filter(el => el !== se)
        }
    }
    duplicateSelected() {
        if (this.selectedElement) {
            this.addingObject = {
                addingStyle: gameEditorAddStyle(
                    undefined,
                    this.selectedElement.getData()
                ),
                duplicateObjectData: this.selectedElement.getData(),
                pos: Vec.zero()
            }
    
            this.setTooltip('bottom', {
                text: this.addingObject!.addingStyle.duplicateText,
                style: {
                    backgroundColor: 'rgba(230, 230, 50, 0.5)',
                    textColor: 'black'
                }
            })
        }
    }
    cancelAdding() {
        if (this.addingObject) {
            this.addingObject = undefined
            this.setTooltip('bottom')
        }
    }

    zoom(s: number, center?: VectorI) {
        const diff = s * this.scaling
        const middle = this.worldCoords({x:this.canvas.width/2, y:this.canvas.height/2})
        this.eye = Vec.add(this.eye, Vec.mul(Vec.mulVec(center ? this.cursor : middle, this.dVec(diff)), this.data.cellSize))
        this.setScaling(diff + this.scaling)
    }

    setScaling(s: number) {
        this.scaling = s
        this.paint()
    }

    getScaling() { return this.scaling }

    worldCoords(v: VectorI) { 
        return Vec.mulVec(
            Vec.add(v, this.eye),
            this.dVec(1/this.data.cellSize/this.scaling)
        ) 
    }
    screenCoords(v: VectorI) {
        return Vec.sub(Vec.divVec(v, this.dVec(1/this.data.cellSize/this.scaling)), this.eye)
    }

    mcs(v: VectorI) { return Vec.mul(v, this.data.cellSize) }

    setCanvasCursor(m: MouseEvent) {
        this.screenCursor = Vec.vec(m.clientX, m.clientY)
        this.cursor = this.worldCoords(this.screenCursor)
    }

    setAddingElement(o?: string) {
        if (o) {
            const o2 = o.split('/') as [string,string]

            this.addingObject = {
                addPath: o2,
                addingStyle: gameEditorAddStyle(o2),
                pos: Vec.zero()
            }
        } else this.addingObject = undefined

        this.setTooltip('bottom', o ? {
            text: this.addingObject!.addingStyle.addText,
            style: {
                backgroundColor: 'rgba(230, 230, 50, 0.5)',
                textColor: 'black'
            }
        } : undefined)
    }

    setAddingObjectPos() {
        if (this.addingObject) {
            const s = this.addingObject.addingStyle
            this.addingObject.pos = s.snapType ? this.snapPos(this.cursor, s.snapType as any, s.snapCoords) : this.cursor

            if (s.xtremeX) {
                const xtreme = s.xtremeX(this)
                if (this.addingObject.pos.x < xtreme[0]) this.addingObject.pos.x = xtreme[0]
                if (this.addingObject.pos.x > xtreme[1]) this.addingObject.pos.x = xtreme[1] 
            }
            if (s.xtremeY) {
                const xtreme = s.xtremeY(this)
                if (this.addingObject.pos.y < xtreme[0]) this.addingObject.pos.y = xtreme[0]
                if (this.addingObject.pos.y > xtreme[1]) this.addingObject.pos.y = xtreme[1] 
            }
        }
    }

    dVec(s?: number) { return Vec.mul(Vec.vec(1,1), s ? s : 1) }

    paint() {
        const g = this.canvas.getContext('2d')!

        g.fillStyle = 'rgb(240, 250, 255)'
        g.fillRect(0,0, this.canvas.width, this.canvas.height)

        if (this.paintGrid) this.paintMarks(g)

        g.save()
        g.translate(-this.eye.x, -this.eye.y)
        g.scale(this.scaling, this.scaling)

        this.elements.filter(e => !(e instanceof CommandPoint)).forEach(e => e.paint(g))
        this.paintBorder(g)        

        g.restore()

        CommandPoint.paintCommandPointRange(g)
        this.elements.filter(e => (e instanceof CommandPoint)).forEach(e => e.paint(g))

        this.paintAdding(g)

        this.paintTooltips(g)
    }

    inRange(vec: VectorI) {
        let v = vec
        if (v.x < 0) v.x = 0
        if (v.y < 0) v.y = 0
        if (v.y > this.data.height) v.y = this.data.height
        return v
    }

    paintTooltips(g: CanvasRenderingContext2D) {
        const pt = (o: directionT) => {
            const item = this.toolTips[o]
            if (item) {
                Creative.strokeTextBorder(g, {
                    text: item.text,
                    pos: this.screenCursor,
                    align: o,
                    distance: (o === 'bottom' ? 14 : 4) * this.scaling
                }, item.style)
            }
        }
        pt('top')
        pt('left')
        pt('right')
        pt('bottom')
    }

    paintBorder(g: CanvasRenderingContext2D) {
        const zeroScreen = this.mcs(this.worldCoords(Vec.zero()))
        const zeroWorld = Vec.zero()
        const leftBottom = this.mcs(Vec.vec(0, this.data.height))
        const xend = this.mcs(this.worldCoords(Vec.vec(this.canvas.width, 0))).x
        const yend = this.mcs(this.worldCoords(Vec.vec(0, this.canvas.height))).y

        g.fillStyle = 'white'
        const drawLine = (p1: VectorI, p2: VectorI) => {
            g.strokeStyle = 'red'
            g.lineWidth = 3
            g.beginPath()
            g.moveTo(p1.x, p1.y)
            g.lineTo(p2.x, p2.y)
            g.stroke()
        }
        if (zeroScreen.y < 0) {
            const diff = Math.abs(zeroScreen.y)
            g.fillRect(
                zeroScreen.x, 
                zeroScreen.y, 
                xend - zeroScreen.x,
                diff
            )
            drawLine(zeroWorld, Vec.vec(xend, zeroWorld.y))
        }

        if (zeroScreen.x < 0) {
            const diff = Math.abs(zeroScreen.x)
            g.fillRect(
                zeroScreen.x, 
                zeroScreen.y, 
                diff,
                yend - zeroScreen.y
            )
            drawLine(zeroWorld, Vec.vec(zeroWorld.x, leftBottom.y))
        }

        if (yend > leftBottom.y) {
            const diff = Math.abs(leftBottom.y - yend)
            g.fillRect(
                zeroScreen.x, 
                leftBottom.y, 
                xend - zeroScreen.x,
                diff
            )
            drawLine(
                Vec.vec(zeroWorld.x, leftBottom.y), 
                Vec.vec(xend - zeroScreen.x, leftBottom.y)
            )
        }
    }

    paintAdding(g: CanvasRenderingContext2D) {
        if (this.addingObject) {
            const st = this.addingObject.addingStyle
            const sc = st.scaled === true ? this.scaling : 1

            const size = this.mcs(Vec.vec(st.width * sc, st.height * sc))
            const p = this.screenCoords(this.addingObject.pos)

            Creative.paintShape(g, {
                shape: st.shape,
                pos: p,
                size: size,
                radius: size.x/2,
                fillColor: st.color,
                roundCorners: st.roundCorners,
                origin: st.origin
            })

            const imgSize = Vec.square(20 * sc)
            let pc = Vec.add(p, Vec.mul(imgSize, -0.5))
            g.drawImage(image(this.addingObject.duplicateObjectData ? 'duplicate' : 'plus')!, pc.x, pc.y, imgSize.x, imgSize.y)
        }
    }



    paintMarks(g: CanvasRenderingContext2D) {
        const dx = modulo(-this.eye.x, cellSize * this.scaling)
        const dy = modulo(-this.eye.y, cellSize * this.scaling)

        g.strokeStyle = 'rgba(0, 0, 0, 0.3)'
        g.lineWidth = this.scaling < 1/5 ? 0.3 : 0.7
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