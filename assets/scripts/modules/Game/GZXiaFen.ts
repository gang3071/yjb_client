import * as cc from 'cc';
import { BaseView } from '../../base/frame/BaseView';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { Message } from '../../base/core/MessageMgr';
import { MsgBoxWrap } from '../../base/utils/view/MsgBoxWrap';
const { ccclass, property } = cc._decorator;

@ccclass('GZXiaFen')
export class GZXiaFen extends BaseView {
    @property(cc.Label)
    labZongShangFen:cc.Label = null

    @property(cc.Label)
    labZhuanShu:cc.Label = null

    @property(cc.Label)
    labZongDeFen:cc.Label = null

    @property(cc.Label)
    labCurrFen:cc.Label = null

    @property(cc.Label)
    labDuiHuanFen:cc.Label = null

    @property(cc.Label)
    labkaifenzengdian:cc.Label = null

    @property(cc.Label)
    labZongXiaFen:cc.Label = null

    @property(cc.Label)
    labActivityReword:cc.Label = null

    start() {
        // this.init()
        this.reqData()
    }

    reqData () {
        httpRequest.post("api/v1/jackpot-action",{
            machine_id:this.m_uidata.machine_id,
            action:"combine_status"
        },(succ:any) => {
            if (this.m_uidata) {
                this.m_uidata.data = succ
                this.init()
            }
        })
    }

    init () {
        console.log("==init==",this.m_uidata)
        if (0 != this.m_uidata.data.length) {
            this.labZongShangFen.string = this.m_uidata.data.open_point
            this.labZhuanShu.string = this.m_uidata.data.gaming_turn_point
            this.labZongDeFen.string = this.m_uidata.data.score_point
            this.labCurrFen.string = this.m_uidata.data.machine_point
            this.labDuiHuanFen.string = this.m_uidata.data.wash_point
            this.labkaifenzengdian.string = this.m_uidata.data.gift_point
            this.labZongXiaFen.string = this.m_uidata.data.total_wash_point
            this.labActivityReword.string = this.m_uidata.data.player_activity_bonus
        }
    }

    btnCloseCall () {
        this.close()
    }

    btnXiaFenCall () {
        httpRequest.post("api/v1/jackpot-action",{
            machine_id:this.m_uidata.machine_id,
            action:"down"
        },(succ:any) => {
            AlterTipsWrap.show("下分成功")
            this.close()
        })
    }

    btnExitCall () {
        let fun = () => {
            httpRequest.post("api/v1/jackpot-action",{
                machine_id:this.m_uidata.machine_id,
                action:"leave"
            },(succ:any) => {
                Message.dispatchEvent("XiaFenExit")
                this.close()
            },(fail:any) => {
                
            })
        }
        httpRequest.post("api/v1/if-key-out-condition",{
            machine_id:this.m_uidata.machine_id,
        },(succ:any) => {
            if (succ.allow_wash_point) {
                fun()
            }else {
                let str = "当前参与了开分赠点，若要强行洗分将扣\n除系统赠送的分数后进行洗分操作，若剩\n余分数不够扣除，则扣为0"
                MsgBoxWrap.showConfirmCancel(str,
                () => {
                    fun()
                }, () => { })
            } 
        })
    }
}


