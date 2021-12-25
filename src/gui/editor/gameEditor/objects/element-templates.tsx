import { elementType, GeoActorI, GroundDataI, groundTypeI, ScoreDataI, StartEndDataI, textGroundType, VectorI } from "../../../../game/dec"
import { SwitchButtonGroup, Vec } from "../../../adds"
import { AddStyleI, GameEditorCanvas } from "../gameEditor"
import { CommandPoint } from "./command-points"
import { ControlPointI } from "./control-points"
import { Collapse, ListItem, ListItemText } from "@mui/material";
import React from "react";
import { GroundEditorObject } from "./things/ground"
import { SawBladeEditorObject } from "./things/saw-blade"
import { EditorObjectGeneric } from "./element-generic"

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
        active: false,
        pos: Vec.zero()
    }
}

export function gameEditorAddStyle(addingType: [string, string], gec: GameEditorCanvas) {
    let res: AddStyleI = {
        roundCorners: 5,
        width: 1,
        height: 1,
        text: 'Klicken, um hinzuzufügen.',
        color: 'rgba(255, 200, 100, 0.5)',
        iconKey: 'plus',
        origin: Vec.vec(0,0),
        snapType: 'field-corner',
        shape: 'rect',
        scaled: true
    }
    if (addingType[0] === 'Zeit-Event') {
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
    if (addingType[1] === 'Sägeblatt') {
        res = {
            ...res,
            origin: Vec.square(0.5),
            shape: 'circle',
            snapType: 'grid-point'
        }
    }
    return res
}

export interface EditorElementTemplateI<D> { // D = Data-Type
    type: elementType,
    SettingsGUI: (p: {item: D, onChange: (cd: D) => void}) => React.ReactElement | undefined
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

export const elementAddButtonTemplates: {
    title: string,
    items: {
        buttonText: string,
        templ: (pos: VectorI) => EditorObjectI
    }[]
}[] = [
    {
        title: 'Punkte Sammeln',
        items: [
            {
                buttonText: 'Stern',
                templ: (pos: VectorI) => new EditorObjectGeneric<ScoreDataI>(
                    'score', { type: 'star' }, pos,
                    1,1
                )
            },
            {
                buttonText: 'Münze',
                templ: (pos: VectorI) => new EditorObjectGeneric<ScoreDataI>(
                    'score', { type: 'coin' }, pos,
                    1,1
                )
            },
        ]
    },
    {
        title: 'Start und Ziel',
        items: [
            {
                buttonText: 'Start',
                templ: (pos: VectorI) => new EditorObjectGeneric<StartEndDataI>(
                    'start-end', { type: 'start' }, pos,
                    1,1
                )
            },
            {
                buttonText: 'Ziel',
                templ: (pos: VectorI) => new EditorObjectGeneric<StartEndDataI>(
                    'start-end', { type: 'end' }, pos,
                    1,1
                )
            },
        ]
    },
    {
        title: 'Böden',
        items: [
            {
                buttonText: 'Schlichter Boden',
                templ: (pos: VectorI) => new GroundEditorObject(
                    {
                        vertical: false,
                        width: 1,
                        groundType: 'none'
                    }, pos
                )
            },
            {
                buttonText: 'Boden mit Gras',
                templ: (pos: VectorI) => new GroundEditorObject(
                    {
                        vertical: false,
                        width: 1,
                        groundType: 'grass'
                    }, pos
                )
            },
            {
                buttonText: 'Hochgestellter Boden mit Gras',
                templ: (pos: VectorI) => new GroundEditorObject(
                    {
                        vertical: false,
                        width: 1,
                        groundType: 'grass',
                        elevated: 't'
                    }, pos
                )
            },
            {
                buttonText: 'Schlichter, vertikaler Boden',
                templ: (pos: VectorI) => new GroundEditorObject(
                    {
                        vertical: true,
                        width: 1,
                        groundType: 'none'
                    }, pos
                )
            },
            {
                buttonText: 'Vereister Boden',
                templ: (pos: VectorI) => new GroundEditorObject(
                    {   
                        vertical: false,
                        width: 1,
                        groundType: 'ice'
                    }, pos
                )
            }
        ]
    },
    {
        title: 'Hindernisse',
        items: [
            {
                buttonText: 'Hindernis-Boden',
                templ: (pos: VectorI) => new GroundEditorObject(
                    {   
                        vertical: false,
                        width: 1,
                        groundType: 'barrier'
                    }, pos
                )
            },
            {
                buttonText: 'Sägeblatt',
                templ: (pos: VectorI) => new SawBladeEditorObject(
                    {   
                        radius: 0.5
                    }, pos
                )
            }
        ]
    },
    {
        title: 'Command-Points',
        items: [
            {
                buttonText: 'Sprechblase',
                templ: (pos: VectorI) => new CommandPoint(
                    {
                        command: '/jumper/set-speechbuble',
                        time: 4,
                        custom: {
                            text: 'Hello, world!'
                        }
                    }, pos
                )
            }
        ]
    }
]