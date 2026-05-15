import * as cc from 'cc';
import { Message } from '../../base/core/MessageMgr';
import { UIMgr } from '../../base/core/UIMgr';
import { BaseView } from '../../base/frame/BaseView';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { LoadingViewWrap } from '../../base/utils/view/LoadingViewWrap';
import { MsgBox } from '../../base/utils/view/MsgBox';
import { UIConfig } from '../../config/UIConfig';
import { httpRequest } from '../../NetMgr/HttpRequest';
const { ccclass, property } = cc._decorator;

@ccclass('SetPromotionTips')
export class SetPromotionTips extends BaseView {

    @property(cc.Label)
    labDesc:cc.Label = null

    start() {
        this.labDesc.string = "确定将玩家 " + this.m_uidata.data.uuid + " 设置为推广员？"
    }

    btnSureCall () {
        // LoadingViewWrap.show()
        UIMgr.getInstance().openSingleView(UIConfig.SetRatio.path,{data:this.m_uidata.data,isPromotionTips:true})
        this.close()
    }

    btnCancelCall () {
        this.close()
    }
}


