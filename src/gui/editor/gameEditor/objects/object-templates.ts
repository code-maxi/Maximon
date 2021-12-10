import { ScoreDataI, StartEndDataI, VectorI } from "../../../../game/dec";
import { EditorObject } from "./object";
import { EditorObjectGeneric } from "./object-generic";
import { GroundEditorObject } from "./things/ground";
import { SawBladeEditorObject } from "./things/saw-blade";

export const editorTemplates: {
    title: string,
    items: {
        name: string,
        templ: (pos: VectorI) => EditorObject
    }[]
}[] = [
    {
        title: 'Punkte Sammeln',
        items: [
            {
                name: 'Stern',
                templ: (pos: VectorI) => new EditorObjectGeneric<ScoreDataI>(
                    'score', { type: 'star' }, pos,
                    1,1
                )
            },
            {
                name: 'Münze',
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
                name: 'Start',
                templ: (pos: VectorI) => new EditorObjectGeneric<StartEndDataI>(
                    'start-end', { type: 'start' }, pos,
                    1,1
                )
            },
            {
                name: 'Ziel',
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
                name: 'Schlichter Boden',
                templ: (pos: VectorI) => new GroundEditorObject(
                    {
                        vertical: false,
                        width: 1,
                        groundType: 'none'
                    }, pos
                )
            },
            {
                name: 'Boden mit Gras',
                templ: (pos: VectorI) => new GroundEditorObject(
                    {
                        vertical: false,
                        width: 1,
                        groundType: 'grass'
                    }, pos
                )
            },
            {
                name: 'Hochgestellter Boden mit Gras',
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
                name: 'Schlichter, vertikaler Boden',
                templ: (pos: VectorI) => new GroundEditorObject(
                    {
                        vertical: true,
                        width: 1,
                        groundType: 'none'
                    }, pos
                )
            },
            {
                name: 'Vereister Boden',
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
                name: 'Hindernis-Boden',
                templ: (pos: VectorI) => new GroundEditorObject(
                    {   
                        vertical: false,
                        width: 1,
                        groundType: 'barrier'
                    }, pos
                )
            },
            {
                name: 'Sägeblatt',
                templ: (pos: VectorI) => new SawBladeEditorObject(
                    {   
                        radius: 0.5
                    }, pos
                )
            }
        ]
    }
]
