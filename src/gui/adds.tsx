import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { IconButton, TextField } from "@mui/material";
import { Box } from "@mui/system";
import React from 'react';

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