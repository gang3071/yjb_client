import * as cc from 'cc';
import { BaseView } from '../../base/frame/BaseView';
import { UIMgr } from '../../base/core/UIMgr';
import { UIConfig } from '../../config/UIConfig';
import { Message } from '../../base/core/MessageMgr';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { UserInfo } from '../common/UserInfo';
import { LoadingViewWrap } from '../../base/utils/view/LoadingViewWrap';
import { utils } from '../../base/utils/utils';
import { audioMgr } from '../common/AudioMgr';
const { ccclass, property } = cc._decorator;

@ccclass('DianZiGameZhuanDian')
export class DianZiGameZhuanDian extends BaseView {

    @property(cc.Node)
    zhuanRuNode: cc.Node = null;
    @property(cc.Node)
    zhuanChuNode: cc.Node = null;

    @property(cc.Label)
    labYiXuanZhe: cc.Label = null;
    @property(cc.Label)
    labWoDeDianShu: cc.Label = null;
    @property(cc.Label)

    labYouXiDianShu: cc.Label = null;

    @property(cc.Node)
    zhuanRuTitleSelect: cc.Node = null;

    @property(cc.Node)
    zhuanRuLayout: cc.Node = null;

    @property(cc.EditBox)
    zhuanChuEditbox: cc.EditBox = null;
    /** 进入游戏按钮 */
    @property(cc.Node)
    btnEnter: cc.Node = null;

    currSelectIndex = 0

    zhuanChuInput:number = 0

    protected onEnable(): void {
        Message.on("DianZiGameZiDingYiInput",this.dianZiGameZiDingYiInput,this)
    }

    protected onDisable(): void {
        Message.off("DianZiGameZiDingYiInput",this.dianZiGameZiDingYiInput,this)
    }

    dianZiGameZiDingYiInput (name:string,args:any) {
        if ("" != args.value) {
            this.labYiXuanZhe.string = args.value
        }
    }

    start() {
        LoadingViewWrap.close()
        this.btnEnter.active = !(this.m_uidata.pop == "EWallet")
        this.labWoDeDianShu.string = UserInfo.wallet_list.money
        for (let i=0; i<this.zhuanRuLayout.children.length; ++i) {
            let node = this.zhuanRuLayout.children[i]
            node.on(cc.Node.EventType.TOUCH_START, (target:cc.EventTouch) => {
                let obj = target.getCurrentTarget() as cc.Node
                obj.setScale(0.96,0.96,0.96)
            })
            node.on(cc.Node.EventType.TOUCH_CANCEL, (target:cc.EventTouch) => {
                let obj = target.getCurrentTarget() as cc.Node
                obj.setScale(1,1,1)
            })
            node.on(cc.Node.EventType.TOUCH_END, (target:cc.EventTouch) => {
                let obj = target.getCurrentTarget() as cc.Node
                console.log("touch end",obj.name)
                obj.setScale(1,1,1)
                let name = obj.name
                switch (name) {
                    case "bg":
                        this.labYiXuanZhe.string = "100";
                        break;
                    case "bg-001":
                        this.labYiXuanZhe.string = "200";
                        break;
                    case "bg-002":
                        this.labYiXuanZhe.string = "500";
                        break;
                    case "bg-003":
                        this.labYiXuanZhe.string = "1000";
                        break;
                    case "bg-004":
                        this.labYiXuanZhe.string = "2000";
                        break;
                    case "bg-005":
                        this.labYiXuanZhe.string = "5000";
                        break;
                    case "bg-008":
                        this.labYiXuanZhe.string = "800";
                        break;
                    case "bg-006":
                        UIMgr.getInstance().openSingleView(UIConfig.DianZiGameZiDingYi.path,{max:this.labWoDeDianShu.string})
                        break;
                    case "bg-007":
                        if (0 == Number(this.labYiXuanZhe.string)) {
                            AlterTipsWrap.show("请转入金额")
                            return
                        }
                        httpRequest.post("api/v1/wallet-transfer-out",
                            {
                                game_platform_id:this.m_uidata.id,
                                amount:Number(this.labYiXuanZhe.string)
                            },
                            (succ:any) => {
                                this.labWoDeDianShu.string = (Number(this.labWoDeDianShu.string) - Number(this.labYiXuanZhe.string)).toFixed(2)
                                UserInfo.wallet_list.money = Number(this.labWoDeDianShu.string)
                                AlterTipsWrap.show("转入成功")
                            })
                    default:
                        break;
                }
            })
        }
        
    }

    setSelectIndex(target:cc.EventTouch,index: number) {
        if (this.currSelectIndex == index){return}
        this.currSelectIndex = index

        this.zhuanRuNode.active = 0 == this.currSelectIndex?true:false
        this.zhuanChuNode.active = 0 == this.currSelectIndex?false:true

        this.zhuanRuTitleSelect.children[0].getChildByName("img1").active = 0 == this.currSelectIndex?false:true
        this.zhuanRuTitleSelect.children[0].getChildByName("img2").active = 0 == this.currSelectIndex?true:false

        this.zhuanRuTitleSelect.children[1].getChildByName("img1").active = 0 == this.currSelectIndex?true:false
        this.zhuanRuTitleSelect.children[1].getChildByName("img2").active = 0 == this.currSelectIndex?false:true

        if (1 == this.currSelectIndex ) {
            this.zhuanChuEditbox.string = ""
            this.labYouXiDianShu.string = "0"
            this.reqGameDianShu()
        }
        if (0 == this.currSelectIndex) {
            this.labYiXuanZhe.string = "0"
            this.labWoDeDianShu.string = UserInfo.wallet_list.money
        }
    }

    btnEnterGame () {
        // 直接转出
        if (0 != Number(this.labYiXuanZhe.string)){
            httpRequest.post("api/v1/wallet-transfer-out",{
                game_platform_id:this.m_uidata.id,
                amount:Number(this.labYiXuanZhe.string)
            },() => {
                this.labWoDeDianShu.string = (Number(this.labWoDeDianShu.string) - Number(this.labYiXuanZhe.string)).toFixed(2)
                UserInfo.wallet_list.money = Number(this.labWoDeDianShu.string)

                this.btnEnterGameCall()
            })
        }else{
            this.btnEnterGameCall()
        }
    }

    btnEnterGameCall(){
        if (this.m_uidata.gameId) {
            httpRequest.post("api/v1/enter-game",{
                game_id:this.m_uidata.gameId
            },(succ:any) => {
            UIMgr.getInstance().openSingleView(UIConfig.GameViewBG.path,null,1)
                utils.createGameView(succ.url)
            })
        }else {
            httpRequest.post("api/v1/lobby-login",{
                game_platform_id:this.m_uidata.id
            },(succ:any) => {
                UIMgr.getInstance().openSingleView(UIConfig.GameViewBG.path,null,1)
                utils.createGameView(succ.lobby_url)
            })
        }
    }

    reqGameDianShu () {
        httpRequest.post("api/v1/get-balance",{
            game_platform_id:this.m_uidata.id
        },(succ:any) => {
            this.labYouXiDianShu.string = Number(succ.balance).toFixed(2)
            Message.dispatchEvent("UpdateMoney",this.labYouXiDianShu.string)
        })
    }

    btnZhuanChuSureCall () {
        if (0 < Number(this.labYouXiDianShu.string) && 0 == this.zhuanChuInput) {
            AlterTipsWrap.show("请输入要转出点数")
            return
        }
        httpRequest.post("api/v1/wallet-transfer-in",{
            game_platform_id:this.m_uidata.id,
            amount:this.zhuanChuInput,
            take_all:false
        },(succ:any) => {
            AlterTipsWrap.show("转出成功")
            this.labYouXiDianShu.string = (Number(this.labYouXiDianShu.string) - Number(this.zhuanChuInput)).toFixed(2)
            //UserInfo.wallet_list.money = Number(UserInfo.wallet_list.money) + Number(this.zhuanChuInput)
            Message.dispatchEvent("UpdateMoney",this.labYouXiDianShu.string)
            this.zhuanChuEditbox.string = ""
        })
    }

    btnZhuanChuAllCall () {
        // if (0 == this.zhuanChuInput) {
        //     AlterTipsWrap.show("请输入要转出点数")
        //     return
        // }
        httpRequest.post("api/v1/wallet-transfer-in",{
            game_platform_id:this.m_uidata.id,
            amount:Number(this.labYouXiDianShu.string),
            take_all:true
        },(succ:any) => {
            AlterTipsWrap.show("转出成功")
            this.labYouXiDianShu.string = "0"
            this.zhuanChuEditbox.string = ""
            Message.dispatchEvent("UpdateMoney",this.labYouXiDianShu.string)
        })
    }

    zhuanChuEditChangeCall (text:string) {
        this.zhuanChuInput = Number(text)
    }

    btnCloseCall() {
        this.close()
        if (this.m_uidata.pop == "EWallet") { this.m_uidata.func() }
    }
}


