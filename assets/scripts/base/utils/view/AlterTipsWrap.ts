import { ErrorCodeMap } from "../../../config/error/ErrorCodeMap";
import { LabelConfig } from "../../../config/LabelConfig";
import { UIConfig } from "../../../config/UIConfig";
import { UIMgr } from "../../core/UIMgr"
import { LocalizadManager } from "../../localized/LocalizedManager";

export let AlterTipsWrap = {
    show( tips : string){
        if (LabelConfig[tips]) {
            tips = LabelConfig[tips][LocalizadManager.getInstance().getLanauge()-1]
        }
        UIMgr.getInstance().openView(UIConfig.AlterTips.path, { tips : tips })
    },

    showByErrorCode( errocode : number){
        let msg = ErrorCodeMap[errocode] || ""+errocode
        AlterTipsWrap.show(msg);
    }
}