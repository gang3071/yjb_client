import * as cc from 'cc';
import { Message } from '../../base/core/MessageMgr';
import { BaseView } from '../../base/frame/BaseView';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { httpRequest } from '../../NetMgr/HttpRequest';
const { ccclass, property } = cc._decorator;

@ccclass('SetPromotionName')
export class SetPromotionName extends BaseView {

    private labName:string = ""

    start() {

    }

    btnCloseCall () {
        this.close()
    }

    btnSureCall () {
        if ("" == this.labName) {
            AlterTipsWrap.show("请输入名字")
            return
        }
        httpRequest.post("api/v1/set-promoter-name",{id:this.m_uidata.data.id,name:this.labName}, (succ:any) => {
            this.m_uidata.data.name = this.labName
            AlterTipsWrap.show("修改成功")
            Message.dispatchEvent("SetNameSucc", this.m_uidata.data)
            this.close()
        })
    }

    editboxChangeCall (text:string) {
        this.labName = text
    }
}


