import * as cc from 'cc';
import { BaseView } from '../../base/frame/BaseView';
import { Tools } from '../../base/utils/util/Tools';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
const { ccclass, property } = cc._decorator;

@ccclass('PopGouBaoVerify')
export class PopGouBaoVerify extends BaseView {
    /** 密码 */
    @property(cc.EditBox)
    pwd:cc.EditBox = null

    btnSure(){
        Tools.httpReq("verify-code", {code:this.pwd.string}, ()=>{
            AlterTipsWrap.show(Tools.GetLocalized("验证成功"))
            this.close()
        })
    }
}


