import * as cc from 'cc';
import { Message } from '../../base/core/MessageMgr';
import { UIMgr } from '../../base/core/UIMgr';
import { BaseView } from '../../base/frame/BaseView';
import { LocalizadManager } from '../../base/localized/LocalizedManager';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { LoadingViewWrap } from '../../base/utils/view/LoadingViewWrap';
import { LabelConfig } from '../../config/LabelConfig';
import { UIConfig } from '../../config/UIConfig';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { UserInfo } from '../common/UserInfo';
const { ccclass, property } = cc._decorator;

@ccclass('SaveMoney')
export class SaveMoney extends BaseView {

    @property(cc.Label)
    labDianShu:cc.Label = null

    @property(cc.EditBox)
    moneyEditBox:cc.EditBox = null

    @property(cc.Label)
    labDesc1:cc.Label = null

    @property(cc.Label)
    labDesc2:cc.Label = null

    @property(cc.Button)
    btnZhuanRu:cc.Button = null

    @property(cc.Button)
    btnZhuanChu:cc.Button = null

    @property(cc.Button)
    btnChongZhi:cc.Button = null

    @property(cc.Label)
    labYuE:cc.Label = null

    @property(cc.Node)
    nodeShangZhuanRu:cc.Node = null

    @property(cc.Node)
    nodeShangZhuanChu:cc.Node = null

    private labMoney:string = "0"

    start() {
        if (UserInfo.defaultConfig.q_talk_recharge_status) {
            this.btnZhuanRu.node.active = true
        }
        this.moneyEditBox.string = LabelConfig["请输入转入点数"] ? LabelConfig["请输入转入点数"][LocalizadManager.getInstance().getLanauge()-1]:"请输入转入点数"

        this.getYuE()

        Message.on("CZSuccess",this.CZSuccess,this)
    }

    onDisable () {
        Message.off("CZSuccess",this.CZSuccess,this)
    }

    CZSuccess (event:string,args:any) {
        UserInfo.getQYuE(this.labYuE)
    }

    getYuE () {
        UserInfo.getQYuE(this.labYuE)
    }

    moneyEditBoxChangeCall (text:string) {
        this.labMoney = text == "" ? "0":text
        this.labDianShu.string = text == "" ? "0":text
    }

    btnLetTalkCall () {
        if ("0" == this.labMoney) {
            AlterTipsWrap.show("点数不能为0")
            return
        }
        httpRequest.post("api/v1/talk-recharge",{
            money:this.labMoney,
        },(succ:any) => {
            UserInfo.saveMoney(succ.talk_tradeno)
        },(fail:any) => {
            
        })
    }

    btnKeFuCall () {
        if ("" == this.labMoney || "0" == this.labMoney) {
            AlterTipsWrap.show("点数不能为0")
            return
        }
        // AlterTipsWrap.show("暂未开放")
        httpRequest.post("api/v1/get-recharge-method",{
            amount:this.labMoney,
        },(succ:any) => {
            // this.czTypeData = succ
            // this.initLayout()
            // this.typeLayout.node.active = false
            // this.moneyEditBox.string = (Number(succ.money)*Number(succ.currency.ratio)).toString()
            // this.labChongZhiJinE = this.moneyEditBox.string
            // this.labBiZhong.string = succ.currency.identifying
            // this.labXuZhiFu.string = succ.money

            // if (0 < succ.recharge_method.length) {
            //     this.czFangShiIndex = this.czTypeData.recharge_method[0].id
            // }
            succ.showNode = 1
            LoadingViewWrap.show()
            UIMgr.getInstance().openSingleView(UIConfig.KeFuSaveMoney.path,{succ:succ})
            this.close()
        },(fail:any) => {
            
        })
        
    }

    btnNumCall (target:cc.Button,customs:string) {
        this.moneyEditBox.string = customs
        this.labMoney = customs
        this.labDianShu.string = customs
    }

    btnQZhuanRuCall () {
        this.labYuE.string = "0"
        this.getYuE()
        this.labDesc1.string = LabelConfig["Q币余额"] ? LabelConfig["Q币余额"][LocalizadManager.getInstance().getLanauge()-1]:"Q币余额"
        this.labDesc2.string = LabelConfig["转入金额"] ? LabelConfig["转入金额"][LocalizadManager.getInstance().getLanauge()-1]:"转入金额"
        this.moneyEditBox.string = LabelConfig["请输入转入点数"] ? LabelConfig["请输入转入点数"][LocalizadManager.getInstance().getLanauge()-1]:"请输入转入点数"

        this.labMoney = "0"
        this.labDianShu.string = "0"

        if (UserInfo.defaultConfig.q_talk_recharge_status) {
            this.btnZhuanRu.node.active = true
        }

        // this.btnZhuanRu.node.active = true
        this.btnChongZhi.node.active = true
        this.btnZhuanChu.node.active = false

        this.nodeShangZhuanRu.getChildByName("img1").active = false
        this.nodeShangZhuanRu.getChildByName("img2").active = true

        this.nodeShangZhuanChu.getChildByName("img1").active = true
        this.nodeShangZhuanChu.getChildByName("img2").active = false


    }

    btnQZhuanChuCall () {
        this.labYuE.string = UserInfo.wallet_list.money
        this.labDesc1.string = LabelConfig["游戏点数"] ? LabelConfig["游戏点数"][LocalizadManager.getInstance().getLanauge()-1]:"游戏点数"
        this.labDesc2.string = LabelConfig["转出点数"] ? LabelConfig["转出点数"][LocalizadManager.getInstance().getLanauge()-1]:"转出点数"
        this.moneyEditBox.string = LabelConfig["请输入转出点数"] ? LabelConfig["请输入转出点数"][LocalizadManager.getInstance().getLanauge()-1]:"请输入转出点数"

        this.labMoney = "0"
        this.labDianShu.string = "0"

        this.btnZhuanRu.node.active = false
        this.btnChongZhi.node.active = false
        this.btnZhuanChu.node.active = true

        this.nodeShangZhuanRu.getChildByName("img1").active = true
        this.nodeShangZhuanRu.getChildByName("img2").active = false

        this.nodeShangZhuanChu.getChildByName("img1").active = false
        this.nodeShangZhuanChu.getChildByName("img2").active = true
    }

    
    btnHuangQZhuanRuCall () {
        if ("" == this.labMoney || "0" == this.labMoney) {
            AlterTipsWrap.show("请输入提现数量")
            return
        }
        let fun = (pwd:string) => {
            httpRequest.post("api/v1/player-withdrawal",{
                amount:this.labMoney,
                play_password:pwd,
                type:1,
                bank_id:0,
            },(succ:any) => {
                
                AlterTipsWrap.show("转出成功")
                let fun2 = () => {
                    this.labYuE.string = UserInfo.wallet_list.money
                }
                UserInfo.requestUserInfo(fun2)
                // this.close()
                UIMgr.getInstance().closeView(UIConfig.PayPwd.path)
                this.close()
                // UserInfo.takeMoney(succ.talk_tradeno)
            },(fail:any) => {
                
            })
        }
        LoadingViewWrap.show()
        UIMgr.getInstance().openSingleView(UIConfig.PayPwd.path,{callback:fun})
    }

    btnHuangQZhuanChuCall () {
        this.btnHuangQZhuanRuCall()
    }

    btnHuangQChongZhiCall () {
        // if ("" == this.labMoney || "0" == this.labMoney) {
        //     AlterTipsWrap.show("请输入充值点数")
        //     return
        // }
        UserInfo.QSaveMoney(this.labMoney)
    }

    btnCloseCall() {
        this.close()
    }

}


