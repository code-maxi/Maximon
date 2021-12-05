export type elementType = 'start-end' | 'ground' | 'score'

export interface VectorI {
    x: number
    y: number
}

export function fullElementName(t: any) {
    let i = '[ERROR]'
    if (t.type === 'start-end') i = 'Spiel Start/Ende'
    if (t.type === 'ground') i = 'Boden'
    if (t.type === 'score') i = 'Score-Objekt'
    return i
}

export interface BoxI {
    x: number
    y: number
    w: number
    h: number
}

export interface TypeableI {
    type: elementType
}

export interface GameActorI<T> extends TypeableI {
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

export type groundTypeI = 'none' | 'grass' | 'barrier' | 'ice'
export function textGroundType(gt: groundTypeI) {
    let t = ''
    if (gt === 'none') t = 'Nichts'
    if (gt === 'grass') t = 'Gras'
    if (gt === 'barrier') t = 'Hindernis'
    if (gt === 'ice') t = 'Eis'
    return t
}

export interface GroundDataI {
    speechBuble?: string,
    width: number,
    vertical: boolean,
    groundType: groundTypeI,
    elevated?: boolean
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
    cellSize: number,
    cellDivides: number,
    height: number
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