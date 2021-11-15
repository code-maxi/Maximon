import * as ex from "excalibur"
import { objToArr } from "./gui/adds"

export const Resources = {
    grass: new ex.ImageSource('../res/images/grass.png'),
    triangleRed: new ex.ImageSource('../res/images/rotesdreieck.png')
}

export function loader() {
    return new ex.Loader(objToArr<ex.ImageSource>(Resources))
}