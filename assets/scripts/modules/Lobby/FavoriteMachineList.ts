import * as cc from 'cc';
import { BaseView } from '../../base/frame/BaseView';
import { Message } from '../../base/core/MessageMgr';
import { UserInfo } from '../common/UserInfo';
import { UIMgr } from '../../base/core/UIMgr';
import { UIConfig } from '../../config/UIConfig';
import { Label } from 'cc';
import { LocalizadManager } from '../../base/localized/LocalizedManager';
import { LabelConfig } from '../../config/LabelConfig';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { UrlImageView } from '../../base/gui/urlImageView';
import { SERVER_LIST } from '../../config/ServerConfig';
import { getCurEnv } from '../../config/Env';
import { LoadingViewWrap } from '../../base/utils/view/LoadingViewWrap';
import { UITransform } from 'cc';
import { Tween } from 'cc';
import { tween } from 'cc';
import { Vec2 } from 'cc';
import List from '../../common/scroll/List';
import { ScrollView } from 'cc';
import { Tools } from '../../base/utils/util/Tools';
import { MachineKeepTime } from './MachineKeepTime';
import { v3 } from 'cc';
import { utils } from '../../base/utils/utils';
const { ccclass, property } = cc._decorator;

@ccclass('FavoriteMachineList')
export class FavoriteMachineList extends BaseView {

    @property(ScrollView)
    deskList:ScrollView = null

    @property(cc.Label)
    labMoney:cc.Label = null

    @property(cc.Node)
    btnBack:cc.Node = null

    @property(cc.Sprite)
    imgAvatar:cc.Sprite = null

    @property(cc.Prefab)
    youxizhong_prefab: cc.Prefab = null;
    @property(cc.Prefab)
    dangqianzhuanshu_prefab: cc.Prefab = null;
    @property(cc.Prefab)
    baoliu_prefab: cc.Prefab = null;
    @property(cc.Prefab)
    otherstate_prefab: cc.Prefab = null;
    @property(cc.Prefab)
    listItem_prefab: cc.Prefab = null;

    weihuzhong = "Localized/weihuzhong"
    kaijiangzhong = "Localized/kaijiangzhong"
    baoliuzhong = "Localized/baoliu"
    benrenshiyong = "Localized/benrenshiyong"
    lixian = "Localized/lixian"

    lanArr = ["cn","tw","en","jp"]

    lan = 0


    private gameData:any = null

    private clickRefresh:boolean = false

    start() {
        this.lan = LocalizadManager.getInstance().getLanauge() - 1
        let content = this.deskList.content
        content.setPosition(v3(0,0,0))
        this.initEventListen()
        this.initData()
    }

    onEnable () {

    }

    onDisable () {
        this.cancelEventListen()
    }

    initEventListen () {
        Message.on("UpdateMoney",this.updateMoney,this)
        Message.on("LeaveMachine",this.leaveMachine,this)
        Message.on("MachineKeepTimeEnd",this.machineKeepTimeEnd,this)
    }

    cancelEventListen () {
        Message.off("UpdateMoney",this.updateMoney,this)
        Message.off("LeaveMachine",this.leaveMachine,this)
        Message.off("MachineKeepTimeEnd",this.machineKeepTimeEnd,this)
    }

    machineKeepTimeEnd (event:string,args:any) {
        
    }


    leaveMachine () {
        UserInfo.requestUserInfo()
        this.close()
        UIMgr.getInstance().closeView(UIConfig.SelectMachine.path)
    }

    updateMoney () {
        this.labMoney.string = UserInfo.wallet_list.money
    }

    initData () {
        if (null != UserInfo.wallet_list) {
            this.updateMoney()
        }

        this.initAvatar()

        this.deskListRender()
    }



    btnRefreshCall () {
        if (this.clickRefresh) {return}
        this.clickRefresh = true
        httpRequest.post("api/v1/favorite-machine-list",{
            is_free:0,
            page:1,
            size:100
        },(succ:any) => {
            if (this.clickRefresh){
                AlterTipsWrap.show("刷新成功")
                this.clickRefresh = false
            }
            this.m_uidata = succ.machines
        },(fail:any) => {
            
        })
        
    }

    initAvatar () {
        if ("" == UserInfo.avatar) {return}
        if (UserInfo.avatar.indexOf("http") !== -1) {
            this.imgAvatar.getComponent(UrlImageView).setUrl(UserInfo.avatar)
        }else {
            this.imgAvatar.getComponent(UrlImageView).setUrl(SERVER_LIST[getCurEnv()]+UserInfo.avatar)
        }
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

    deskListRender () {
        for (let j=0; j<Math.ceil(this.m_uidata.length/2); ++j) {
            let item = cc.instantiate(this.listItem_prefab)
            item.parent = this.deskList.content
            for (let i=0; i<2; i++) {
                let data = this.m_uidata[Math.abs(j)*2 + i]
                let itemNode = item.getChildByName("item"+i).getChildByName("item")
                item.getChildByName("item"+i).active = true
                if (data != null) {
                    let labCode = itemNode.getChildByName("labID").getComponent(cc.Label)
    
                    let labTitle = itemNode.getChildByName("labTitleNode").getChildByName("labTitle").getComponent(cc.Label)
                    let lv = itemNode.getChildByName("bifen_n").getChildByName("labLv").getComponent(cc.Label)
    
                    let img = itemNode.getChildByName("img")
    
                    let isClick = false
    
                    if ("" != data.picture_url) {
                        img.getComponent(UrlImageView).setUrl(data.picture_url)
                    }
    
                    labTitle.string = data.name
    
                    labCode.string = data.code
    
                    if (1 == data.type) {
                        lv.string = `${data.odds_x}:${data.odds_y}`
                    }else if (2 == data.type) {
                        lv.string = `${data.odds_x}`
                    }
                    
                    if (data.gaming_user_id == UserInfo.id) {
                        // item.getChildByName("img1").active = false
                        // item.getChildByName("img2").active = false
                    }
                    
                    this.scheduleOnce(() => {
                        let wid1 = labTitle.getComponent(UITransform).width
                        Tween.stopAllByTarget(labTitle.node)
                        labTitle.node.setPosition(cc.v3(0,0,0))
                        if (400 < wid1) {
                                labTitle.node.setPosition(cc.v3(wid1/2+200,0,0))
                                tween(labTitle.node)
                                    .to(5,{position:cc.v3(-wid1/2-200,0,0)})
                                    .call(() => {
                                        labTitle.node.setPosition(cc.v3(wid1/2+200,0,0))
                                    })
                                    .union()
                                    .repeatForever()
                                    .start()
                        }
                    },0)
    
                    // 状态预制件
                    var preb : cc.Node = null
                    // 离线状态
                    if ("offline" == data.online_status) {
                        preb = Tools.AddChild(itemNode, this.otherstate_prefab)
                        Tools.SetChildSprite(preb, "img_state", this.lanArr[this.lan], this.lixian)
                    }
                    // 维护中
                    else if(1 == data.maintaining) {
                        preb = Tools.AddChild(itemNode, this.otherstate_prefab)
                        Tools.SetChildSprite(preb, "img_state", this.lanArr[this.lan], this.weihuzhong)
                    }
                    // 开奖中
                    else if (1 == data.reward_status) {
                        preb = Tools.AddChild(itemNode, this.otherstate_prefab)
                        Tools.SetChildSprite(preb, "img_state", this.lanArr[this.lan], this.kaijiangzhong)
                        isClick = true
                    }
                    // 保留中
                    else if (0 != Number(data.keep_seconds) && 1 == data.keeping) {
                        preb = Tools.AddChild(itemNode, this.baoliu_prefab)
                        preb.getChildByPath("Layout/Layout/Label").getComponent(cc.Label).string = utils.secondsToHMS(Number(data.keep_seconds))
                        Tools.SetChildSprite(preb, "Layout/img_state", this.lanArr[this.lan],this.baoliuzhong, () => {
                            let time = Tools.GetChildComp(preb, "Layout/Layout/Label", MachineKeepTime)
                            if (time) { time.setMachineId(data.id) }
                            // time.setLeftTime(Number(data.keep_seconds))
                        })
                        if (data[i]?.gaming_user_id && UserInfo.id == data[i].gaming_user_id) {
                            isClick = true
                        }
                    }
                    // 本人使用中
                    else if (UserInfo.id == data.gaming_user_id) {
                        preb = Tools.AddChild(itemNode, this.otherstate_prefab)
                        Tools.SetChildSprite(preb, "img_state", this.lanArr[this.lan],this.benrenshiyong)
                        isClick = true
                    }
                    // 游戏中
                    else if (UserInfo.id != data.gaming_user_id && 0 != data.gaming_user_id) {
                        preb = Tools.AddChild(itemNode, this.youxizhong_prefab)
                    }
                    // 当前转数
                    else {
                        preb = Tools.AddChild(itemNode, this.dangqianzhuanshu_prefab)
                        Tools.SetChildText(preb, "Label", data.now_turn)
                        
                        isClick = true
                    }
                    preb.setPosition(cc.v3(0,0,0))
    
                    itemNode.off(cc.Node.EventType.TOUCH_END)
                    if (isClick) {
                        itemNode.on(cc.Node.EventType.TOUCH_END,() => {
                            LoadingViewWrap.show()
                            httpRequest.post("api/v1/machine-info",{
                                machine_id:data.id,
                            },(succ:any) => {
                                if (1 == data.type) {
                                    UIMgr.getInstance().openSingleView(UIConfig.SLGame.path,{machine_id:data.id,reward_status:data.reward_status,machineInfo:succ})
                                }else if (2 == data.type) {
                                    UIMgr.getInstance().openSingleView(UIConfig.GZGame.path,{machine_id:data.id,reward_status:data.reward_status,machineInfo:succ})
                                }
                                
                            },(fail:any) => {
                                
                            })
                        })
                    }
    
                    
                }else {
                    item.getChildByName("item"+i).active = false
                }
            }
        }  
    }

}


