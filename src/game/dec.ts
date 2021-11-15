export type elementType = 'start-end' | 'ground' | 'score'

export interface VectorI {
    x: number
    y: number
}

export function fullElementName(t: elementType) {
    let i = '[ERROR]'
    if (t === 'start-end') i = 'Spiel Start/Ende'
    if (t === 'ground') i = 'Boden'
    return i
}

export interface BoxI {
    x: number
    y: number
    w: number
    h: number
}

export interface GameActorI<T> {
    type: string
    custom: T
}

export interface GeoActorI<T> extends GameActorI<T> {
    geo: GeoDataI
}

export interface GeoDataI {
    width: number,
    height: number,
    pos: VectorI
}

export interface GroundDataI {
    speechBuble?: string,
    dangerousEdges?: {
        top: boolean,
        left: boolean,
        bottom: boolean, 
        right: boolean
    }
}

export interface StartEndDataI {
    type: 'start' | 'end'
}
export interface ScoreDataI {
    type: 'coin' | 'star'
}

export interface DebugOptI {
    debug: boolean,
    showGrid: boolean
}

export interface SzeneDataOptI {
    name: string,
    difficulty: number,
    creator: string,
    globalGravity: number,
    cellSize: number
}

export interface SzeneDataObjI {
    start?: GameActorI<{}>
    target?: GameActorI<{}>
    grounds: GameActorI<GroundDataI>[]
}

export interface SzeneDataI {
    opt: SzeneDataOptI
    obj: SzeneDataObjI
}