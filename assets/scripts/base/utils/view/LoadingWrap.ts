import { ErrorCodeMap } from "../../../config/error/ErrorCodeMap";
import { LabelConfig } from "../../../config/LabelConfig";
import { UIConfig } from "../../../config/UIConfig";
import { UIMgr } from "../../core/UIMgr"
import { LocalizadManager } from "../../localized/LocalizedManager";

export let LoadingWrap = {

    show(){
        UIMgr.getInstance().openSingleView(UIConfig.Loading.path)
    },

    close(){
        UIMgr.getInstance().closeView(UIConfig.Loading.path);
    }
}