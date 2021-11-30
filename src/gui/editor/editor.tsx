import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import React from "react";
import { SettingsDrawer } from "./drawer/settings";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { TabPanel } from "../adds";
import { ElementDrawer } from "./drawer/drawer";
import { elementType, GroundDataI } from '../../game/dec';
import { ReactGame } from '../../game/game';
import { gameCanvas, GameEditor, gameEditor } from './gameEditor/gameEditor';
import { editorTemplates } from './gameEditor/objects/object';
import { loadImages } from '../images';

export const cellSize = 50

export let editor: Editor

export class Editor extends React.Component<{}, {
    addSelectedItem?: [string,string],
    mode: number,
    tab: number,
    selectedItem?: any
}> {
    elementSettings?: any

    constructor(p: any) {
        super(p)
        this.state = {
            mode: 1,
            tab: 2,
        }
        editor = this
        loadImages([
            [ 'plus', 'images/plus.png' ]
        ], () => {})
    }

    setES(o: any, updateState?: boolean, updateGame?: boolean) {
        this.elementSettings = o

        if (updateGame === true) gameEditor.gameCanvas?.updateSelected(this.elementSettings)
        if (updateState === true) this.setState({
            ...this.state,
            selectedItem: this.elementSettings
        })
    }

    setAddingType(a?: [string, string]) {
        this.setState({ ...this.state, addSelectedItem: a })
    }

    //<ReactGame />

    render() {
        return <div id="editor">
            <GameEditor startData={{
                name: '',
                difficulty: 2,
                creator: '',
                globalGravity: 4,
                cellSize: 50,
                cellDivides: 1
            }} />
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
                        <SettingsDrawer onSave={ () => {} } />
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