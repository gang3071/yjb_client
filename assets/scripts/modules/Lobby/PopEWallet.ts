import { _decorator, Node, Button, Label } from 'cc';
import { BaseView } from '../../base/frame/BaseView';
import { Tools } from '../../base/utils/util/Tools';
import { UrlImageView } from '../../base/gui/urlImageView';
import { UIMgr } from '../../base/core/UIMgr';
import { UIConfig } from '../../config/UIConfig';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { UserInfo } from '../common/UserInfo';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { Message } from '../../base/core/MessageMgr';
const { ccclass, property } = _decorator;

/** 电子钱包 */
@ccclass('PopEWallet')
export class PopEWallet extends BaseView {
    /** 总余额 */
    @property(Label)
    all_money: Label = null;
    /** grid列表 */
    @property(Node)
    grid: Node = null;
    /** Item */
    @property(Node)
    Item: Node = null;

    start() { 
        this.reqDat() 
        this.reRreshMoney()
        Message.on("UpdateMoney", this.reRreshMoney, this)
    }

    protected onDestroy(): void {
        Message.off("UpdateMoney", this.reRreshMoney, this)
    }

    /** 请求数据 */
    reqDat() {
        Tools.httpReq("get-wallet", null, (res : any)=>{
            this.initDat(res)
        })
    }

    /** 刷新金额 */
    reRreshMoney() {
        let m = Number(UserInfo.wallet_list.money).toFixed(2)
        this.all_money.string = m.includes('.00') ? m.split('.')[0] : m
    }

    /** 初始化显示 */
    initDat(dat:any) {
        this.grid.destroyAllChildren()
        for (let i = 0; i < dat.list.length; i++) {
            const d = dat.list[i];
            let node = Tools.AddChild(this.grid, this.Item, "item_" + i)
            Tools.SetChildText(node, "name", d.name)
            Tools.GetChildComp(node, "icon", UrlImageView).setUrl(d.logo)
            Tools.SetChildText(node, "money", d.balance)
            Tools.GetChildComp(node, "btn_tran", Button).clickEvents[0].customEventData = d
            node.active = true
        }
    }

    /** 刷新金额 */
    onClickRefresh() {
        UserInfo.requestUserInfo(() => {
            AlterTipsWrap.show("刷新成功")
        })
    }

    /** 全部转出 */
    onClickTransAll() {
        httpRequest.post("api/v1/fast-transfer",{},(succ:any) => {
                UserInfo.requestUserInfo()
                AlterTipsWrap.show("操作成功")
                this.reqDat()
            })
    }

    /** 转点 */
    onClickTrans(evt, param:any) {
        UIMgr.getInstance().openSingleView(UIConfig.DianZiGameZhuanDian.path, {id:param.platform_id, pop:"EWallet", func:()=>{this.reqDat()}})}
}