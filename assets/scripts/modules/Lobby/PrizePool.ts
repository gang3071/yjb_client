import * as cc from 'cc';
import { Message } from '../../base/core/MessageMgr';
import { BaseView } from '../../base/frame/BaseView';
import { MsgBoxWrap } from '../../base/utils/view/MsgBoxWrap';
import { UserInfo } from '../common/UserInfo';
import { LabelConfig } from '../../config/LabelConfig';
import { LocalizadManager } from '../../base/localized/LocalizedManager';
import { Tools } from '../../base/utils/util/Tools';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { ScrollView, Button, Vec3 } from 'cc';
import { UITransform } from 'cc';
import { Tween } from 'cc';
import { tween } from 'cc';
const { ccclass, property } = cc._decorator;

const ALL_TYPE = { name : "全 部", id : "0"}

@ccclass('PrizePool')
export class PrizePool extends BaseView {
    /** 顶部标题 */
    @property(cc.Node)
    btnBack:cc.Node = null
    /** 顶部数字 */
    @property(cc.Node)
    labAllMoneyNode:cc.Node = null
    /** 彩金列表 */
    @property([cc.Node])
    jpNode:cc.Node[] = []
    /** 总彩金池 */
    @property(cc.Label)
    labAllMoney:cc.Label = null
    /** 历史记录 */
    @property(cc.ScrollView)
    grid_history:cc.ScrollView = null
    /** 历史记录item */
    @property(cc.Node)
    hisItem:cc.Node = null
    /** 历史记录 */
    @property(cc.ScrollView)
    grid_type:cc.ScrollView = null
    /** 历史记录item */
    @property(cc.Node)
    typeItem:cc.Node = null

    private data:any = null
    private allMoney:number = 0
    private dtTime:number = 0
    // 当前页面
    private page:number = 1
    // 每页数量
    private size:number = 10
    // 初始彩金数据
    private originalData:any = null
    /** 当前筛选类型 */
    private typeid = "0"

    start() {
        this.page = 1
        this.typeid = "0"
        this.btnBack.getChildByName("img1").active = UserInfo.clickSLorGZ == 1
        this.btnBack.getChildByName("img2").active = UserInfo.clickSLorGZ == 2
        this.requestData()
        this.reqHisData()
    }

    onEnable () {
        Message.on("PrizePoolData",this.updatePrizePool,this)
        Message.on("PrizePoolChange",this.prizePoolChange,this)
        this.grid_history.node.on(ScrollView.EventType.SCROLL_TO_BOTTOM, this.reqHisData, this);
    }

    onDisable () {
        Message.off("PrizePoolData",this.updatePrizePool,this)
        Message.off("PrizePoolChange",this.prizePoolChange,this)
        this.grid_history.node.off(ScrollView.EventType.SCROLL_TO_BOTTOM, this.reqHisData, this);
    }

    /** 请求数据 */
    requestData () {
        httpRequest.post("api/v1/lottery-list", {type:UserInfo.clickSLorGZ},
            (succ:any) => {
                Message.dispatchEvent("PrizePoolData", succ)
            }
        )
    }

    /** 请求历史记录 */
    reqHisData(){
        Tools.httpReq("lottery-record-list",  {type:UserInfo.clickSLorGZ, page:this.page, size:this.size, id:this.typeid}, 
            (succ:any) => {
            if (this.page == 1) this.grid_history.content.destroyAllChildren()
            this.grid_type.content.destroyAllChildren()
            this.initTypeGrid(succ.lottery_list)
            if (0 < succ.lottery_record_list.length) { 
                this.page += 1 
                this.initHistory(succ.lottery_record_list)
            }
        })
    }
    
    /** 历史记录初始化 */
    initHistory(dat){
        for (let i=0; i < dat.length; i++) {
            const d = dat[i]
            let item = Tools.AddChild(this.grid_history.content, this.hisItem)
            Tools.SetSpriteFrame(item, "liebiao_di" + i % 2, "Lobby/img/PrizePool")
            item.active = true
            Tools.SetChildText(item, "labName", d.player_name)
            Tools.SetChildText(item, "labType", d.lottery_name)
            Tools.SetChildText(item, "labMoney", d.amount)
            Tools.SetChildText(item, "labTime", d.created_at)
            Tools.SetChildText(item, "nameMask/labMachineName", d.machine_name)
            this.scheduleOnce(() => {
                let lab = item.getChildByPath("nameMask/labMachineName")
                let wid1 = Tools.GetChildComp(item, "nameMask/labMachineName", UITransform).width
                Tween.stopAllByTarget(lab)
                lab.setPosition(cc.v3(0,0,0))
                if (150 < wid1) {
                    lab.setPosition(cc.v3(wid1/2+75,0,0))
                    tween(lab)
                        .to(5,{position:cc.v3(-wid1/2-75,0,0)})
                        .call(() => {
                            lab.setPosition(cc.v3(wid1/2+75,0,0))
                        })
                        .union()
                        .repeatForever()
                        .start()
                }
            },0)
            Tools.SetChildText(item, "labMachineCate", d.cate_name)
        }
    }

    initTypeGrid(dat){
        // 全部按钮添加
        let i = Tools.AddChild(this.grid_type.content, this.typeItem)
        this.initTypeItem(i, ALL_TYPE)
        for (let i=0; i<dat.length; i++) {
            let item = Tools.AddChild(this.grid_type.content, this.typeItem)
            this.initTypeItem(item, dat[i])
        }
    }

    initTypeItem(item, dat){
        item.active = true
        Tools.SetChildText(item, "lab", dat.name)
        item.getComponent(Button).clickEvents[0].customEventData = dat
    }

    onClickType(evt, param){
        this.typeid = param.id
        this.page = 1 
        this.reqHisData()
        this.switchTypeSelect()
        Tools.SetChildText(this.grid_type.node.parent, "type", param.name)
    }

    switchTypeSelect(){
        this.grid_type.node.active = !this.grid_type.node.active
        this.grid_type.node.parent.getChildByPath("arr").eulerAngles = new Vec3(0, 0, this.grid_type.node.active ? 0 : 90)
    }

    prizePoolChange (event:string, args:any) {
        if (null == this.data) { return }
        let num = 1 == UserInfo.clickSLorGZ ? Number(args.slot_amount) : Number(args.jack_amount)

        if (this.allMoney != num) {
            this.updateAllLabel(this.labAllMoney, num - this.allMoney)
            this.allMoney = num
        }
        
        this.originalData = []
        for (let i=0; i<this.data.lottery_list.length; i++) {
            let nums = ((Number(this.data.lottery_list[i].rate)/100) * num).toFixed(2)
            this.originalData[i] = nums
            Tools.SetChildText(this.jpNode[i], "labNums", nums)
            Tools.SetChildText(this.jpNode[i], "times", this.data.lottery_list[i].lottery_times)
        }
    }

    updatePrizePool (event:string, args:any) {
        this.data = args
        this.originalData = []
        for (let i=0; i<args.lottery_list.length; i++) {
            Tools.SetChildText(this.jpNode[i], "name_bg/name", args.lottery_list[i].name)
            let nums = ((Number(args.lottery_list[i].rate)/100) * Number(args.lottery_pool.amount)).toFixed(2)
            this.originalData[i] = nums
            Tools.SetChildText(this.jpNode[i], "labNums", nums)
            Tools.SetChildText(this.jpNode[i], "times", args.lottery_list[i].lottery_times + Tools.GetLocalized("次"))
        }
        if ("0000000000" == this.labAllMoney.string) {
            this.allMoney = Number(args.lottery_pool.amount)
            this.updateAllLabel(this.labAllMoney, Number(args.lottery_pool.amount))
        }
    }

    updateAllLabel (target:cc.Label, endNums:number, time:number=3) {
        let obj:any = {}
        
        obj.num = 0
        let temp = ""
        for (let i=0; i<10; i++) {
            temp += Tools.GetChildComp(this.labAllMoneyNode, `num_${i}/num`, cc.Label).string
        }
        console.log("-----------",temp,endNums)
        let oriValue = Number(temp)
        cc.tween(obj).to(time, {num:endNums}, {progress:(start, end, current, ratio) => {
                let str = (oriValue + (start + (end + start) * ratio)).toFixed(1)
                if (this.labAllMoney) {
                    for (let i=0; i<str.length; i++) {
                        let lab = this.labAllMoneyNode.children[9-i]
                        Tools.GetChildComp(lab, "num", cc.Label).string = str[str.length-i-1]
                    }
                }
                return start + (end + start) * ratio
            }}).start()
    }

    updateLabel (target:cc.Label,endNums:number,time:number=3) {
        let obj:any = {}
        
        obj.num = 0
        // target.string = obj.num
        let oriValue = Number(target.string)
        cc.tween(obj).to(time,{num:endNums},{progress:(start, end, current, ratio) => {
                target.string = (oriValue + (start + (end + start) * ratio)).toFixed(1)
                return start + (end + start) * ratio
            }})
            .start()
    }

    btnCloseCall () { this.close() }

    btnJPRuleCall (target:cc.EventTouch, custom:string) {
        let index = Number(custom)
        let data = this.data.lottery_list[index]
        if (data) {
            // let str1 = "彩金奖励：彩金池金额的 " + Number(data.rate) + "%"
            let str2 = ""
            let lang = LocalizadManager.getInstance().getLanauge()-1
            if (1 == data.lottery_type) {
                if (1 == UserInfo.clickSLorGZ) {
                    str2 = LabelConfig["触发条件：计分板总分达到 "][lang] + data.condition + LabelConfig["分"][lang]
                }else if (2 == UserInfo.clickSLorGZ) {
                    str2 = LabelConfig["触发条件：单次下珠数达到 "][lang]+ data.condition + LabelConfig["珠"][lang]
                }
            }else if (2 == data.lottery_type) {
                str2 = LabelConfig["随机触发"][lang]
            }
            MsgBoxWrap.showConfirmCancel(str2, ()=>{}, null)
        }
    }

    update (dt) {
        this.dtTime += dt
        if (1 <= this.dtTime) {
            this.dtTime = 0
            for (let i=0; i<this.jpNode.length; i++) {
                let r = this.originalData[i] * (Math.random() * 0.2 + 0.9)
                Tools.SetChildText(this.jpNode[i], "labNums", r.toFixed(2))
            }
        }
    }
}