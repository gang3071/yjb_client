import { _decorator, Node, EventTouch, Label, EditBox, ScrollView } from "cc";
import { BaseView } from "../../base/frame/BaseView";
import { Tools } from "../../base/utils/util/Tools";
import { UIConfig } from "../../config/UIConfig";
import { UrlImageView } from "../../base/gui/urlImageView";
import { UserInfo } from "../common/UserInfo";
const {ccclass, property} = _decorator;

@ccclass('PopAllAgent')
export class PopAllAgent extends BaseView {
    /** 顶部按钮 */
    @property([Node])
    topBtns:Node[] = [];
    /** 推广数据页面 */
    @property(Node)
    pnl_promot:Node;
    /** 我的用户界面 */
    @property(Node)
    pnl_myUser:Node;
    /** 待结算金额 */
    @property(Label)
    wait_money:Label;
    /** 总收入 */
    @property(Label)
    all_money:Label;
    /** 我的邀请码 */
    @property(Label)
    invit_code:Label;
    /** 我的等级图标 */
    @property(Node)
    my_lv_icon:Node;
    /** 当前等级 */
    @property(Label)
    now_lv:Label;
    /** 客损返佣比例 */
    @property(Label)
    damage_rebate_ratio:Label;
    /** 客户首冲返佣金额 */
    @property(Label)
    recharge_ratio:Label;
    /** 我的用户列表 */
    @property(Node)
    my_user_list:Node;
    /** 预制件 */
    @property(Node)
    my_user_item:Node;
    /** 搜索栏 */
    @property(EditBox)
    search_name:EditBox;
    /** 玩家列表 */
    @property(Node)
    grid:Node;
    /** 邀请人数 */
    @property(Label)
    invit_num:Label;
    /** 邀请二维码 */
    @property(Node)
    qrcode:Node;
    /** 邀请大二维码 */
    @property(Node)
    big_qrcode:Node;
    /** 邀请二维码 */
    @property(Label)
    invite_str:Label;


    /** 当前页面索引 */
    private _index = null;
    /** 我的用户列表索引 */
    private _userIndex:number

    start() { 
        this.onClickTopBtn(null, 0)
    }

    protected onEnable(): void {
        this.grid.on(ScrollView.EventType.SCROLL_TO_BOTTOM, this.reqUserData, this)
    }

    protected onDisable(): void {
        this.grid.off(ScrollView.EventType.SCROLL_TO_BOTTOM, this.reqUserData, this)
    }

    /** 初始化数据 */
    initDat(dat : any)
    {
        this.wait_money.string = dat.pending_amount
        this.all_money.string = Number(dat.pending_amount + dat.settlement_amount).toFixed(2).toString()
        this.invit_code.string = dat.recommend_code
        this.invite_str.string = dat.recommend_url
        Tools.SetQRCode(dat.recommend_url, this.qrcode)
        Tools.SetQRCode(dat.recommend_url, this.big_qrcode)
        Tools.SetAgentLvIcon(this.my_lv_icon, dat.national_promoter, dat.national_level)
        this.now_lv.string = Tools.GetAgentLvLocalized(dat.national_promoter, dat.national_level)
        this.damage_rebate_ratio.string = dat.damage_rebate_ratio
        this.recharge_ratio.string = dat.recharge_ratio
        UserInfo.national_promoter = dat.national_promoter
        UserInfo.national_level = dat.national_level
    }

    /** 点击顶部按钮 */
    onClickTopBtn(evt : EventTouch, param : any)
    {
        if (this._index == param) return
        for (let index = 0; index < this.topBtns.length; index++) {
            Tools.SetSpriteFrame(this.topBtns[index], index == param ? "yeqian1_an" : "yeqian2_an", "Lobby/ui/popform")
        }
        this.pnl_promot.active = param == 0;
        this.pnl_myUser.active = param == 1;

        if (param == 0) {
            Tools.httpReq("national-promoter-data", {}, (res : any)=>{
                this.initDat(res)  
            })
        }else if (param == 1) {
            this.search_name.string = ""
            this._userIndex = 1
            this.reqUserData()
        }
    }

    /** 请求玩家数据 */
    reqUserData(){
        Tools.httpReq("national-sub-player", {
            page : this._userIndex,
            size : 10,
            name : this.search_name.string
        }, (res : any)=>{
            if (this._userIndex == 1) this.my_user_list.removeAllChildren()
            this._userIndex++
            this.initPlayer(res)  
        })
    }

    /** 初始化玩家数据 */
    initPlayer(dat:any){
        this.invit_num.string = dat.invite_num
        for (let i = 0; i < dat.list.length; i++) {
            const d = dat.list[i];
            let item = Tools.AddChild(this.my_user_list, this.my_user_item)
            Tools.SetChildText(item, "icon/name", d.player.name)
            Tools.SetChildText(item, "icon/ID", d.player.uuid)
            Tools.SetChildText(item, "time", d.created_at)
            Tools.SetChildText(item, "earn", d.money)
            Tools.GetChildComp(item, "icon", UrlImageView).setUrl(d.player.avatar)
            item.active = true
        }
    }

    /** 搜索按钮 */
    btnSearchName(){
        this._userIndex = 1
        this.reqUserData()
    }

    /** 点击规则 */
    onClickRule() { Tools.OpenPopView(UIConfig.PopAgentRule.path) }

    /** 点击历史记录 */
    onClickHistory() { Tools.OpenPopView(UIConfig.PopHistoryEarn.path) }

    /** 点击复制邀请码 */
    btnCopyMyInvitCode() { Tools.CopyToClipboard(this.invit_code.string) }

    /** 点击复制邀请链接 */
    btnCopyMyInvitStr() { Tools.CopyToClipboard(this.invite_str.string) }

    /** 查看邀请奖励 */
    onClickInvitReward() { Tools.OpenPopView(UIConfig.PopInviteMens.path) }

    /** 关闭打开二维码大图 */
    qrCodeCtr(){this.big_qrcode.parent.active = !this.big_qrcode.parent.active }
}