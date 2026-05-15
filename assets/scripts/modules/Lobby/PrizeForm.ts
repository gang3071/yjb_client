import * as cc from 'cc';
import { Message } from '../../base/core/MessageMgr';
import { BaseView } from '../../base/frame/BaseView';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { LocalizadManager } from '../../base/localized/LocalizedManager';
import { LabelConfig } from '../../config/LabelConfig';
const { ccclass, property } = cc._decorator;

@ccclass('PrizeForm')
export class PrizeForm extends BaseView {

    @property(cc.Label)
    labDesc:cc.Label = null

    start() {
        let lan = LocalizadManager.getInstance().getLanauge() - 1
        let str = LabelConfig["恭喜你在"][lan]
        if (0 == this.m_uidata.flag) {
            str += LabelConfig[" 疯狂拍拍乐 "][lan]
        }else if (1 == this.m_uidata.flag) {
            str += LabelConfig[" 疯狂抢红包 "][lan]
        }
        if (0 < this.m_uidata.money) {
            str += LabelConfig["活动中，获得奖励 "][lan] + this.m_uidata.money + LabelConfig[" 额外奖励 "][lan] + (this.m_uidata.data.lottery_record.amount - this.m_uidata.money).toFixed(2) + LabelConfig["，总计获得彩金奖励 "][lan] + this.m_uidata.data.lottery_record.amount
        }else {
            str += LabelConfig["活动中，获得奖励 "][lan] + this.m_uidata.data.lottery_record.amount
        }
        this.labDesc.string = str
    }

    btnCloseCall () {
        Message.dispatchEvent("PrizeFormSure")
        this.close()
    }

    update(deltaTime: number) {
        
    }
}


