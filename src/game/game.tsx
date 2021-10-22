import * as ex from "excalibur"
import { ImageSource } from "excalibur"
import React from "react"
import { BoxI, elementType, SzeneDataI, SzeneDataOptI, DebugOptI } from "./dec"
import { GameSzene } from "./szene"

export let game: Game

export class Game extends ex.Engine {
    private sc = 0
    editMode: boolean
    mode: 1 | 2 = 1

    addType: elementType | undefined = 'ground'
    debugMode: DebugOptI = {
        debug: true,
        showGrid: true
    }

    images: {key: string, image: ImageSource}[] = []

    constructor(fitContainer: boolean, editMode: boolean) {
        super({
            canvasElementId: 'game-canvas',
            pointerScope: ex.Input.PointerScope.Document,
            displayMode: fitContainer ? ex.DisplayMode.FillContainer : ex.DisplayMode.FitScreen
        })
        this.editMode = editMode
    }

    loadImages() {
        const li = (n: string) => this.images.push({
            key: n, 
            image: new ImageSource('../../images/' + n)
        })
        li('grass.png')
        li('rotesdreieck.png')
        new ex.Loader(this.images.map(i => i.image))
    }
    

    newScene(gs: SzeneDataI, f?: (k: string) => void) {
        /*
        {
            opt: {
                name: '',
                difficulty: 4,
                creator: '',
                globalGravity: 0.2,
                cellSize: 40
            },
            obj: {
                grounds: []
            }
        }
        */

        const scene = new GameSzene(gs)
        const key = 'created-szene-' + this.sc
        this.addScene(key, scene)
        this.goToScene(key)
        if (f) f(key)
        this.sc ++
    }
}

export class ReactGame extends React.Component {
    started = false

    constructor(p: any) {
        super(p)
    }

    componentDidUpdate() {
        if (!this.started) game = new Game(true, true)
        this.started = true
    }

    render() {
        return <canvas id="game-canvas" />
    }
}