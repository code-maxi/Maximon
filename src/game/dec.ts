export type elementType = 'start' | 'target' | 'ground'

export interface VectorI {
    x: number
    y: number
}

export function fullElementName(t: ElementDataI) {
    let i = '[ERROR]'
    if (t.type === 'start') i = 'Spiel-Start'
    if (t.type === 'target') i = 'Spiel-Ziel'
    if (t.type === 'ground') {
        i = 'Boden (' 
            + t.geo.width 
            + ' | ' + t.geo.height + ')'
    }
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