import * as cc from 'cc';
import { Message } from '../../base/core/MessageMgr';
import { UIMgr } from '../../base/core/UIMgr';
import { BaseView } from '../../base/frame/BaseView';
import { LoadingViewWrap } from '../../base/utils/view/LoadingViewWrap';
import { UIConfig } from '../../config/UIConfig';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { Tools } from '../../base/utils/util/Tools';
import { MsgBoxWrap } from '../../base/utils/view/MsgBoxWrap';
import { UrlImageView } from '../../base/gui/urlImageView';
const { ccclass, property } = cc._decorator;

/** 充值类型对应的图标编号,充值类型固定死的，可以后续添加 */
const CHARGE_TYPE_TO_PIC = {
    // USDT
    1 : "4" ,
    // alipay
    2 : "2",
    // wechat
    3 : "1",
    // bank
    4 : "3",
    // bank
    5 : "5",
}

@ccclass('BankCardMgr')
export class BankCardMgr extends BaseView {
    @property(cc.Node)
    itemLayout:cc.Node = null

    /** 银行卡预制件 */
    @property(cc.Prefab)
    item0:cc.Prefab = null

    /** 没有支付方式 */
    @property(cc.Node)
    no_acc:cc.Node = null

    start() {
        Message.on("AddBankCardSucc", this.reqBindBankCardData, this)
        this.reqBindBankCardData()
    }

    onDisable () {
        Message.off("AddBankCardSucc", this.reqBindBankCardData, this)
    }

    /** 获取银行卡列表 */
    reqBindBankCardData () {
        httpRequest.post("api/v1/bank-card-list", {
            page:1,
            size:10
        }, (succ:any) => {
            this.itemLayout.removeAllChildren()
            this.no_acc.active = 0 == succ.bank_list.length
            if (0 < succ.bank_list.length) {
                for (let i=0; i<succ.bank_list.length; i++) {
                    const card = succ.bank_list[i]
                    let node = Tools.AddChild(this.itemLayout, this.item0)
                    Tools.SetChildText(node, "bankName", card.bank_name)
                    Tools.SetChildText(node, "peopleName", card.account_name)
                    Tools.SetChildText(node, "bankCardNum", card.type == 1 ? card.wallet_address : card.account)
                    Tools.SetChildSprite(node, "icon", "zhifu_icon0" + CHARGE_TYPE_TO_PIC[card.type], "Lobby/ui/zhifu")
                    Tools.SetSpriteFrame(node, "zhifu_di0" + CHARGE_TYPE_TO_PIC[card.type], "Lobby/ui/zhifu")
                    Tools.ActChild(node, "QRcode", card.type != 4 && card.qr_code != "")
                    if (card.qr_code != ""){
                            Tools.GetChildComp(node, "QRcode", UrlImageView).setUrl(card.qr_code)
                        }
                    Tools.SetChildTouchEndEvt(node, "btn_change", () => {
                        this.onClickChangeCardMsg(card)
                    })
                    Tools.SetChildTouchEndEvt(node, "btn_del", () => {
                        this.onClickDelCardMsg(card)
                    })
                    // 暂时不让修改和删除
                    Tools.ActChild(node, "btn_change", false)
                    Tools.ActChild(node, "btn_del", false)
                }
            }
        })
    }

    /** 修改卡信息 */
    onClickChangeCardMsg(card:any)
    {
        UIMgr.getInstance().openSingleView(UIConfig.AddBankCard.path, {dat:card})
    }

    /** 删除卡信息 */
    onClickDelCardMsg(card:any)
    {
        MsgBoxWrap.showConfirmCancel(Tools.GetLocalized("是否删除该支付方式"), () => {
            httpRequest.post("api/v1/delete-bank-card", {
                id:card.id
            }, () => {
                this.reqBindBankCardData()
            })
        })
    }

    /** 添加银行卡 */
    openAddBankCard()
    {
        LoadingViewWrap.show()
        UIMgr.getInstance().openSingleView(UIConfig.AddBankCard.path)
    }

    btnCloseCall () { this.close() }
}