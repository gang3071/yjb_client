import * as cc from 'cc';
import { BaseView } from '../../base/frame/BaseView';
import { Tools } from '../../base/utils/util/Tools';
import { UIConfig } from '../../config/UIConfig';
import { UIMgr } from '../../base/core/UIMgr';
const { ccclass, property } = cc._decorator;

@ccclass('CheckPwd')
export class CheckPwd extends BaseView {
    @property(cc.EditBox)
    pwd:cc.EditBox = null

    btnSure(){
        Tools.httpReq("pass-check", {password:this.pwd.string}, ()=>{
            UIMgr.getInstance().openSingleView(UIConfig.Agent.path)
            this.close()
        })
    }
}


