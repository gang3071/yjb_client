import { _decorator, Node, RichText, Label, ScrollView, Vec3 } from "cc";
import { BaseView } from "../../base/frame/BaseView";
import { Tools } from "../../base/utils/util/Tools";
import { UserInfo } from "../common/UserInfo";
import { PlayOnlineVideo } from "./PlayOnlineVideo";
const {ccclass, property} = _decorator;

@ccclass('PopFanShui')
export class PopFanShui extends BaseView {
    /** 列表子项 */
    @property(Node)
    item_list:Node;
    /** 数据列表 */
    @property(ScrollView)
    list:ScrollView;
    /** 列表子项 */
    @property(Node)
    dama_item:Node;
    /** 大码pnl */
    @property(Node)
    dama_pnl:Node;
    /** 数据列表 */
    @property(ScrollView)
    dama_list:ScrollView;
    /** 提示面板 */
    @property(Node)
    pnl_tips:Node;
    /** 文字提示 */
    @property(RichText)
    tips:RichText;
    /** vip 图标 */
    @property(Node)
    vip_icon:Node;
    /** vip 名称 */
    @property(Label)
    vip_str:Label;
    /** vip 加成 */
    @property(Label)
    vip_add:Label;
    /** 总反水 */
    @property(Label)
    all_fanshui:Label;
    /** 今日总反水 */
    @property(Label)
    today_all_fanshui:Label;
    /** 详细信息列表子项 */
    @property(Node)
    detail_item:Node;
    /** 详细信息pnl */
    @property(Node)
    detail_pnl:Node;
    /** 详细信息数据列表 */
    @property(ScrollView)
    detail_list:ScrollView;
    /** 打码箭头 */
    @property(Node)
    dama_arr:Node;
    /** 打码箭头 */
    @property(Node)
    plat_fanshui:Node;
    /** 平台列表 */
    @property(ScrollView)
    plat_fanshui_list:ScrollView;
    /** 平台item */
    @property(Node)
    plat_fanshui_item:Node;
    /** 当前选择平台名称 */
    @property(Label)
    now_plat_name:Label;
    /** 平台返水比例列表 */
    @property(ScrollView)
    fanshui_list:ScrollView;
    /** 平台返水比例item */
    @property(Node)
    fanshui_item:Node;
    /** 平台返水比例item */
    @property(Node)
    test:Node;

    start() { 
        this.tips.string = Tools.GetLocalized("每日返水tips")
        this.reqDat()
    }

    reqDat(){
        Tools.httpReq("reverseWaterList", null, (res : any)=>{
            this.initData(res)
        })
    }

    /** 初始化数据 */
    initData(d){
        Tools.SetAgentLvIcon(this.vip_icon, UserInfo.national_promoter, Number(UserInfo.national_level))
        this.vip_str.string = Tools.GetAgentLvLocalized(UserInfo.national_promoter, Number(UserInfo.national_level))
        this.vip_add.string = Tools.StringLFormat("返水加成 {0}%", d.level_info.ratio)
        this.all_fanshui.string = d.total
        this.today_all_fanshui.string = d.today.total
        this.initDetail(d.list)
        this.inidDama(d.today.detail)
    }

    /** 返水明细 */
    initDetail(d){
        let c = this.list.content
        c.removeAllChildren()
        for (let i = 0; i < d.length; i++) {
            const e = d[i];
            let item = Tools.AddChild(c, this.item_list)
            item.active = true
            Tools.SetChildText(item , "time", e.date)
            Tools.SetChildText(item , "number", e.all_point)
            Tools.SetChildText(item , "add", e.level_ratio)
            Tools.SetChildText(item , "earn", e.all_reverse_water)
            Tools.SetChildTouchEndEvt(item, "btn", ()=>{
                Tools.httpReq("getReverseWaterDetail", {date:e.date}, (res : any)=>{
                    this.initDetailDay(res)
                })
            })
        }
    }

    /** 每日返水明细 */
    initDetailDay(d){
        this.detail_pnl.active = true
        let c = this.detail_list.content
        c.removeAllChildren()
        for (let i = 0; i < d.length; i++) {
            const e = d[i];
            let item = Tools.AddChild(c, this.detail_item)
            item.active = true
            Tools.SetChildText(item , "plat", e.platform.name)
            Tools.SetChildText(item , "number", e.point)
            Tools.SetChildText(item , "pro", e.platform_ratio + "%")
            Tools.SetChildText(item , "limit", e.reverse_water)
        }
    }

    closeDetail(){
        this.detail_pnl.active = false
    }   

    /** 每日打码 */
    inidDama(d){
        let c = this.dama_list.content
        c.removeAllChildren()
        for (let i = 0; i < d.length; i++) {
            const e = d[i];
            let item = Tools.AddChild(c, this.dama_item)
            item.active = true
            Tools.SetChildText(item , "platform", e.game_platform.name)
            Tools.SetChildText(item , "number", e.bet)
        }
    }

    openPlatFanshui(){
        Tools.httpReq("reverseWaterSetting", null, (res)=>{
            this.plat_fanshui.active = true
            this.initPlatFanshui(res)
        })
    }

    initPlatFanshui(res){
        this.plat_fanshui_list.content.removeAllChildren()
        for (let i = 0; i < res.length; i++) {
            const d = res[i];
            let item = Tools.AddChild(this.plat_fanshui_list.content, this.plat_fanshui_item)
            item.active = true
            Tools.SetChildText(item, "lab", d.platform.name)
            Tools.SetTouchEndEvt(item, ()=>{
                this.onClickPlat(d)
            })
        }
        if (res.length > 0) this.onClickPlat(res[0])
    }

    switchPlatFanshui(){
        this.plat_fanshui_list.node.active = !this.plat_fanshui_list.node.active
    }

    onClickPlat(data){
        this.fanshui_list.content.removeAllChildren()
        this.now_plat_name.string = data.platform.name
        for (let i = 0; i < data.setting.length; i++) {
            const d = data.setting[i];
            let item = Tools.AddChild(this.fanshui_list.content, this.fanshui_item)
            item.active = true
            Tools.SetChildText(item, "number", d.point)
            Tools.SetChildText(item, "pro", d.ratio + "%")
        }
    }

    closePlatFanshui(){
        this.plat_fanshui.active = false
    }

    switchTips() {
        this.pnl_tips.active = !this.pnl_tips.active
    }

    switchDaMa() {
        this.dama_pnl.active = !this.dama_pnl.active
        this.dama_arr.eulerAngles = new Vec3(0, 0, this.dama_pnl.active ? 180 : 0)
    }
}