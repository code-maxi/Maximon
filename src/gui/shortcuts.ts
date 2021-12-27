import { def } from "./adds"

export let shortcutCallbacks: ((e: KeyboardEvent, keyUp: boolean) => void)[] = []

export function registerShortcut(key: string, opt: { ctrlDown?: boolean, shiftDown?: boolean }, callback: () => void) {
    shortcutCallbacks.push((e, keyUp) => {
        const ctrl = def(false, opt.ctrlDown)
        const shift = def(false, opt.shiftDown)
        if (
            keyUp 
            && e.key === key 
            && ((ctrl && e.ctrlKey) || !ctrl) 
            && ((shift && e.shiftKey) || !shift)
        ) callback()
    })
}

let pressedKeys: { key: string, opts?: { pressed: boolean, ctrlDown: boolean, shiftDown: boolean }}[] = []

export function getPressedKeys() { return pressedKeys }
export function keyPressed(k: string) { return pressedKeys.find(pk => pk.key === k)?.opts }

export function initKeys() {
    document.addEventListener(
        'keydown', 
        e => {
            if (!pressedKeys.find(k => k.key === e.key)) pressedKeys.push({key: e.key})
            pressedKeys.map(k => ({ ...k, opts: { pressed: true, ctrlDown: e.ctrlKey, shiftDown: e.shiftKey } }))
            shortcutCallbacks.forEach(sc => sc(e, true))
        }
    )
    document.addEventListener(
        'keyup', 
        e => {
            pressedKeys.map(k => ({ ...k, opts: undefined }))
            shortcutCallbacks.forEach(sc => sc(e, false))
        }
    )
}