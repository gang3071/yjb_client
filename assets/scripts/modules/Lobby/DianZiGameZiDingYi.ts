import * as cc from 'cc';
import { BaseView } from '../../base/frame/BaseView';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { Message } from '../../base/core/MessageMgr';
const { ccclass, property } = cc._decorator;

@ccclass('DianZiGameZiDingYi')
export class DianZiGameZiDingYi extends BaseView {

    @property(cc.EditBox)
    edit: cc.EditBox = null

    labDianShu:string = ""

    start() {

    }

    editChange (text:string) {
        this.labDianShu = text
    }

    btnMaxCall() {
        this.edit.string = this.m_uidata.max
        this.labDianShu = this.edit.string
    }

    btnSureCall() {
        if ("" == this.labDianShu || "0" == this.labDianShu) {
            AlterTipsWrap.show("请输入要转入点数")
            return
        }
        Message.dispatchEvent("DianZiGameZiDingYiInput",{value:this.labDianShu})
        this.close()
    }

    btnCloseCall() {
        this.close()
    }
}


