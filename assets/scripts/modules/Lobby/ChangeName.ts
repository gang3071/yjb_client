import * as cc from 'cc';
import { test } from '../../../test/test';
import { Message } from '../../base/core/MessageMgr';
import { BaseView } from '../../base/frame/BaseView';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { UserInfo } from '../common/UserInfo';
const { ccclass, property } = cc._decorator;

@ccclass('ChangeName')
export class ChangeName extends BaseView {
    private labName:string = ""

    start() {

    }

    nameEditBoxChangeCall (text:string) {
        this.labName = text
    }

    btnCancelCall () {
        this.close()
    }

    btnSureCall () {
        if ("" == this.labName) {
            AlterTipsWrap.show("请输入昵称")
            return
        }
        httpRequest.post("api/v1/edit-player-name",{
            player_name:this.labName
        },(succ:any) => {
            AlterTipsWrap.show("修改成功")
            UserInfo.cname = this.labName
            Message.dispatchEvent("ChangeNameSucc")
            this.close()
        },(fail:any) => {
            
        })
    }

}


