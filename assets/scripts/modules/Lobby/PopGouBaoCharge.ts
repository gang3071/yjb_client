import * as cc from 'cc';
import { BaseView } from '../../base/frame/BaseView';
import { Tools } from '../../base/utils/util/Tools';
import { UIConfig } from '../../config/UIConfig';
import { UIMgr } from '../../base/core/UIMgr';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
const { ccclass, property } = cc._decorator;

@ccclass('PopGouBaoCharge')
export class PopGouBaoCharge extends BaseView {
    /** 密码 */
    @property(cc.EditBox)
    pwd:cc.EditBox = null
    /** 用户id */
    @property(cc.Label)
    id:cc.Label = null
    /** 金额 */
    @property(cc.Label)
    money:cc.Label = null
    /** 点数 */
    @property(cc.Label)
    point:cc.Label = null

    protected start(): void {
        this.id.string = this.m_uidata.id
        this.money.string = this.m_uidata.money
        this.point.string = this.m_uidata.point
    }

    btnSure(){
        Tools.httpReq("player-recharge", {
            amount:this.m_uidata.money,
            method_id:this.m_uidata.charge_id,
            trans_pwd:this.pwd.string}, ()=>{
                AlterTipsWrap.show(Tools.GetLocalized("充值成功"))
                this.close()
        })
    }
}


