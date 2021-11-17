import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { IconButton, TextField } from "@mui/material";
import { Box } from "@mui/system";
import React from 'react';
import { VectorI } from '../game/dec';

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

export function objToArr<T>(o: any): T[] {
    let arr: T[] = []
    for (let key in o) {
        try { arr.push(o[key] as T) }
        catch { console.log('cast-err') }
    }
    return arr
}

export const V = {
    zero(): VectorI { return {x:0,y:0} },
    mul(a: VectorI, s: number): VectorI { return { x: a.x*s, y: a.y*s } },
    mulVec(a: VectorI, b: VectorI): VectorI { return { x: a.x*b.x, y: a.y*b.y } },
    divVec(a: VectorI, b: VectorI): VectorI { return { x: a.x/b.x, y: a.y/b.y } },
    delta(a: VectorI, b: VectorI): VectorI { return { x: b.x-a.x, y: b.y-a.y } },
    length(v: VectorI): number { return Math.sqrt(v.x*v.x + v.y*v.y) },
    distance(a: VectorI, b: VectorI) { return this.length(this.delta(a,b)) },
    equals(a: VectorI, b: VectorI) { return a.x === b.x && a.y == b.y },
    add(a: VectorI, b: VectorI): VectorI { return { x: a.x + b.x, y: a.y + b.y } },
    addAll(v: VectorI[]) {
        let sum = this.zero()
        v.forEach(i => sum = this.add(sum, i))
        return sum
    },
    sub(a: VectorI, b: VectorI): VectorI { return { x: a.x - b.x, y: a.y - b.y } },
    normalRight(v: VectorI): VectorI { return { x: v.y, y: -v.x } },
    e(v: VectorI): VectorI { return this.mul(v, 1/this.length(v)) },
    square(a: number): VectorI { return { x:a,y:a } },
    scalarProduct(a: VectorI, b: VectorI) { return a.x*b.x + a.y*b.y },
    abs(v: VectorI): VectorI { return { x: Math.abs(v.x), y: Math.abs(v.y) } },
    trunc(v: VectorI): VectorI { return { x: Math.trunc(v.x), y: Math.trunc(v.y) } },
    includesPoint(point: VectorI, pos: VectorI, size: VectorI) {
        const pos2 = this.add(pos, size)
        return point.x >= pos.x && point.y >= pos.y && point.x <= pos2.x && point.y <= pos2.y
    }
}

export function modulo(n1: number, n2: number) {
    let nn = n1
    while (nn < n2) nn += n2
    while (nn > n2) nn -= n2
    return nn
}