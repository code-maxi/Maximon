import { elementType, GeoActorI, GroundDataI, ScoreDataI, StartEndDataI } from "../../../../game/dec"

export interface EditorObjectParams<T> {
    key: elementType,
    img?: string,
    fix: boolean,
    data: GeoActorI<T>
}

export class EditorObject<T> {
    params: EditorObjectParams<T>
    constructor(
        k: elementType, 
        custom: T,
        w: number,
        h: number,
        x: number,
        y: number,
        img?: string,
    ) {
        this.params = {
            key: k,
            img: img,
            fix: true,
            data: {
                type: k,
                geo: {
                    width: w,
                    height: h,
                    pos: { x:x, y:y }
                },
                custom: custom
            }
        }
    }
    g() { return this.params.data.geo }
    moveTo(v: ex.Vector) {
        this.g().pos.x = v.x
        this.g().pos.y = v.y
    }
    paint(g: CanvasRenderingContext2D) {
        g.fillStyle = this.params.fix ? 'rgb(50, 150, 255)' : 'rgba(50, 150, 255, 0.5)'
        g.fillRect(
            this.g().pos.x, 
            this.g().pos.y, 
            this.g().width, 
            this.g().height
        )
    }
}

export const editorTemplates: {
    name: string,
    templ: (cs: number, x: number, y: number) => void
}[] = [
    {
        name: 'Stern',
        templ: (cs, x, y) => new EditorObject<ScoreDataI>(
            'score', { type: 'star' },
            0.5*cs, 0.5*cs, x, y
        )
    },
    {
        name: 'Münze',
        templ: (cs, x, y) => new EditorObject<ScoreDataI>(
            'score', { type: 'coin' },
            0.5*cs, 0.5*cs, x, y
        )
    },
    {
        name: 'Start',
        templ: (cs, x, y) => new EditorObject<StartEndDataI>(
            'start-end', { type: 'start' },
            0.5*cs, 0.5*cs, x, y
        )
    },
    {
        name: 'Ziel',
        templ: (cs, x, y) => new EditorObject<StartEndDataI>(
            'start-end', { type: 'end' },
            0.5*cs, 0.5*cs, x, y
        )
    },
    {
        name: 'Boden',
        templ: (cs, x, y) => new EditorObject<GroundDataI>(
            'ground', {},
            0.5*cs, 0.5*cs, x, y
        )
    }
]
