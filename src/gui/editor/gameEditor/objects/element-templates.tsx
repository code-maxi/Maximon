import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { elementType, GeoActorI, GroundDataI, groundTypeI, ScoreDataI, textGroundType, VectorI } from "../../../../game/dec"
import { SwitchButtonGroup, Vec } from "../../../adds"
import { AddStyleI, gameCanvas } from "../gameEditor"
import { CommandPoint } from "./command-points"
import { ControlPointI } from "./control-points"
import { Collapse, Divider, IconButton, List, ListItem, ListItemText } from "@mui/material";
import React from "react";
import { GroundEditorObject } from "./things/ground"
import { SawBladeEditorObject } from "./things/saw-blade"
import { EditorElementGeneric } from "./element-generic"
import FileCopyIcon from '@mui/icons-material/FileCopy';

export interface EditorObjectParamsI {
    key: elementType,
    img?: string,
    selected: boolean,
    zIndex: number
}

export interface EditorObjectI {
    params: EditorObjectParamsI
    getData(): any
    setData(d: any, fromGUI?: boolean): void
    paint(g: CanvasRenderingContext2D): void
    includesPoint(v: VectorI): boolean
    onMouseDown(evt: MouseEvent, mousePos: VectorI): void
    onMouseMove(evt: MouseEvent, buttonPos: (VectorI|undefined)[], mousePos: VectorI): void
    onMouseUp(evt: MouseEvent, mousePos: VectorI): void
    onSelect(b: boolean): void
    shiftPos(s: number): void
    setHovered(b: boolean): void
    isInView(pos: VectorI, size: VectorI): boolean
}

export function moveCPTemplate(p: {
    key: string, 
    tooltipText: string, 
    lockedAxis?: 'x' | 'y',
    snap?: boolean,
    lazy?: number
}): ControlPointI {
    return {
        key: p.key,
        parentKey: 'move body',
        shape: 'circle',
        snap: p.snap,
        lockedAxis: p.lockedAxis,
        lazy: p.lazy,
        size: 12,
        zIndex: 10,
        hoverTooltip: {
            align: 'top',
            tooltip: () => ({
                text: p.tooltipText,
                style: {
                    backgroundColor: 'rgba(255, 230, 0, 0.5)',
                    textColor: 'black'
                }
            })
        },
        paint: {
            fillColor: 'yellow',
            strokeColor: 'red',
            size: 6
        },
        active: true,
        pos: Vec.zero()
    }
}

export interface EditorElementTemplateI<D> { // D = Data-Type
    type: elementType,
    SettingsGUI: (p: {item: D, onChange: (cd: D) => void}) => React.ReactElement | undefined
}

export function AbstractElementSettings(p: {
    onESUpdate: (e: any) => void
    item: any
}) {
    return <List>
        <ListItem secondaryAction={
            <IconButton color="error" onClick={ () => gameCanvas.removeSelected() }><DeleteRoundedIcon /></IconButton>
        }>
            <ListItemText>Element entfernen (Enf)</ListItemText>
        </ListItem>

        <ListItem secondaryAction={
            <IconButton color="primary" onClick={ () => gameCanvas.duplicateSelected() }><FileCopyIcon /></IconButton>
        }>
            <ListItemText>Element duplizieren (Shift+D)</ListItemText>
        </ListItem>

        <Divider style={{ margin: '10px 15px' }} />
        
        { p.item !== undefined ? elementSettingTemplates.find(t => t.type === p.item.type)!.SettingsGUI({
            item: p.item,
            onChange: p.onESUpdate
        }) : '' }
    </List>
}

export const elementSettingTemplates: EditorElementTemplateI<any>[] = [
    {
        type: 'ground',
        SettingsGUI: (p: {
            item: GeoActorI<GroundDataI>,
            onChange: (cd: GeoActorI<GroundDataI>) => void
        }) => {
            const [gType, setGType] = React.useState<groundTypeI>(p.item.custom.groundType)
            const [vertical, setVertical] = React.useState(p.item.custom.vertical)
            const [elevated, setElevated] = React.useState(p.item.custom.elevated)
            
            return <React.Fragment>
                <ListItem secondaryAction={
                    <SwitchButtonGroup 
                        items={['none', 'grass', 'barrier', 'ice']}
                        selectedItem={gType}
                        onChange={g => {
                            setGType(g as groundTypeI)
                            p.onChange({
                                ...p.item,
                                custom: {
                                    ...p.item.custom,
                                    groundType: g as groundTypeI
                                }
                            })
                        }}
                        convertText={t => textGroundType(t as groundTypeI)}
                    />
                }>
                    <ListItemText>Bodentype</ListItemText>
                </ListItem>
                <ListItem secondaryAction={
                    <SwitchButtonGroup 
                        items={[true, false]}
                        selectedItem={vertical}
                        onChange={b => {
                            p.onChange({
                                ...p.item,
                                custom: {
                                    ...p.item.custom,
                                    vertical: b
                                }
                            })
                            setVertical(!vertical)
                        }}
                        convertText={b => b ? 'Vertikal' : 'Horizontal'}
                        color="success"
                    />
                }>
                    <ListItemText>Richtung</ListItemText>
                </ListItem>
                <Collapse in={!vertical}>
                    <ListItem secondaryAction={
                        <SwitchButtonGroup
                            items={[undefined, 't', 'b']}
                            selectedItem={elevated}
                            onChange={ s => {
                                p.onChange({
                                    ...p.item,
                                    custom: {
                                        ...p.item.custom,
                                        elevated: s as ('t' | 'b' | undefined)
                                    }
                                })
                                setElevated(s as ('t' | 'b' | undefined))
                            } }
                            convertText={s => s ? (s === 't' ? 'Oben' : 'Unten') : 'Kein'}
                            color="success"
                        />
                    }>
                        <ListItemText>Hochgestellt</ListItemText>
                    </ListItem>
                </Collapse>
            </React.Fragment>
        }
    },
    {
        type: 'saw-blade',
        SettingsGUI: () => undefined,
    },
    {
        type: 'command',
        SettingsGUI: () => undefined,
    }
]

export function dataSetPos(p: any, pos: VectorI) {
    return {
        ...p,
        geo: {
            ...p.geo,
            pos: pos
        }
    }
}

export const elementAddButtonTemplates: {
    titleText: string,
    titleId: string,
    items: {
        buttonText: string,
        itemId: string,
        templ: (pos: VectorI, data?: any) => EditorObjectI
    }[]
}[] = [
    {
        titleText: 'Punkte Sammeln',
        titleId: 'score',
        items: [
            {
                buttonText: 'Stern',
                itemId: 'star',
                templ: (pos: VectorI, data?: any) => new EditorElementGeneric<ScoreDataI>(
                    data ? dataSetPos(data, pos) : {
                        type: 'score',
                        custom: {
                            type: 'star'
                        },
                        geo: {
                            pos: pos,
                            width: 1,
                            height: 1
                        }
                    }
                )
            },
            {
                buttonText: 'Münze',
                itemId: 'coin',
                templ: (pos: VectorI, data?: any) => new EditorElementGeneric<ScoreDataI>(
                    data ? dataSetPos(data, pos) : {
                        type: 'score',
                        custom: {
                            type: 'coin'
                        },
                        geo: {
                            pos: pos,
                            width: 1,
                            height: 1
                        }
                    }
                )
            },
        ]
    },
    /*{
        title: 'Start und Ziel',
        items: [
            {
                buttonText: 'Start',
                templ: (pos: VectorI, data?: any) => new EditorElementGeneric<StartEndDataI>(
                    !data ? {
                        key: 'start-end',
                        custom: {
                            type: 'star'
                        },
                        pos: pos,
                        w: 1,
                        h: 1
                    }: undefined, 
                    data ? data : undefined
                )
            },
            {
                buttonText: 'Ziel',
                templ: (pos: VectorI) => new EditorElementGeneric<StartEndDataI>(
                    'start-end', { type: 'end' }, pos,
                    1,1
                )
            },
        ]
    },*/
    {
        titleText: 'Böden',
        titleId: 'grounds',
        items: [
            {
                buttonText: 'Schlichter Boden',
                itemId: 'simple-ground',
                
                templ: (pos: VectorI, data?: any) => new GroundEditorObject(
                    data ? dataSetPos(data, pos) : {
                        type: 'ground',
                        custom: {
                            vertical: false,
                            width: 1,
                            groundType: 'none'
                        },
                        geo: {
                            pos: pos,
                            width: 1,
                            height: 1
                        }
                    }
                )
            },
            {
                buttonText: 'Boden mit Gras',
                itemId: 'ground-with-grass',
                templ: (pos: VectorI, data?: any) => new GroundEditorObject(
                    data ? dataSetPos(data, pos) : {
                        type: 'ground',
                        custom: {
                            vertical: false,
                            width: 1,
                            groundType: 'grass'
                        },
                        geo: {
                            pos: pos,
                            width: 1,
                            height: 1
                        }
                    }
                )
            },
            {
                buttonText: 'Hochgestellter Boden mit Gras',
                itemId: 'elevated-ground',
                templ: (pos: VectorI, data?: any) => new GroundEditorObject(
                    data ? dataSetPos(data, pos) : {
                        type: 'ground',
                        custom: {
                            vertical: false,
                            width: 1,
                            groundType: 'grass',
                            elevated: 't'
                        },
                        geo: {
                            pos: pos,
                            width: 1,
                            height: 1
                        }
                    }
                )
            },
            {
                buttonText: 'Schlichter, vertikaler Boden',
                itemId: 'vertical ground',
                templ: (pos: VectorI, data?: any) => new GroundEditorObject(
                    data ? dataSetPos(data, pos) : {
                        type: 'ground',
                        custom: {
                            vertical: true,
                            width: 1,
                            groundType: 'none'
                        },
                        geo: {
                            pos: pos,
                            width: 1,
                            height: 1
                        }
                    }
                )
            },
            {
                buttonText: 'Vereister Boden',
                itemId: 'frosted-ground',
                templ: (pos: VectorI, data?: any) => new GroundEditorObject(
                    data ? dataSetPos(data, pos) : {
                        type: 'ground',
                        custom: {
                            vertical: false,
                            width: 1,
                            groundType: 'ice'
                        },
                        geo: {
                            pos: pos,
                            width: 1,
                            height: 1
                        }
                    }
                )
            }
        ]
    },
    {
        titleText: 'Hindernisse',
        titleId: 'barriers',
        items: [
            {
                buttonText: 'Hindernis-Boden',
                itemId: 'barrier-ground',
                templ: (pos: VectorI, data?: any) => new GroundEditorObject(
                    data ? dataSetPos(data, pos) : {
                        type: 'ground',
                        custom: {
                            vertical: false,
                            width: 1,
                            groundType: 'barrier'
                        },
                        geo: {
                            pos: pos,
                            w: 1,
                            h: 1
                        }
                    }
                )
            },
            {
                buttonText: 'Sägeblatt',
                itemId: 'saw-blade',
                templ: (pos: VectorI, data?: any) => new SawBladeEditorObject(
                    data ? dataSetPos(data, pos) : {
                        type: 'saw-blade',
                        custom: {
                            radius: 0.5
                        },
                        geo: {
                            pos: pos,
                            width: 1,
                            height: 1
                        }
                    }
                )
            }
        ]
    },
    {
        titleText: 'Command-Points',
        titleId: 'command-points',
        items: [
            {
                buttonText: 'Sprechblase',
                itemId: 'speech-buble',
                templ: (pos: VectorI, data?: any) => new CommandPoint(
                    {
                        d: {
                            command: '/jumper/set-speechbuble',
                            time: 4,
                            custom: {
                                text: 'Hello, world!'
                            }
                        },
                        pos: pos
                    }
                )
            }
        ]
    }
]

export function gameEditorAddStyle(addPath?: [string, string], dupData?: any) {
    const titleId = addPath ? addPath[0] : undefined
    const itemId = addPath ? addPath[1] : undefined
    const type = dupData ? dupData.type : undefined

    let res: AddStyleI = {
        roundCorners: 5,
        addText: 'Klicken, um hinzuzufügen.',
        duplicateText: 'Klicken, um zu duplizieren.',
        color: 'rgba(255, 200, 100, 0.5)',
        origin: Vec.vec(0,0),
        snapType: 'field-corner',
        width: 1,
        height: 1,
        shape: 'rect',
        scaled: true
    }
    
    if (type === 'command' || titleId === 'command-points') {
        res = {
            ...res,
            scaled: false,
            origin: Vec.square(0.5),
            shape: 'circle',
            color: 'rgba(50, 200, 255, 0.4)',
            snapType: 'grid-point',
            snapCoords: 'x',
            xtremeY: (g) => CommandPoint.commandPointRange().map(i => g.worldCoords(Vec.vec(0, i)).y) as [number, number]
        }
    }
    if (type === 'saw-blade' || itemId === 'saw-blade') {
        res = {
            ...res,
            origin: Vec.square(0.5),
            shape: 'circle',
            snapType: 'grid-point'
        }
    }
    
    res = {
        ...res,
        width: dupData ? dupData.geo.width : res.width,
        height: dupData ? dupData.geo.height : res.height
    }
    return res
}

export function newElementByType(data: any): EditorObjectI {
    const type = data.type as elementType
    if (type === 'ground')         return new GroundEditorObject(data)
    else if (type === 'saw-blade') return new SawBladeEditorObject(data)
    else if (type === 'score' || type === 'start-end') return new EditorElementGeneric(data)
    else if (type === 'command') return new CommandPoint(undefined, data)
    else throw 'Can\'t identify type'
}