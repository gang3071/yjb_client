import * as cc from 'cc';
import { Message } from '../../base/core/MessageMgr';
import { UIMgr } from '../../base/core/UIMgr';
import { BaseView } from '../../base/frame/BaseView';
import { UrlImageView } from '../../base/gui/urlImageView';
import { LocalizadManager } from '../../base/localized/LocalizedManager';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { LoadingViewWrap } from '../../base/utils/view/LoadingViewWrap';
import { MsgBoxWrap } from '../../base/utils/view/MsgBoxWrap';
import List from '../../common/scroll/List';
import { LabelConfig } from '../../config/LabelConfig';
import { UIConfig } from '../../config/UIConfig';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { UserInfo } from '../common/UserInfo';
import { SERVER_LIST } from '../../config/ServerConfig';
import { getCurEnv } from '../../config/Env';
import { utils } from '../../base/utils/utils';
import { MachineKeepTime } from './MachineKeepTime';
import { Vec2 } from 'cc';
import { UITransform } from 'cc';
import { Tween } from 'cc';
import { tween } from 'cc';
import { Label } from 'cc';
import { Tools } from '../../base/utils/util/Tools';
import { Vec3 } from 'cc';
const { ccclass, property } = cc._decorator;

@ccclass('MachineList')
export class MachineList extends BaseView {

    @property(List)
    deskList:List = null

    @property(cc.Label)
    labMoney:cc.Label = null

    @property(cc.Node)
    btnBack:cc.Node = null

    @property(cc.Node)
    kongXianCheckBox:cc.Node = null

    @property(cc.Node)
    machineListNode:cc.Node = null

    @property(cc.Sprite)
    imgAvatar:cc.Sprite = null

    @property(cc.Node)
    jiTaiL:cc.Node = null

    @property(cc.Node)
    jiTaiR:cc.Node = null
    /** 搜索框 */
    @property(cc.EditBox)
    search_edt:cc.EditBox = null

    @property(cc.ScrollView)
    jiTaiScroll:cc.ScrollView = null
    @property(cc.Prefab)
    jiTaiItem:cc.Prefab = null
    /** 最近游玩列表 */
    @property(cc.Node)
    recent_list:cc.Node = null
    /** 机台item */
    @property(cc.Node)
    machine_item:cc.Node = null
    /** 最近游玩箭头 */
    @property(cc.Node)
    recent_arr:cc.Node = null


    private gameData:any = null

    private clickRefresh:boolean = false

    private color1:cc.Color = new cc.Color(255,255,255)
    private color2:cc.Color = new cc.Color(255,155,11)

    private widget1:number = 300
    private widget2:number = 154

    private jiTaiSelectId:number = 0

    private bottomSelectIndex = 0
    private gameIndex:number = 0

    leftTimeFun:any = null

    start() {
        this.initEventListen()
        this.initData()
    }

    onEnable () {
        if (this.m_uidata.isSave) {
            this.gameData = this.m_uidata.succ
            this.machineListNode.active = false
            this.deskList.numItems = Math.ceil(this.m_uidata.succ.machines.length/2)
            this.deskList.updateAll()
            // this.deskList.node.parent.getComponent(cc.Widget).isAlignTop = true
            // this.deskList.node.parent.getComponent(cc.Widget).top = this.widget1
            // this.deskList.node.parent.getComponent(cc.Widget).updateAlignment()
        }else {
            this.requestData()
        }
    }

    onDisable () {
        this.cancelEventListen()
    }

    initEventListen () {
        Message.on("UpdateMoney",this.updateMoney,this)
        Message.on("LeaveMachine",this.leaveMachine,this)
        Message.on("GetActivityReward",this.getActivityReward,this)
        Message.on("MachineKeepTimeEnd",this.machineKeepTimeEnd,this)
    }

    cancelEventListen () {
        Message.off("UpdateMoney",this.updateMoney,this)
        Message.off("LeaveMachine",this.leaveMachine,this)
        Message.off("GetActivityReward",this.getActivityReward,this)
        Message.off("MachineKeepTimeEnd",this.machineKeepTimeEnd,this)
    }

    machineKeepTimeEnd (event:string,args:any) {
        
    }

    getActivityReward (event:string,args:any) {
        this.m_resLoader.loadPrefabNode(UIConfig.ef_num.path,(node:cc.Node) => {
            node.parent = this.labMoney.node.parent.parent
            console.log("",node)
            let lab = node.getChildByName("ani").getChildByName("mask").getChildByName("num").getComponent(cc.Label)
            let str = ""
            if (1 == args.length) {
                str = "000" + args
            }else if (2 == args.length) {
                str = "00" + args
            }else if (3 == args.length) {
                str = "0" + args
            }
            console.log("--getActivityReward--",args,str)
            lab.string = str
        })
    }

    leaveMachine () {
        UserInfo.requestUserInfo()
        if (!this.machineListNode.active) {
            this.close()
            UIMgr.getInstance().closeView(UIConfig.SelectMachine.path)
            return
            this.btnSaveMachineCall()
        }else {
            this.requestData()
        }
    }

    updateMoney () {
        this.labMoney.string = UserInfo.wallet_list.money
    }

    initData () {
        if (null != UserInfo.wallet_list) { this.updateMoney() }

        this.initAvatar()

        let lan = LocalizadManager.getInstance().getLanauge() - 1
        let lab = this.btnBack.getChildByName("Label").getComponent(Label)
        if (1 == UserInfo.clickSLorGZ) {
            lab.string = "SLOT"
        }else if (2 == UserInfo.clickSLorGZ) {
            lab.string = LabelConfig["钢  珠"][lan]
        }else if (3 == UserInfo.clickSLorGZ) {
            lab.string = LabelConfig["收  藏"][lan]
        }
    }

    beginSearch(){
        this.switchRecent(null, true)
    }

    btnSearch(){ 
        this.requestData()
        this.switchRecent(null, true)
    }

    btnReset(){
        this.search_edt.string = ""
        this.btnSearch()
    }


    requestData (callback?:any) {
        httpRequest.post("api/v1/machine-list",{
            game_id:this.m_uidata.game_id,
            is_free:this.m_uidata.is_free,
            cate_id:this.m_uidata.cate_id,
            page:this.m_uidata.page,
            size:this.m_uidata.size,
            name:this.search_edt.string,
            limit:4
        },(succ:any) => {
            if (this.clickRefresh){
                AlterTipsWrap.show("刷新成功")
                this.clickRefresh = false
            }
            this.gameData = succ
            console.log("---leng---",Math.ceil(succ.machines.length/2))
            if (this.deskList) {
                this.deskList.numItems = Math.ceil(succ.machines.length/2)
                this.deskList.updateAll()
                // this.deskList.scrollTo(0)
            }

            this.initRecentGame(succ.recent_machines)
            
            succ.machine_category.unshift({name:LabelConfig["全部"][LocalizadManager.getInstance().getLanauge()-1],id:0})

            if (this.jiTaiScroll) {
                let node = this.jiTaiScroll.node.getChildByName("view").getChildByName("content")
                if (0 == node.children.length) {
                    node.removeAllChildren()
                    for (let i=0; i<succ.machine_category.length; i++) {
                        let item = cc.instantiate(this.jiTaiItem)
                        item.parent = node
                        item.getChildByName("name").getComponent(cc.Label).string = this.gameData.machine_category[item.getSiblingIndex()].name
                        this.scheduleOnce(() => {
                            let objWidth = item.getChildByName("name").getComponent(cc.UITransform).width
                            item.getComponent(cc.UITransform).width = objWidth >= 150 ? objWidth:150
                        },0.05)
                        
                        item.on(cc.Node.EventType.TOUCH_END,(target:cc.EventTouch) => {
                            let layout = this.jiTaiScroll.node.getChildByName("view").getChildByName("content")
                            for (let i=0; i<layout.children.length; i++) {
                                let itemTarget = layout.children[i]
                                itemTarget.getChildByName("img2").active = false
                                itemTarget.getChildByName("name").getComponent(cc.Label).color = this.color1
                            }
                            this.jiTaiSelectId = item.getSiblingIndex()
                            target.getCurrentTarget().getChildByName("img2").active = true
                            console.log("=====",item.getSiblingIndex())
                            item.getChildByName("name").getComponent(cc.Label).color = this.color2
                            this.m_uidata.cate_id = this.gameData.machine_category[item.getSiblingIndex()].id
                            let itemPos = target.getUILocation()
                            this.requestData()
                        })
                        if (i == this.jiTaiSelectId) {
                            item.getChildByName("img2").active = true
                            item.getChildByName("name").getComponent(cc.Label).color = this.color2
                        }
                    }
                }
            }
            if (callback) {
                callback(succ.machine_category.length)
            }
        })
    }

    /** 初始化最近游玩 */
    initRecentGame(dat){
        this.recent_list.destroyAllChildren()
        for (let i=0; i<dat.length; i++) {
            let item = Tools.AddChild(this.recent_list, this.machine_item)
            this.initRecentMachine(item, dat[i])
            item.active = true
        }
    }

    initRecentMachine(itemNode, data){
        if ("" != data.picture_url) { Tools.GetChildComp(itemNode, "img", UrlImageView).setUrl(data.picture_url)}
        Tools.SetChildText(itemNode, "bottom/lab", data.name)
        Tools.SetChildText(itemNode, "top/lab", `${data.odds_x}:${data.odds_y}`)
        Tools.SetTouchEndEvt(itemNode, () => {
            httpRequest.post("api/v1/machine-data-list",{
                label_id:data.id,
                odds_x:data.odds_x,
                odds_y:data.odds_y
            },(succ:any) => {
                if (1 == data.type) {
                    UserInfo.clickSLorGZ = 1
                    LoadingViewWrap.show()
                    UIMgr.getInstance().openSingleView(UIConfig.MachineDetail.path,{machineData:data,machineList:succ.machine})
                }else {
                    UserInfo.clickSLorGZ = 2
                    LoadingViewWrap.show()
                    UIMgr.getInstance().openSingleView(UIConfig.MachineDetail.path,{machineData:data,machineList:succ.machine})
                }
            })
        })
    }

    /** 显示最近游玩 */
    switchRecent(evt, close:boolean = false){
        this.recent_list.active = close ? false : !this.recent_list.active
        // 箭头方向
        this.recent_arr.eulerAngles = new Vec3(0, 0, this.recent_list.active ? 0 : 90)
        // 游戏列表移动
        this.deskList.node.setPosition(new Vec3(0,this.recent_list.active ? -320 : 0, 0))
    }

    checkBox (toggle:cc.Toggle) {
        this.m_uidata.is_free = toggle.isChecked?1:0
        this.requestData()
    }

    btnRefreshCall () {
        if (this.clickRefresh) {return}
        this.clickRefresh = true
        if (!this.machineListNode.active) {
            this.btnSaveMachineCall()
        }else {
            this.requestData()
        }
        
    }

    initAvatar () {
        if ("" == UserInfo.avatar) {return}
        if (UserInfo.avatar.indexOf("http") !== -1) {
            this.imgAvatar.getComponent(UrlImageView).setUrl(UserInfo.avatar)
        }else {
            this.imgAvatar.getComponent(UrlImageView).setUrl(SERVER_LIST[getCurEnv()]+UserInfo.avatar)
        }
    }

    btnSaveMachineCall () {
        httpRequest.post("api/v1/favorite-machine-list",{
            is_free:this.m_uidata.is_free,
            page:1,
            size:100
        },(succ:any) => {
            if (this.clickRefresh){
                AlterTipsWrap.show("刷新成功")
                this.clickRefresh = false
            }
            this.gameData = succ
            // this.kongXianCheckBox.active = false
            this.machineListNode.active = false
            this.deskList.numItems = Math.ceil(succ.machines.length/2)
            this.deskList.updateAll()
        },(fail:any) => {
            
        })
    }

    btnSaveMoney () {
        if (!UserInfo.has_set_play_password) {
            AlterTipsWrap.show("请设置支付密码")
            return
        }
        LoadingViewWrap.show()
        UIMgr.getInstance().openSingleView(UIConfig.SaveMoney.path)
    }

    btnTestClick () {
        LoadingViewWrap.show()
        UIMgr.getInstance().openSingleView(UIConfig.SLGame.path)
    }

    btnBackCall () {
        this.close()
        UIMgr.getInstance().closeView(UIConfig.SelectMachine.path)
        UserInfo.requestUserInfo()
    }

    deskListRender (item: cc.Node, idx: number) {
        for (let i=0; i<2; i++) {
            let data = this.gameData.machines[Math.abs(idx)*2 + i]
            let itemNode = item.getChildByName("item"+i).getChildByName("item")
            item.getChildByName("item"+i).active = true
            if (data != null) {
                this.initMachine(itemNode, data)
            }else {
                item.getChildByName("item"+i).active = false
            }
        }
    }

    /** 初始化机台 */
    initMachine(itemNode, data){
        if ("" != data.picture_url) { Tools.GetChildComp(itemNode, "img", UrlImageView).setUrl(data.picture_url) }
        Tools.SetChildText(itemNode, "bifen_n/labLv", `${data.odds_x}:${data.odds_y}`)
        Tools.SetChildText(itemNode, "Layout1/labTai", (Number(data.use_num) + Number(data.idle_num)).toString())
        Tools.SetChildText(itemNode, "Layout3/labKong", data.idle_num)
        Tools.SetChildText(itemNode, "labTypeValue/value", data.point)
        Tools.SetChildText(itemNode, "labTitleNode/labTitle", data.name)
        Tools.SetChildText(itemNode, "Layout2/labZhuan", data.turn_used_point)

        //Tools.SetChildText(itemNode, "Layout0/labPoint", data.point)
        this.scheduleOnce(() => {
            let labTitle = itemNode.getChildByPath("labTitleNode/labTitle")
            let wid1 = labTitle.getComponent(UITransform).width
            Tween.stopAllByTarget(labTitle)
            labTitle.setPosition(cc.v3(0,0,0))
            if (400 < wid1) {
                labTitle.setPosition(cc.v3(wid1/2+200,0,0))
                tween(labTitle)
                    .to(5,{position:cc.v3(-wid1/2-200,0,0)})
                    .call(() => {
                        labTitle.setPosition(cc.v3(wid1/2+200,0,0))
                    })
                    .union()
                    .repeatForever()
                    .start()
            }},0)
        this.scheduleOnce(() => {
            let labTypeValue = itemNode.getChildByPath("labTypeValue/value")
            let wid1 = labTypeValue.getComponent(UITransform).width
            Tween.stopAllByTarget(labTypeValue)
            labTypeValue.setPosition(cc.v3(0,0,0))
            if (120 < wid1) {
                labTypeValue.setPosition(cc.v3(wid1/2+60,0,0))
                tween(labTypeValue)
                    .to(5,{position:cc.v3(-wid1/2-60,0,0)})
                    .call(() => {
                        labTypeValue.setPosition(cc.v3(wid1/2+60,0,0))
                    })
                    .union()
                    .repeatForever()
                    .start()
            }
        },0)

        if (1 == data.type) {
            Tools.SetChildText(itemNode, "labTypeValue/value", data.courtyard)
            Tools.SetChildText(itemNode, "labType", Tools.GetLocalized("天井"))
            //Tools.SetChildText(itemNode, "Layout2/desc", Tools.GetLocalized("分"))
        }else if (2 == data.type) {
            Tools.SetChildText(itemNode, "labTypeValue/value", data.correct_rate)
            Tools.SetChildText(itemNode, "labType", Tools.GetLocalized("确率"))
            //Tools.SetChildText(itemNode, "Layout2/desc", Tools.GetLocalized("转"))
        }
        
        Tools.SetTouchEndEvt(itemNode,() => {
            let fun = () => {
                httpRequest.post("api/v1/machine-data-list",{
                    label_id:data.id,
                    odds_x:data.odds_x,
                    odds_y:data.odds_y
                },(succ:any) => {
                    if (1 == data.type) {
                        UserInfo.clickSLorGZ = 1
                        LoadingViewWrap.show()
                        UIMgr.getInstance().openSingleView(UIConfig.MachineDetail.path,{machineData:data,machineList:succ.machine})
                    }else {
                        UserInfo.clickSLorGZ = 2
                        LoadingViewWrap.show()
                        UIMgr.getInstance().openSingleView(UIConfig.MachineDetail.path,{machineData:data,machineList:succ.machine})
                    }
                })
            }
            fun()
        })
    }

    jiTaiListRender (item: cc.Node, idx: number) {
        let name = item.getChildByName("name").getComponent(cc.Label)
        name.string = this.gameData.machine_category[Math.abs(idx)].name
        if (this.jiTaiSelectId == Math.abs(idx)) {
            // item.getChildByName("img2").active = true
            item.getChildByName("name").getComponent(cc.Label).color = this.color2
        }else {
            // item.getChildByName("img2").active = false
            item.getChildByName("name").getComponent(cc.Label).color = this.color1
        }
    }

    onDeskListItemClick (item: cc.Node, selectedId: number, lastSelectedId: number, val: number) {
        console.log("===122")
    }

    jiTaiScrollEvent (scrollview:cc.ScrollView, eventType:number, customEventData:any) {
        let offset = scrollview.getScrollOffset()
        let maxOffset = scrollview.getMaxScrollOffset()
        if (20 >= Math.abs(offset.x)) {
            this.jiTaiL.active = false
            this.jiTaiR.active = true
        }else if (Math.abs(offset.x) >= (Math.abs(maxOffset.x) - 50)) {
            this.jiTaiL.active = true
            this.jiTaiR.active = false
        }else {
            this.jiTaiL.active = true
            this.jiTaiR.active = true
        }
    }

    btnLeftCall () {
        // this.jiTaiScroll.scrollToOffset(cc.v2(this.jiTaiScroll.getScrollOffset().x - 100, 0))
        // this.jiTaiScrollEvent(this.jiTaiScroll,0,0)
        if (this.jiTaiSelectId == 0) {
            return
        }
        // let offset = this.jiTaiScroll.getScrollOffset().x - 150
        // if (offset >= this.jiTaiScroll.getMaxScrollOffset().x) {
        //     offset = this.jiTaiScroll.getMaxScrollOffset().x
        // }
        let offset = Math.abs(this.jiTaiScroll.getScrollOffset().x) - 150
        if (offset >= Math.abs(this.jiTaiScroll.getMaxScrollOffset().x)) {
            offset = Math.abs(this.jiTaiScroll.getMaxScrollOffset().x)
        }
        this.jiTaiScroll.scrollToOffset(new Vec2(offset,0),0.2)
        let layout = this.jiTaiScroll.content
        for (let i=0; i<layout.children.length; i++) {
            let itemTarget = layout.children[i]
            itemTarget.getChildByName("img2").active = false
            itemTarget.getChildByName("name").getComponent(cc.Label).color = this.color1
        }
        this.jiTaiSelectId -= 1
        let item = layout.children[this.jiTaiSelectId]
        let target = layout.children[this.jiTaiSelectId]
        target.getChildByName("img2").active = true
        item.getChildByName("name").getComponent(cc.Label).color = this.color2
        this.m_uidata.cate_id = this.gameData.machine_category[item.getSiblingIndex()].id

        this.requestData()
    }

    btnRightCall () {
        if (this.jiTaiSelectId == this.jiTaiScroll.content.children.length - 1) {
            return
        }
        let offset = Math.abs(this.jiTaiScroll.getScrollOffset().x) +150
        if (offset >= Math.abs(this.jiTaiScroll.getMaxScrollOffset().x)) {
            offset = Math.abs(this.jiTaiScroll.getMaxScrollOffset().x)
        }
        this.jiTaiScroll.scrollToOffset(new Vec2(offset,0),0.2)
        let layout = this.jiTaiScroll.content
        for (let i=0; i<layout.children.length; i++) {
            let itemTarget = layout.children[i]
            itemTarget.getChildByName("img2").active = false
            itemTarget.getChildByName("name").getComponent(cc.Label).color = this.color1
        }
        this.jiTaiSelectId += 1
        let item = layout.children[this.jiTaiSelectId]
        let target = layout.children[this.jiTaiSelectId]
        target.getChildByName("img2").active = true
        item.getChildByName("name").getComponent(cc.Label).color = this.color2
        this.m_uidata.cate_id = this.gameData.machine_category[item.getSiblingIndex()].id
        
        this.requestData()
    }
}


