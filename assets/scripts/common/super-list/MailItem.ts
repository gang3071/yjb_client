import * as cc from 'cc';
import { UIMgr } from '../../base/core/UIMgr';
import { LocalizadManager } from '../../base/localized/LocalizedManager';
import { LoadingViewWrap } from '../../base/utils/view/LoadingViewWrap';
import { LabelConfig } from '../../config/LabelConfig';
import { UIConfig } from '../../config/UIConfig';
import { UserInfo } from '../../modules/common/UserInfo';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { BaseItem } from './baseItem';
import { SuperLayout } from './super-layout';
import { Tools } from '../../base/utils/util/Tools';
import { Message } from '../../base/core/MessageMgr';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
const { ccclass, property } = cc._decorator;

@ccclass('MailItem')
export class MailItem extends BaseItem {
    onLoad() {
        // this.input.placeholder = this.transform?.height.toString()!
    }
    onInput() {
        // let height = Number(this.input.string)
        // if (isNaN(height)) return
        // if (height < 100) {
        //     return
        // }
        // this.transform?.setContentSize(new Size(this.transform.contentSize.width, height))
        // this.layout.updateItemSize(this.node, this.transform?.contentSize!)
    }
    show(data: any, index: number, callback: Function, layout: SuperLayout) {
        super.show(data, index, callback, layout)
        Tools.SetChildText(this.transform, "labTime", data.created_at)
        Tools.SetChildText(this.transform, "labType", data.title)
        Tools.SetChildText(this.transform, "RichText", data.content)
        const btn = this.transform.getChildByName("Node")
        btn.active = 2 == data.type || 18 == data.type || 19 == data.type
        let gray = true
        if (2 == data.type && 2 == data.lottery_record.status) {
            gray = false
        }else if ((18 == data.type || 19 == data.type) && data.has_receive == 1) {
            gray = false
        }

        btn.getChildByName("img1").getComponent(cc.Sprite).grayscale = gray
        btn.off(cc.Node.EventType.TOUCH_END)
        
        if (!gray) {
            btn.on(cc.Node.EventType.TOUCH_END,(target:cc.EventTouch) => {
                // 彩金领取
                if (2 == data.type){
                    httpRequest.post("api/v1/receive-lottery", {id:data.source_id}, (succ:any) => {
                        data.lottery_record.status = 3
                        if (1 == data.lottery_record.lottery_type) {
                            UserInfo.clickSLorGZ = data.lottery_record.game_type
                            btn.getChildByName("img1").getComponent(cc.Sprite).grayscale = true
                            btn.off(cc.Node.EventType.TOUCH_END)
                            AlterTipsWrap.show(Tools.GetLocalized("领取成功"))
                            // UIMgr.getInstance().openSingleView(UIConfig.PrizePoolFixReward.path,{data:data},1,null,() => {
                            //     btn.getChildByName("img1").getComponent(cc.Sprite).grayscale = true
                            //     btn.off(cc.Node.EventType.TOUCH_END)
                            // })
                        }else if (2 == data.lottery_record.lottery_type) {
                            let index = Math.round(Math.random())
                            btn.getChildByName("img1").getComponent(cc.Sprite).grayscale = true
                            btn.off(cc.Node.EventType.TOUCH_END)
                            AlterTipsWrap.show(Tools.GetLocalized("领取成功"))
                            // UIMgr.getInstance().openSingleView(UIConfig.PrizeSmallGame.path,{flag:index,data:data},1,null,() => {
                            //     btn.getChildByName("img1").getComponent(cc.Sprite).grayscale = true
                            //     btn.off(cc.Node.EventType.TOUCH_END)
                            // })
                        }
                    }
                )
                //活动领取
                }else if(18 == data.type) {
                    httpRequest.post("api/v1/receive-award", {id:data.source_id}, (succ:any) => {
                        AlterTipsWrap.show(Tools.GetLocalized("领取成功，等待客服审核中..."))
                        UserInfo.wallet_list.money = (Number(UserInfo.wallet_list.money) + Number(succ.bonus)).toFixed(2).toString()
                        Message.dispatchEvent("UpdateMoney", UserInfo.wallet_list.money)
                        btn.getChildByName("img1").getComponent(cc.Sprite).grayscale = true
                        btn.off(cc.Node.EventType.TOUCH_END)
                    })
                }
                // 返水领取
                else if(19 == data.type) {
                httpRequest.post("api/v1/receiveReverseWater", {id:data.id}, (succ:any) => {
                    AlterTipsWrap.show(Tools.GetLocalized("领取成功"))
                    btn.getChildByName("img1").getComponent(cc.Sprite).grayscale = true
                    btn.off(cc.Node.EventType.TOUCH_END)
                })
            }
                
            })
        }

        // let gameName:string = ""
        // if (1 == data.lottery_record.game_type) {
        //     gameName = "斯洛"
        //     if (LabelConfig["斯洛"]) {
        //         gameName = LabelConfig["斯洛"][LocalizadManager.getInstance().getLanauge()-1]
        //     }
        // }else if (2 == data.lottery_record.game_type) {
        //     gameName = "钢珠"
        //     if (LabelConfig["钢珠"]) {
        //         gameName = LabelConfig["钢珠"][LocalizadManager.getInstance().getLanauge()-1]
        //     }
        // }

        // let lab1 = "恭喜您在"
        // if (LabelConfig["恭喜您在"]) {
        //     lab1 = LabelConfig["恭喜您在"][LocalizadManager.getInstance().getLanauge()-1]
        // }

        // let lab2 = "机台上游玩时获得彩金"
        // if (LabelConfig["机台上游玩时获得彩金"]) {
        //     lab2 = LabelConfig["机台上游玩时获得彩金"][LocalizadManager.getInstance().getLanauge()-1]
        // }

        // let lab3 = "总彩金奖励游戏"
        // if (LabelConfig["总彩金奖励游戏"]) {
        //     lab3 = LabelConfig["总彩金奖励游戏"][LocalizadManager.getInstance().getLanauge()-1]
        // }

        // let lab4 = "点"
        // if (LabelConfig["点"]) {
        //     lab4 = LabelConfig["点"][LocalizadManager.getInstance().getLanauge()-1]
        // }

        // let lab5 = "点击领取按钮领取"
        // if (LabelConfig["点击领取按钮领取"]) {
        //     lab5 = LabelConfig["点击领取按钮领取"][LocalizadManager.getInstance().getLanauge()-1]
        // }

        // let lab6 = "机器上的游戏触发随机彩金，获得一次参与彩金小"
        // if (LabelConfig["机器上的游戏触发随机彩金，获得一次参与彩金小"]) {
        //     lab6 = LabelConfig["机器上的游戏触发随机彩金，获得一次参与彩金小"][LocalizadManager.getInstance().getLanauge()-1]
        // }

        // let lab7 = "游戏的机会，点击领取按钮进入游戏领取奖励"
        // if (LabelConfig["游戏的机会，点击领取按钮进入游戏领取奖励"]) {
        //     lab7 = LabelConfig["游戏的机会，点击领取按钮进入游戏领取奖励"][LocalizadManager.getInstance().getLanauge()-1]
        // }
        
        // if (1 == data.lottery_record.lottery_type) {
        //     desc.string = "<color=#ffffff>"+lab1 + gameName + data.lottery_record.machine_code + lab2+ data.lottery_record.lottery_name + "，"+lab3+"\n"+lab4+ data.lottery_record.amount +lab5+"</color>"
        // }else if (2 == data.lottery_record.lottery_type) {
        //     desc.string = "<color=#ffffff>"+lab1 + data.lottery_record.machine_code + lab6 + "\n"+lab7+"</color>"
        // }
    }
}


