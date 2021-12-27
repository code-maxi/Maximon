import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import React from "react";
import { GlobalSettingsDrawer } from "./drawer/globalSettings";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { TabPanel } from "../adds";
import { ElementDrawer } from "./drawer/elementDrawer";
import { SzeneDataOptI } from '../../game/dec';
import { gameCanvas, GameEditor, gameEditor } from './gameEditor/gameEditor';
import { loadImages } from '../images';
import { initKeys } from '../shortcuts';

export const cellSize = 50

export let editor: Editor


export class Editor extends React.Component<{}, {
    addSelectedItem?: string,
    mode: number,
    tab: number,
    selectedItem?: any
}> {
    gameSettings: SzeneDataOptI = {
        name: '',
        difficulty: 2,
        creator: '',
        globalGravity: 4,
        cellSize: 50,
        cellDivides: 1,
        height: 20
    }

    constructor(p: any) {
        super(p)
        this.state = {
            mode: 1,
            tab: 2,
        }
        editor = this
        loadImages([
            { key: 'plus', path: 'images/editor/plus.png' },
            { key: 'duplicate', path: 'images/editor/back.png' },
            { key: 'saw-blade', path: 'images/editor/elements/rundscheibe.png' },
            { key: 'cp/zoom', path: 'images/editor/command-points/zoom.svg', color: 'white' },
            { key: 'cp/speechbuble', path: 'images/editor/command-points/speechbuble.svg', color: 'white' },
            { key: 'cp/gravity', path: 'images/editor/command-points/gravity.svg', color: 'white' }
        ], () => {})
        initKeys()
    }

    setES(o: any, updateState?: boolean, updateGame?: boolean) {
        if (updateGame === true) gameEditor.gameCanvas?.updateSelected(o)
        if (updateState === true) this.setState({
            ...this.state,
            selectedItem: o
        })
    }

    setAddingType(a?: string) {
        this.setState({ ...this.state, addSelectedItem: a })
    }

    //<ReactGame />

    render() {
        return <div id="editor">
            <GameEditor startData={this.gameSettings} />
            <div id="game-settings">
                <div className="tab-p">
                    <div className="tab-p-h">
                        <Tabs centered value={this.state.tab} onChange={(_: React.SyntheticEvent, newValue: number) => {
                            this.setState({ ...this.state, tab: newValue })
                            console.log('tab clicked!')
                        }} aria-label="lab API tabs example">

                            <Tab label="Einstellungen" value={1} icon={ <SettingsRoundedIcon /> } />
                            <Tab label="Elemente" value={2}  icon={ <DashboardRoundedIcon /> } />
                        </Tabs>
                    </div>
                    <TabPanel value={1} index={this.state.tab}>
                        <GlobalSettingsDrawer onGameSettingsChange={gs => gameCanvas.updateSettings(gs)} gameSettings={this.gameSettings} onSave={ () => {} } />
                    </TabPanel>
                    <TabPanel value={2} index={this.state.tab}>
                         <ElementDrawer
                            onAddSelect={ (e) => {
                                gameCanvas.setAddingElement(e)
                                this.setState({ ...this.state, addSelectedItem: e })
                            } }
                            onESUpdate={ (e) => {
                                this.setES(e, false, true)
                            } } 
                            onModeChange={ (e) => {
                                this.setState({ ...this.state, mode: e })
                            } }
                            addSelected={this.state.addSelectedItem}
                            selectedItem={this.state.selectedItem}
                            mode={this.state.mode}
                        />
                    </TabPanel>
                </div>
            </div>
        </div>   
    }
}