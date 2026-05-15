import * as cc from 'cc';
import { UIMgr } from '../../base/core/UIMgr';
import { BaseView } from '../../base/frame/BaseView';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { LoadingViewWrap } from '../../base/utils/view/LoadingViewWrap';
import { UIConfig } from '../../config/UIConfig';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { UserInfo } from '../common/UserInfo';
const { ccclass, property } = cc._decorator;

@ccclass('ZhuanDian')
export class ZhuanDian extends BaseView {

    @property(cc.Label)
    labMoney:cc.Label = null

    @property(cc.EditBox)
    moneyEditBox:cc.EditBox = null

    private labUid:string = ""
    private labEditMoney:string = ""

    start() {
        this.initData()
    }

    onDisable() {
        
    }

    initData() {
        this.labMoney.string = UserInfo.wallet_list.money
    }

    uidEditBoxChangeCall (text:string) {
        this.labUid = text
    }

    moneyEditBoxChangeCall (text:string) {
        if (0 > Number(text)) {
            text = "0"
            this.moneyEditBox.string = "0"
        }
        this.labEditMoney = text
    }

    btnSureCall () {
        if ("" == this.labUid) {
            AlterTipsWrap.show("请输入UID")
            return
        }
        if ("" == this.labEditMoney || "0" == this.labEditMoney) {
            AlterTipsWrap.show("请输入金额")
            return
        }
        if (Number(this.labMoney.string) < Number(this.labEditMoney)) {
            AlterTipsWrap.show("已超过已有金额")
            return
        }
        let fun = (pwd:string) => {
            httpRequest.post("api/v1/present",{
                uuid:this.labUid,
                pay_password:pwd,
                amount:this.labEditMoney
            },(succ:any) => {
                AlterTipsWrap.show("转点成功")
                UserInfo.requestUserInfo()
                UIMgr.getInstance().closeView(UIConfig.PayPwd.path)
                this.close()
            },(fail:any) => {
                
            })
        }
        LoadingViewWrap.show()
        UIMgr.getInstance().openSingleView(UIConfig.PayPwd.path,{callback:fun})
        
    }

    btnCloseCall() {
        this.close()
    }
}


