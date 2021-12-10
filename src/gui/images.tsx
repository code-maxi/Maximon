import { createNumericLiteral } from "typescript"

let images: [string, HTMLImageElement][] = []

let fl = 0

function loadImage(src: string, ol?: () => void) {
    const i = new Image()
    i.src = src
    if (ol) i.onload = ol
    return i
}

export function loadImages(a: {
    key: string,
    path: string,
    color?: string
}[], f: () => void) {
    console.log('loading images...')
    a.forEach(i => {
        const image = loadImage(i.path, () => {
            fl ++
            if (fl === a.length) f()
        })
        if (i.color) image.setAttribute('style', 'color:' + i.color)
        images.push([i.key, image])
        console.log(image)
        console.log(i)
        console.log('------')
    })
}

export function image(key: string) {
    const res = images.find(i => i[0] === key)
    return res ? res[1] : undefined
}