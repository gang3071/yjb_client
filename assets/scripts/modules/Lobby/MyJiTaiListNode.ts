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
import { MachineKeepTime } from './MachineKeepTime';
import { UITransform } from 'cc';
import { Tween } from 'cc';
import { tween } from 'cc';
import { Sprite } from 'cc';
import { Tools } from '../../base/utils/util/Tools';
import { SpriteFrame } from 'cc';
import { ScrollView } from 'cc';
import { v3 } from 'cc';
import { utils } from '../../base/utils/utils';

const { ccclass, property } = cc._decorator;

@ccclass('MyJiTaiListNode')
export class MyJiTaiListNode extends BaseView {

    @property(ScrollView)
    deskList:ScrollView = null

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

    private deskListData:any = null
    
    start() {
        this.lan = LocalizadManager.getInstance().getLanauge() - 1
        let content = this.deskList.content
        content.setPosition(v3(0,0,0))
        this.reqData()
    }

    btnDeskListRefreshCall () {
        this.reqData(true)
    }

    reqData (isRefresh=false) {
        httpRequest.post("api/v1/playing-machine",{
                    
        },(succ:any) => {
            let content = this.deskList.content
            content.removeAllChildren()
            this.deskListData = succ.playing_machine
            // if (0 == succ.playing_machine.length) {
            //     AlterTipsWrap.show("暂无数据")
            //     return
            // }
            if (isRefresh) {
                AlterTipsWrap.show("刷新成功")
            }
            UserInfo.playingMachineInfo = succ.playing_machine
            this.deskListRender()
        },(fail:any) => {
            
        })
    }

    btnMachineMoreCall () {
        LoadingViewWrap.show()
        UIMgr.getInstance().openSingleView(UIConfig.MachineMore.path,{data:{type:5}},null,null,() => {
            console.log("=gz==btnMoreMachineCall===")
            
            Message.dispatchEvent("StartLoading")
        })
    }

    deskListRender () {
        for (let j=0; j<Math.ceil(this.deskListData.length/2); ++j) {
            let item = cc.instantiate(this.listItem_prefab)
            item.parent = this.deskList.content
            for (let i=0; i<2; i++) {
                let data = this.deskListData[Math.abs(j)*2 + i]
                let itemNode = item.getChildByName("item"+i).getChildByName("item")
                item.getChildByName("item"+i).active = true
                if (data != null) {
                    let labCode = itemNode.getChildByName("labID").getComponent(cc.Label)
    
                    let labTitle = itemNode.getChildByName("labTitleNode").getChildByName("labTitle").getComponent(cc.Label)
                    let lv = itemNode.getChildByName("bifen_n").getChildByName("labLv").getComponent(cc.Label)
    
                    let img = itemNode.getChildByName("img")
    
    
                    if ("" != data.picture_url) {
                        img.getComponent(UrlImageView).setUrl(data.picture_url)
                    }
    
                    labTitle.string = data.machine_label.name
    
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
                        if (UserInfo.id == data.gaming_user_id) {
                            
                        }
                    }
                    // 开奖中
                    else if (1 == data.reward_status) {
                        preb = Tools.AddChild(itemNode, this.otherstate_prefab)
                        Tools.SetChildSprite(preb, "img_state", this.lanArr[this.lan], this.kaijiangzhong)
                    }
                    // 保留中
                    else if  (0 != Number(data.keep_seconds) && 1 == data.keeping) {
                        preb = Tools.AddChild(itemNode, this.baoliu_prefab)
                        preb.getChildByPath("Layout/Layout/Label").getComponent(cc.Label).string = utils.secondsToHMS(Number(data.keep_seconds))
                        Tools.SetChildSprite(preb, "Layout/img_state", this.lanArr[this.lan],this.baoliuzhong, () => {
                            let time = Tools.GetChildComp(preb, "Layout/Layout/Label", MachineKeepTime)
                            if (time) { time.setMachineId(data.id) }
                            // time.setLeftTime(Number(data.keep_seconds))                            
                        })
                    }
                    // 本人使用中
                    else if (UserInfo.id == data.gaming_user_id) {
                        preb = Tools.AddChild(itemNode, this.otherstate_prefab)
                        Tools.SetChildSprite(preb, "img_state", this.lanArr[this.lan],this.benrenshiyong)
                    }
                    // 游戏中
                    else if (UserInfo.id != data.gaming_user_id && 0 != data.gaming_user_id) {
                        preb = Tools.AddChild(itemNode, this.youxizhong_prefab)
                    }
                    // 当前转数
                    else {
                        preb = Tools.AddChild(itemNode, this.dangqianzhuanshu_prefab)
                        Tools.SetChildText(preb, "Label", data.now_turn)
                    }
                    preb.setPosition(cc.v3(0,0,0))
    
    
    
    
                    itemNode.off(cc.Node.EventType.TOUCH_END)
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
                        
                        // let fun = () => {
                        //     httpRequest.post("api/v1/machine-data-list",{
                        //         label_id:data.id,
                        //         odds_x:data.odds_x,
                        //         odds_y:data.odds_y
                        //     },(succ:any) => {
                        //         if (1 == data.type) {
                        //             UserInfo.clickSLorGZ = 1
                        //             LoadingViewWrap.show()
                        //             UIMgr.getInstance().openSingleView(UIConfig.MachineDetail.path,{machineData:data,machineList:succ.machine})
                        //         }else {
                        //             UserInfo.clickSLorGZ = 2
                        //             LoadingViewWrap.show()
                        //             UIMgr.getInstance().openSingleView(UIConfig.MachineDetail.path,{machineData:data,machineList:succ.machine})
                        //         }
                        //     },(fail:any) => {
                                
                        //     })
                        // }
                        // fun()
                    })
                }else {
                    item.getChildByName("item"+i).active = false
                }
            }
        }  
    }

    update(deltaTime: number) {
        
    }
}


