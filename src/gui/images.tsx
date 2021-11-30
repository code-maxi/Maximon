let images: [string, HTMLImageElement][] = []

let fl = 0

function loadImage(src: string, ol?: () => void) {
    const i = new Image()
    i.src = src
    if (ol) i.onload = ol
    return i
}

export function loadImages(a: [string, string][], f: () => void) {
    a.forEach(i => images.push([i[0], loadImage(i[1], () => {
        fl ++
        if (fl === a.length) f()
    })]))
}

export function image(key: string) {
    const res = images.find(i => i[0] === key)
    return res ? res[1] : undefined
}