import * as cc from 'cc';
import { Message } from '../../base/core/MessageMgr';
import { BaseView } from '../../base/frame/BaseView';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { UIMgr } from '../../base/core/UIMgr';
import { UIConfig } from '../../config/UIConfig';
const { ccclass, property } = cc._decorator;

@ccclass('SetRatio')
export class SetRatio extends BaseView {

    @property(cc.Label)
    labDefautRatio:cc.Label = null

    @property(cc.EditBox)
    ratioEditBox:cc.EditBox = null

    private labRatio:string = ""
    private labName:string = ""

    start() {
        this.labDefautRatio.string = this.m_uidata.data.maxRatio + "%"
        this.ratioEditBox.placeholder = "最大" + this.m_uidata.data.maxRatio + "%"
    }

    btnCloseCall () {
        this.close()
    }

    btnSureCall () {
        if ("" == this.labRatio) {
            AlterTipsWrap.show("请输入分成比例")
            return
        }
        if ("" == this.labName) {
            AlterTipsWrap.show("请输入名字")
            return
        }
        if (-1 != this.labRatio.indexOf(".")) {
            AlterTipsWrap.show("请输入整数")
            return
        }
        if (this.m_uidata.data.maxRatio < Number(this.labRatio)) {
            AlterTipsWrap.show("最大" + this.m_uidata.data.maxRatio + "%")
            return
        }
        httpRequest.post("api/v1/set-promoter",{id:this.m_uidata.data.id,ratio:Number(this.labRatio),name:this.labName},(succ:any) => {
            if (this.m_uidata.isPromotionTips) {
                this.m_uidata.data.is_promoter = 1
            }
            
            this.m_uidata.data.ratio = Number(this.labRatio)
            AlterTipsWrap.show("设置成功")
            UIMgr.getInstance().closeView(UIConfig.SetPromotionTips.path)
            Message.dispatchEvent("SetPromotionRatioSucc",this.m_uidata.data.id)
            this.close()
        })
        // httpRequest.post("api/v1/set-promoter",{id:this.m_uidata.id,name:this.labName},(succ:any) => {
        //     this.m_uidata.name = this.labName
        //     AlterTipsWrap.show("修改成功")
        //     Message.dispatchEvent("SetNameSucc",this.m_uidata.id)
        //     this.close()
        // })
    }

    editboxChangeCall (text:string) {
        this.labRatio = text
    }

    nameEditboxChangeCall (text:string) {
        this.labName = text
    }

}


