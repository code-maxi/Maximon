import * as ex from "excalibur"
import { ImageSource } from "excalibur"
import React from "react"
import { loader } from "../resources"
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

    constructor(fitContainer: boolean, editMode: boolean, onStart: (g: Game) => void) {
        super({
            canvasElementId: 'game-canvas',
            pointerScope: ex.Input.PointerScope.Document,
            displayMode: fitContainer ? ex.DisplayMode.FillContainer : ex.DisplayMode.FitScreen,
            backgroundColor: new ex.Color(150,220,255)
        })
        this.editMode = editMode
        this.startGame(onStart)
    }

    startGame(os: (g: Game) => void) {
        this.setAntialiasing(false)
        this.start().then(() => {
            os(this)
        })
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

        const scene = new GameSzene(gs, this)
        const key = 'created-szene-' + this.sc

        this.addScene(key, scene)
        this.goToScene(key)

        if (f) f(key)
        this.sc ++
    }
}

export class ReactGame extends React.Component {

    constructor(p: any) {
        super(p)
    }

    componentDidMount() {
        game = new Game(true, true, g => {
            g.newScene({
                opt: {
                    name: '',
                    difficulty: 4,
                    creator: '',
                    globalGravity: 0.2,
                    cellSize: 40,
                    cellDivides: 1
                },
                obj: {
                    grounds: []
                }
            })
        })
    }

    render() {
        return <canvas id="game-canvas" />
    }
}