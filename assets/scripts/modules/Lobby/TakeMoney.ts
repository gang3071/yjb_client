import * as cc from 'cc';
import { UIMgr } from '../../base/core/UIMgr';
import { BaseView } from '../../base/frame/BaseView';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { LoadingViewWrap } from '../../base/utils/view/LoadingViewWrap';
import { UIConfig } from '../../config/UIConfig';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { UserInfo } from '../common/UserInfo';
import { Tools } from '../../base/utils/util/Tools';
const { ccclass, property } = cc._decorator;

@ccclass('TakeMoney')
export class TakeMoney extends BaseView {

    @property(cc.Label)
    labMoney:cc.Label = null

    @property(cc.Label)
    labTiXian:cc.Label = null

    @property(cc.EditBox)
    amountEditBox:cc.EditBox = null

    @property(cc.Prefab)
    item:cc.Prefab = null

    @property(cc.Layout)
    itemLayout:cc.Layout = null

    /** 今日汇率 */
    @property(cc.Label)
    todayChange:cc.Label = null

    private labAmount:string = ""

    bindBankCardData:any = null

    private color1:cc.Color = new cc.Color(148,142,208)
    private color2:cc.Color = new cc.Color(255,155,11)

    private selectIndex:number = -1

    start() {
        this.labMoney.string = UserInfo.wallet_list.money
        this.getTakeMoneyWay()
    }

    getTakeMoneyWay () {
        httpRequest.post("api/v1/get-withdrawal-way",{},(succ:any) => {
            const mainData = succ.withdrawal_way
            this.todayChange.node.active = mainData.length > 0 && 1 == mainData[0].type
            this.todayChange.string = Tools.GetLocalized("今日汇率") + "：" + succ.usdt_rate
            if (0 < mainData.length) {
                this.selectIndex = 0
                this.labTiXian.string = this.getWayName(mainData[0])
                for (let i=0; i<mainData.length; i++) {
                    let node = Tools.AddChild(this.itemLayout.node, this.item)
                    const dat = mainData[i]
                    Tools.SetChildText(node, "name", this.getWayName(dat))
                    node.on(cc.Node.EventType.TOUCH_END, () => {
                        this.labTiXian.string = this.getWayName(dat)
                        // 汇率展示
                        this.todayChange.node.active = 1 == dat.type
                        this.selectIndex = i
                        for (let j=0; j<this.itemLayout.node.children.length; j++) {
                            let node = this.itemLayout.node.children[j]
                            node.getChildByName("img2").active = i == j
                            node.getChildByName("name").getComponent(cc.Label).color = i == j ? this.color2 : this.color1
                        }
                        this.scheduleOnce(() => { this.setLayoutShow() },0.1)
                    }, this)

                    node.getChildByName("img2").active = 0 == i
                    node.getChildByName("name").getComponent(cc.Label).color = 0 == i ? this.color2 : this.color1
                }
            }
            this.bindBankCardData = succ
        })
    }

    /** 获取展示名字 */
    getWayName(way:any)
    {   
        // 1 钱包地址 2 支付宝 3 微信 4 银行卡 5 购宝
        if (way.type == 1) {
            return "USDT(" + way.wallet_address.slice(-4) + ")"
        }else if (way.type == 2) {
            return Tools.GetLocalized("支付宝") + "(" + way.account_name + "/" + way.account.slice(-4) + ")"
        }else if (way.type == 3) {
            return Tools.GetLocalized("微信") + "(" + way.account_name  + ")"
        }else if (way.type == 4) {
            return way.bank_name + "(" + way.account.slice(-4) + ")"
         }else if (way.type == 5) {
            return way.bank_name + "(" + way.gb_nickname.slice(-4) + ")"
        }
    }

    amountEditBoxChange (text:string) {
        let num = Number(text)
        if (0 > num) {
            this.amountEditBox.string = "0"
            text = "0"
        }
        this.labAmount = text
    }

    btnSureCall () {
        if ("" == this.labAmount || "0" == this.labAmount) {
            AlterTipsWrap.show("请输入转出点数")
            return
        }
        if (0 == this.bindBankCardData.withdrawal_way.length) {
            AlterTipsWrap.show("提现方式未配置")
            return
        }
        let fun = (pwd:string) => {
            httpRequest.post("api/v1/player-withdrawal",{
                amount:this.labAmount,
                play_password:pwd,
                // 购宝类型是4，其他的都是2
                type:this.bindBankCardData.withdrawal_way[this.selectIndex].type == 5 ? 4 : 2,
                bank_id:this.bindBankCardData.withdrawal_way[this.selectIndex].id,
            },(succ:any) => {
                AlterTipsWrap.show("转出成功")
                UserInfo.requestUserInfo()
                this.close()
                UIMgr.getInstance().closeView(UIConfig.PayPwd.path)
                // UserInfo.takeMoney(succ.talk_tradeno)
            })
        }
        LoadingViewWrap.show()
        UIMgr.getInstance().openSingleView(UIConfig.PayPwd.path,{callback:fun})
    }

    selectBankBard () {
        this.itemLayout.node.active = !this.itemLayout.node.active
        if (UserInfo.bindBankBardInfo && UserInfo.bindBankBardInfo.length > 0) {
            let node = cc.instantiate(this.item)
            this.itemLayout.node.addChild(node)
            node.on(cc.Node.EventType.TOUCH_END,(target:cc.EventTouch) => {
                this.itemLayout.node.active = !this.itemLayout.node.active
            })
        }
    }

    setLayoutShow () {
        if (this.itemLayout.node.active) {
            this.itemLayout.node.active = false
        }
    }

    btnCloseCall() {
        this.close()
    }
}


