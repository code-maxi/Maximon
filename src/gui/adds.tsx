import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Button, ButtonGroup, IconButton, TextField } from "@mui/material";
import { Box } from "@mui/system";
import React from 'react';
import { editorColors, geomShape, VectorI } from '../game/dec';
import { NumericLiteral } from 'typescript';
import { CommandPoint, CommandStyleI } from './editor/gameEditor/objects/command-points';
import { image } from './images';

// Type Declarations

export type directionT = 'top' | 'left' | 'bottom' | 'right'

// GUI-Component-Adds

export interface TabPanelProps {
    children?: React.ReactNode
    index: number
    value: number,
    id?: string
}
  
export function TabPanel(props: TabPanelProps) {
    const { children, value, index } = props;

    return (
        <div className={ 'tabpanel' + (value !== index ? ' hidden' : '') }>
            {children}
        </div>
    );
}

export function def<T extends unknown>(d: T, t?: T): T { return t ? t : d }

export function NumberInput(p: {
    value: number,
    onChange: (n: number) => void,
    width?: number,
    min?: number,
    max?: number
}) {
    const [error, setError] = React.useState(false)
    const [value, setValue] = React.useState(p.value)

    function setVal(v: string) {
        if (
            +v !== NaN &&
            p.min ? +v >= p.min : true &&
            p.max ? +v <= p.max : true
        ) {
            p.onChange(+v)
            setValue(+v)
        }
        else setError(true)
    }

    return <div className="number-input">
        <IconButton onClick={() => { setVal(''+(+value + 1)) }}><AddCircleIcon /></IconButton>
        <TextField 
            value={value}
            variant="outlined" 
            sx={{ width: p.width ? p.width : '50px' }}
            error={error}
            onChange={e => {
                setVal(e.target.value)
            }}
            />
        <IconButton onClick={() => { setVal(''+(+value - 1)) }}><RemoveCircleIcon /></IconButton>
    </div>
}

export function SwitchButtonGroup<T>(p: {
    items: T[]
    selectedItem?: T,
    onChange: (s: T) => void,
    convertText?: (s: T) => string,
    className?: string,
    color?: string
}) {
    return <ButtonGroup variant="outlined" className={p.className}>
        {
            p.items.map(i => 
                <Button 
                    color={ def('primary', p.color) as any } 
                    variant={ i === p.selectedItem ? 'contained' : undefined } 
                    onClick={() => p.onChange(i)} > 
                { p.convertText ? p.convertText(i) : i } </Button>
            )
        }
    </ButtonGroup>
}



// Math-Adds

export function modulo(n1: number, n2: number) {
    let nn = n1
    while (nn < n2) nn += n2
    while (nn > n2) nn -= n2
    return nn
}

// Vector
export const Vec = {
    zero(): VectorI { return {x:0,y:0} },
    mul(a: VectorI, s: number): VectorI { return { x: a.x*s, y: a.y*s } },
    muX(a: VectorI, s: number): VectorI { return { x: a.x*s, y: a.y } },
    muY(a: VectorI, s: number): VectorI { return { x: a.x, y: a.y*s } },
    mulVec(a: VectorI, b: VectorI): VectorI { return { x: a.x*b.x, y: a.y*b.y } },
    divVec(a: VectorI, b: VectorI): VectorI { return { x: a.x/b.x, y: a.y/b.y } },
    delta(a: VectorI, b: VectorI): VectorI { return { x: b.x-a.x, y: b.y-a.y } },
    length(v: VectorI): number { return Math.sqrt(v.x*v.x + v.y*v.y) },
    distance(a: VectorI, b: VectorI) { return this.length(this.delta(a,b)) },
    equals(a: VectorI, b: VectorI) { return a.x === b.x && a.y == b.y },
    add(a: VectorI, b: VectorI): VectorI { return { x: a.x + b.x, y: a.y + b.y } },
    addX(a: VectorI, s: number) { return this.add(a, this.vec(s,0)) },
    addY(a: VectorI, s: number) { return this.add(a, this.vec(0,s)) },
    addAll(v: VectorI[]) {
        let sum = this.zero()
        v.forEach(i => sum = this.add(sum, i))
        return sum
    },
    subToNull(a: VectorI, b: VectorI) {
        return this.add(
            a,
            this.vec(
                a.x > 0 ? -b.x : b.x,
                a.y > 0 ? -b.y : b.y
            )
        )
    },
    half(v: VectorI) { return this.mul(v, 0.5) },
    sub(a: VectorI, b: VectorI): VectorI { return { x: a.x - b.x, y: a.y - b.y } },
    normalRight(v: VectorI): VectorI { return { x: v.y, y: -v.x } },
    e(v: VectorI): VectorI { return this.mul(v, 1/this.length(v)) },
    square(a: number): VectorI { return { x:a,y:a } },
    scalarProduct(a: VectorI, b: VectorI) { return a.x*b.x + a.y*b.y },
    abs(v: VectorI): VectorI { return { x: Math.abs(v.x), y: Math.abs(v.y) } },
    vec(x: number, y: number): VectorI { return { x: x, y: y } },
    trunc(v: VectorI): VectorI { return { x: Math.trunc(v.x), y: Math.trunc(v.y) } },
    negate(a: VectorI): VectorI { return this.mul(a, -1) },
    includesPointInRect(point: VectorI, pos: VectorI, size: VectorI) {
        const pos2 = this.add(pos, size)
        return point.x >= pos.x && point.y >= pos.y && point.x <= pos2.x && point.y <= pos2.y
    },
    pointInShape(
        shape: geomShape, 
        point: VectorI, 
        pos: VectorI, 
        w: number, 
        h?: number
    ) {
        let b = false
        if (shape === 'rect') b = this.includesPointInRect(point, pos, Vec.vec(w, h!))
        if (shape === 'circle') b = Vec.distance(point, pos) < w
        return b
    },
    direction(d: directionT) {
        let res = Vec.zero()
        if (d === 'top') res = Vec.vec(0,-1)
        if (d === 'left') res = Vec.vec(-1,0)
        if (d === 'bottom') res = Vec.vec(0,1)
        if (d === 'right') res = Vec.vec(1,0)
        return res
    },
    copy(v: VectorI, p?: {
        x?: number,
        y?: number
    }) {
        return this.vec(p?.x ? p.x : v.x, p?.y ? p.y : v.y)
    },
    smallestCoord(a: VectorI) { return a.x < a.y ? a.x : a.y },
    toString(a: VectorI) { return '(' + a.x + ' | ' + a.y + ')' },
    intersectRects(r1: {
        pos: VectorI,
        size: VectorI
    }, r2: {
        pos: VectorI,
        size: VectorI
    }) {
        const b1 = r2.pos.y + r2.size.y > r1.pos.y && r2.pos.y < r1.pos.y + r1.size.y
        const b2 = r2.pos.x + r2.size.x > r1.pos.x && r2.pos.x < r1.pos.x + r1.size.x
        return b1 && b2
    }
}

// Array-Adds

export const Arr = {
    equal<T>(a: T[], b?: T[]) { return b && JSON.stringify(a) === JSON.stringify(b) },
    objToArr<T>(o: any): T[] {
        let arr: T[] = []
        for (let key in o) {
            try { arr.push(o[key] as T) }
            catch { console.log('cast-err') }
        }
        return arr
    },
    includesEqual<T>(a: T[], e: T, equal?: (a:T,b:T) => boolean) {
        let b = false
        for (let i = 0; i < a.length; i ++) {
            if ((equal ? equal(a[i], e) : a[i] === e)) {
                b = true
                break;
            }
        }
        return b;
    },
    filterDifferent<T>(a: T[], equal?: (a:T,b:T) => boolean) {
        let res: T[] = []
        for (let i = 0; i < a.length; i ++) {
            if (!this.includesEqual(res, a[i], equal)) res.push(a[i])
        }
        return res
    }
}

export const Num = {
    range(z1: number, n: number, z2: number) { return n < z1 ? z1 : (n > z2 ? z2 : n) },
    modulo(n1: number, n2: number) {
        let nn = n1
        while (nn < n2) nn += n2
        while (nn > n2) nn -= n2
        return nn
    }
}

// Canvas-Adds

export interface TextBorderStyleI {
    textColor?: string,
    backgroundColor?: string,
    padding?: number,
    roundSize?: number,
    font?: {
        size: number,
        style: string
    }
}

export const Creative = {
    paintBordersAround(
        g: CanvasRenderingContext2D,
        pos: VectorI,
        size: VectorI,
        strokeStyle?: string,
        padding?: number,
        cellSize?: (s: number) => number
    ) {
        g.strokeStyle = strokeStyle ? strokeStyle : 'red'
        g.lineWidth = 3
        g.lineCap = 'round'
        g.beginPath()

        const corner = (p1: VectorI, p2: VectorI, p3: VectorI) => {
            const lc = Vec.smallestCoord(size)
            let cs = cellSize ? cellSize(size.x + size.y) : (size.x + size.y)/200 * 10 + 5
            if (cs > lc * 0.4) cs = lc * 0.4
            const padd = padding ? padding : 3
            const p = Vec.add(
                Vec.add(
                    Vec.mulVec(p2, { x:size.x + 2*padd, y:size.y + 2*padd }),
                    { x:-padd, y:-padd }
                ), pos
            )
            const line = (v: VectorI, move: boolean) => {
                if (move) g.moveTo(v.x, v.y)
                else g.lineTo(v.x, v.y)
            }
            line(Vec.add(Vec.mul(p1, cs), p), true)
            line(p, false)
            line(Vec.add(Vec.mul(p3, cs), p), false)
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
    },
    paintRoundedRectangle(
        g: CanvasRenderingContext2D, 
        x: number, y: number, 
        w: number, h: number, 
        r: number
    ) {
        if (w < 2 * r) r = w / 2
        if (h < 2 * r) r = h / 2
        g.beginPath()
        g.moveTo(x+r, y)
        g.arcTo(x+w, y,   x+w, y+h, r)
        g.arcTo(x+w, y+h, x,   y+h, r)
        g.arcTo(x,   y+h, x,   y,   r)
        g.arcTo(x,   y,   x+w, y,   r)
        g.closePath()
    },
    strokeTextBorder(
        g: CanvasRenderingContext2D,
        settings: {
            text: string,
            pos: VectorI,
            align: directionT,
            distance: number
        },
        style: TextBorderStyleI
    ) {
        const defaultStyle = {
            textColor: style.textColor ? style.textColor : 'white',
            backgroundColor: style.backgroundColor ? style.backgroundColor : 'rgba(40,40,40, 0.6)',
            padding: style.padding ? style.padding : 5,
            roundSize: style.roundSize ? style.roundSize : 4,
            font: {
                size: style.font ? style.font.size : 14,
                style: style.font ? style.font.style : 'sans-serif'
            }
        }

        g.lineWidth = 1
        g.textBaseline = 'top'
        g.font = defaultStyle.font.size + 'px ' + defaultStyle.font.style

        const m = g.measureText(settings.text)

        const paddingV = Vec.vec(defaultStyle.padding * 2, defaultStyle.padding)
        const size = Vec.add(
            Vec.vec(m.width, defaultStyle.font.size), 
            Vec.mul(paddingV, 2)
        )

        let shift = Vec.zero()
        
        if (settings.align === 'top') {
            shift = Vec.vec(
                -size.x/2,
                -size.y - settings.distance
            )
        }
        if (settings.align === 'left') {
            shift = Vec.vec(
                -size.x - settings.distance,
                -size.y/2
            )
        }
        if (settings.align === 'bottom') {
            shift = Vec.vec(
                -size.x/2,
                settings.distance
            )
        }
        if (settings.align === 'right') {
            shift = Vec.vec(
                settings.distance,
                -size.y/2
            )
        }

        const boxPos = Vec.add(settings.pos, shift)
        const textPos = Vec.add(boxPos, paddingV)

        g.fillStyle = defaultStyle.backgroundColor
        this.paintRoundedRectangle(
            g, 
            boxPos.x, boxPos.y,
            size.x, size.y,
            defaultStyle.roundSize
        )
        g.fill()
        
        g.fillStyle = defaultStyle.textColor
        g.fillText(settings.text, textPos.x, textPos.y)
    },
    paintShape(g: CanvasRenderingContext2D, p: {
        shape: geomShape,
        pos: VectorI,
        size?: VectorI,
        radius?: number,
        fillColor?: string,
        strokeColor?: string,
        lineWidth?: number,
        roundCorners?: number,
        origin?: VectorI
    }) {
        const o = def(Vec.zero(), p.origin)

        if (p.fillColor) g.fillStyle = p.fillColor
        
        if (p.strokeColor) {
            g.strokeStyle = p.strokeColor
            g.lineWidth = def(2, p.lineWidth)
        }
        
        if (p.shape === 'rect') {
            const pos = Vec.add(p.pos, Vec.mulVec(p.size!, Vec.negate(o)))
            this.paintRoundedRectangle(
                g, 
                pos.x, pos.y, 
                p.size!.x, p.size!.y, 
                def(0, p.roundCorners)
            )
        }
        if (p.shape === 'circle') {
            const pos = Vec.add(p.pos, Vec.mulVec(Vec.square(p.radius!), Vec.negate(o)))
            const pos2 = Vec.add(pos, Vec.mul(Vec.square(p.radius!), 0.5))

            g.beginPath()
            g.arc(pos2.x, pos2.y, p.radius!, 0, Math.PI*2)
        }

        if (p.fillColor) g.fill()
        if (p.strokeColor) g.stroke()
    },
    fillStrokeColor(col: editorColors) {
        let c = ['', '']
        if (col === 'blue') c = ['#b8f1ff', '#00a4ce']
        if (col === 'yellow') c = ['#D6A100', '#FFEF85']
        return c
    },
    paintIconPoint(
        g: CanvasRenderingContext2D,
        style: CommandStyleI, 
        pos: VectorI, 
        radius: number, 
        scaling?: number,
        shadow?: boolean
    ) {
        const color = this.fillStrokeColor(style.color)
        if (shadow) {
            g.shadowBlur = 8
            g.shadowColor = 'rgba(0,0,0,0.5)'
        }
        Creative.paintShape(g, {
            shape: 'circle',
            pos: pos,
            radius: radius,
            strokeColor: color[1],
            fillColor: color[0],
            lineWidth: 2 * def(1, scaling),
            origin: Vec.vec(0.5,0.5)
        })
        if (style.iconKey) {
            const iconSizeF = 0.9
            const imgSize = Vec.mul(Vec.square(radius), iconSizeF)
            const imgPos = Vec.sub(pos, Vec.mul(imgSize, 0.5))
            const imgWidth = imgSize.x
            g.drawImage(image(style.iconKey)!, imgPos.x, imgPos.y, imgWidth, imgWidth)
        }
    }
}