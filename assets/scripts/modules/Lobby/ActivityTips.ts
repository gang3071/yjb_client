import * as cc from 'cc';
import { Message } from '../../base/core/MessageMgr';
import { BaseView } from '../../base/frame/BaseView';
import { LocalizadManager } from '../../base/localized/LocalizedManager';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { httpRequest } from '../../NetMgr/HttpRequest';
const { ccclass, property } = cc._decorator;

@ccclass('ActivityTips')
export class ActivityTips extends BaseView {

    @property(cc.Label)
    labContent:cc.Label = null

    start() {
        let languageArr:string[] = ["zh-CN","zh-TW","en","jp"]
        let index = LocalizadManager.getInstance().getLanauge()
        console.log("====",this.m_uidata)
        let content:string = this.m_uidata.data.activity_phase.notice[languageArr[index-1]]
        this.labContent.string = content
    }

    btnXiaFenCall () {
        let name = ""
        if (1 == this.m_uidata.data.type) {
            name = "api/v1/slot-action"
        }else if (2 == this.m_uidata.data.type) {
            name = "api/v1/jackpot-action"
        }

        httpRequest.post("api/v1/receive-award",{
            id:this.m_uidata.data.id,
        },(succ:any) => {
            AlterTipsWrap.show("领取成功请等待审核")
            this.close()
        },(fail:any) => {
            this.close()
        })
    }

    btnCloseCall() {
        this.close()
    }

    update(deltaTime: number) {
        
    }
}


