import * as cc from 'cc';
import { UIMgr } from '../../base/core/UIMgr';
import { BaseView } from '../../base/frame/BaseView';
import { LoadingViewWrap } from '../../base/utils/view/LoadingViewWrap';
import { UIConfig } from '../../config/UIConfig';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { LocalizadManager } from '../../base/localized/LocalizedManager';
import { LabelConfig } from '../../config/LabelConfig';
import { Tools } from '../../base/utils/util/Tools';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
const { ccclass, property } = cc._decorator;

@ccclass('PrizeTips')
export class PrizeTips extends BaseView {

    @property(cc.Label)
    labDesc:cc.Label = null

    @property(cc.Label)
    labMoney:cc.Label = null

    @property(cc.Node)
    showNode:cc.Node = null

    @property(cc.Button)
    btnSure:cc.Button = null

    @property(cc.Button)
    btnCancel:cc.Button = null

    @property(cc.Label)
    showNode2:cc.Label = null

    pos0:cc.Vec3 = new cc.Vec3(0,-223.603)
    pos1:cc.Vec3 = new cc.Vec3(-200,-223.603)
    pos2:cc.Vec3 = new cc.Vec3(200,-223.603)

    private _type
    start() {
        let lan = LocalizadManager.getInstance().getLanauge() - 1
        let str = ""
        let str2 = ""
        this._type = this.m_uidata.type
        if (1 == this.m_uidata.data.lottery_type) {
            this.btnCancel.node.active = false
            this.btnSure.node.active = true
            this.btnSure.node.setPosition(this.pos0)
            this.showNode2.node.active = false
        }
        if (1 == this.m_uidata.data.machine_type) {
            if (1 == this.m_uidata.data.lottery_type) {
                if (0 == this.m_uidata.data.has_win) {
                    
                    str = LabelConfig["恭喜你分数达到"][lan] + this.m_uidata.data.lottery_condition + LabelConfig["分，达成彩金"][lan] + this.m_uidata.data.lottery_name+LabelConfig["的领取条件，若此时下分，可进行领取。"][lan]
                    if (Object.keys(this.m_uidata.data.next_lottery).length === 0) {

                    }else {
                        str += LabelConfig["您也可以继续挑战，下一级彩金分数需要达到"][lan] + this.m_uidata.data.next_lottery.condition + LabelConfig["分"][lan] 
                    }
                }else if (1 == this.m_uidata.data.has_win) {
                    if (this._type == "socket"){
                        str = Tools.StringFormat(Tools.GetLocalized("彩金领取提示1"), this.m_uidata.data.lottery_name)
                    }else if (this._type == "normal"){
                        if (this.m_uidata.data.next_lottery){
                            if (this.m_uidata.data.next_lottery && this.m_uidata.data.next_lottery.condition){
                                str = Tools.StringFormat(Tools.GetLocalized("彩金领取提示"),  this.m_uidata.data.lottery_name, this.m_uidata.data.amount,  this.m_uidata.data.next_lottery.condition, this.m_uidata.data.next_lottery.name)
                            }else{
                                str = Tools.StringFormat(Tools.GetLocalized("彩金领取提示2"),  this.m_uidata.data.lottery_name, this.m_uidata.data.amount)
                            }
                            this.btnCancel.node.active = true
                            this.btnSure.node.setPosition(this.pos2)
                            this.btnCancel.node.setPosition(this.pos1)
                        }else{
                            str = Tools.StringFormat(Tools.GetLocalized("彩金领取提示1"), this.m_uidata.data.lottery_name)
                        }
                    }

                    Tools.SetChildText(this.btnCancel.node, "name", Tools.GetLocalized("继续游玩"))
                }
            }else if (2 == this.m_uidata.data.lottery_type) {
                this.showNode.active = false
                str = LabelConfig["恭喜您触发随机彩金，获得一次参与彩金小游戏的机会，点击确定进入游戏"][lan]
            }
            
        }else if (2 == this.m_uidata.data.machine_type) {
            this.showNode.active = false
            if (1 == this.m_uidata.data.lottery_type) {
                str = LabelConfig["您单次下珠数达到"][lan] + this.m_uidata.data.lottery_condition + LabelConfig["分，达成彩金"][lan]+this.m_uidata.data.lottery_name+LabelConfig["的领取条件，总奖励点数"][lan] + this.m_uidata.data.amount + LabelConfig["，点击确定按钮，奖励将在5-10分钟后发送到您的邮箱，请注意查收"][lan]
            }else if (2 == this.m_uidata.data.lottery_type) {
                str = LabelConfig["恭喜您触发随机彩金，获得一次参与彩金小游戏的机会，点击确定进入游戏"][lan] 
            }
        }

        this.labDesc.string = str
        this.labMoney.string = this.m_uidata.data.lottery_condition
    }

    btnSureCall () {
        console.log("this.m_uidata.data", this.m_uidata.data)
        if (1 == this.m_uidata.data.lottery_type) {
            if (this._type == "socket"){
                this.close()
            }else if (this._type == "normal"){
                httpRequest.post("api/v1/slot-action",{
                    machine_id:this.m_uidata.data.machine_id,
                    action:"down",
                    has_lottery:0
                },(succ:any) => {
                    AlterTipsWrap.show("下分成功")
                    this.close()
                })
            }
            return
        }
        httpRequest.post("api/v1/receive-lottery",
            {id:this.m_uidata.data.lottery_record_id},
            (succ:any) => {
                
            },(fail:any) => {

            }
        )
        if (2 == this.m_uidata.data.lottery_type) {
            let index = Math.round(Math.random())
            let data:any = {
                "lottery_record":{
                    "amount":this.m_uidata.data.amount
                }
            }
            LoadingViewWrap.show()
            UIMgr.getInstance().openSingleView(UIConfig.PrizeSmallGame.path,{flag:index,data:data})
        }
        this.close()
    }

    btnCancelCall () {
        this.close()
    }
}


