import * as cc from 'cc';
import { BaseView } from '../../base/frame/BaseView';
import { ScrollView } from 'cc';
import { Prefab } from 'cc';
import { Label } from 'cc';
import { Sprite } from 'cc';
import { LocalizadManager } from '../../base/localized/LocalizedManager';
import { UserInfo } from '../common/UserInfo';
import { MachineKeepTime } from './MachineKeepTime';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { UIMgr } from '../../base/core/UIMgr';
import { UIConfig } from '../../config/UIConfig';
import { LabelConfig } from '../../config/LabelConfig';
import { LoadingViewWrap } from '../../base/utils/view/LoadingViewWrap';
import { Tools } from '../../base/utils/util/Tools';
import { MsgBoxWrap } from '../../base/utils/view/MsgBoxWrap';
const { ccclass, property } = cc._decorator;

@ccclass('MachineDetail')
export class MachineDetail extends BaseView {

    @property(cc.Label)
    labTitle: cc.Label = null;

    @property(cc.Label)
    labRatio: cc.Label = null;

    @property(cc.Label)
    labValue: cc.Label = null;

    @property(ScrollView)
    scroll: ScrollView = null;

    @property(Prefab)
    gzItem: Prefab = null;
    @property(cc.Prefab)
    slItem: cc.Prefab = null;

    @property(cc.Prefab)
    youxizhong_prefab: cc.Prefab = null;
    @property(cc.Prefab)
    dangqianzhuanshu_prefab: cc.Prefab = null;
    @property(cc.Prefab)
    baoliu_prefab: cc.Prefab = null;
    @property(cc.Prefab)
    otherstate_prefab: cc.Prefab = null;

    weihuzhong = "Localized/weihuzhong/"
    kaijiangzhong = "Localized/kaijiangzhong/"
    baoliuzhong = "Localized/baoliu/"
    benrenshiyong = "Localized/benrenshiyong/"
    lixian = "Localized/lixian/"

    lanArr = ["cn","tw","en","jp"]

    lan = 0

    start() {
        this.lan = LocalizadManager.getInstance().getLanauge() - 1
        this.labTitle.string = this.m_uidata.machineData.name
        this.labRatio.string = `${this.m_uidata.machineData.odds_x}:${this.m_uidata.machineData.odds_y}`
        if (1 == UserInfo.clickSLorGZ) {
            let dian = LabelConfig["点"][this.lan]
            let fen = LabelConfig["分"][this.lan]
            this.labValue.string = this.m_uidata.machineData.point + dian + "/" + this.m_uidata.machineData.score + fen
        }else if (2 == UserInfo.clickSLorGZ) {
            let dian = LabelConfig["点"][this.lan]
            let fen = LabelConfig["转"][this.lan]
            this.labValue.string = this.m_uidata.machineData.point + dian + "/" + this.m_uidata.machineData.turn + fen
        }
        this.labValue.string
        
        // let data = []
        // for (let i=0; i<this.m_uidata.machineList.length; i++) {
        //     if (0 == this.m_uidata.machineList[i].gaming) {
        //         data.push(this.m_uidata.machineList[i])
        //     }
        // }
        this.initList(this.m_uidata.machineList)
    }

    initList (data:any) {
        let content = this.scroll.content;
        content.removeAllChildren();
        for (let i=0; i<data.length; i++) {
            let item = 1 == UserInfo.clickSLorGZ ? cc.instantiate(this.slItem) : cc.instantiate(this.gzItem);
            item.getChildByName("Label").getComponent(Label).string = data[i].code;
            item.parent = content
            let state = item.getChildByName("img_state").getComponent(Sprite)
            let btn_enter = item.getChildByName("btn_enter")
            let isEnter = false

            if ("offline" == data[i].online_status) {
                let lixianNode = cc.instantiate(this.otherstate_prefab)
                lixianNode.parent = item.getChildByName("Node")
                this.m_resLoader.loadSpriteFrame(this.lixian + this.lanArr[this.lan],(err:Error,asset:cc.SpriteFrame) => {
                    if (!err) {
                        lixianNode.getChildByName("img_state").getComponent(Sprite).spriteFrame = asset
                    }
                })
            }else if(1 == data[i].maintaining) {
                let weihuNode = cc.instantiate(this.otherstate_prefab)
                weihuNode.parent = item.getChildByName("Node")
                this.m_resLoader.loadSpriteFrame(this.weihuzhong + this.lanArr[this.lan],(err:Error,asset:cc.SpriteFrame) => {
                    if (!err) {
                        weihuNode.getChildByName("img_state").getComponent(Sprite).spriteFrame = asset
                    }
                })
            // 开奖中
            }else if (1 == data[i].reward_status) {
                let kaijaingNode = cc.instantiate(this.otherstate_prefab)
                kaijaingNode.parent = item.getChildByName("Node")
                this.m_resLoader.loadSpriteFrame(this.kaijiangzhong + this.lanArr[this.lan],(err:Error,asset:cc.SpriteFrame) => {
                    if (!err) {
                        kaijaingNode.getChildByName("img_state").getComponent(Sprite).spriteFrame = asset
                    }
                })
                isEnter = true
                Tools.SetChildText(btn_enter, "Label", Tools.GetLocalized(data[i].gaming_user_id == 0 || data[i].gaming_user_id == UserInfo.id ? "进入游戏" : "进入观看"))
            }else if (0 != Number(data[i].keep_seconds) && 1 == data[i].keeping) {
                let baoliuNode = cc.instantiate(this.baoliu_prefab)
                baoliuNode.parent = item.getChildByName("Node")
                this.m_resLoader.loadSpriteFrame(this.baoliuzhong + this.lanArr[this.lan],(err:Error,asset:cc.SpriteFrame) => {
                    if (!err) {
                        baoliuNode.getChildByName("Layout").getChildByName("img_state").getComponent(Sprite).spriteFrame = asset
                        let time = baoliuNode.getChildByName("Layout").getChildByName("Layout").getChildByName("Label").getComponent(MachineKeepTime)
                        time.setMachineId(data[i].id)
                        time.setLeftTime(Number(data[i].keep_seconds))
                    }
                })
                isEnter = UserInfo.id == data[i].gaming_user_id ? true : false
            }else if (UserInfo.id == data[i].gaming_user_id) {
                let benrenNode = cc.instantiate(this.otherstate_prefab)
                benrenNode.parent = item.getChildByName("Node")
                this.m_resLoader.loadSpriteFrame(this.benrenshiyong + this.lanArr[this.lan],(err:Error,asset:cc.SpriteFrame) => {
                    if (!err) {
                        benrenNode.getChildByName("img_state").getComponent(Sprite).spriteFrame = asset
                    }
                })
                isEnter = true
            }else if ((UserInfo.id != data[i].gaming_user_id && 0 != data[i].gaming_user_id) || data[i].is_use == 1) {
                let benrenNode = cc.instantiate(this.youxizhong_prefab)
                benrenNode.parent = item
            }else {
                let benrenNode = cc.instantiate(this.dangqianzhuanshu_prefab)
                benrenNode.parent = item
                benrenNode.getChildByName("Label").getComponent(cc.Label).string = data[i].now_turn
                isEnter = true
            }
            if (isEnter) {
                btn_enter.off(cc.Node.EventType.TOUCH_END)
                btn_enter.on(cc.Node.EventType.TOUCH_END,() => {
                    // 确定是否支持WebRTC格式
                    if (this.isWebRTCSupported()){
                        LoadingViewWrap.show()
                        httpRequest.post("api/v1/machine-info",{
                            machine_id:data[i].id,
                        },(succ:any) => {
                            if (1 == UserInfo.clickSLorGZ) {
                                UIMgr.getInstance().openSingleView(UIConfig.SLGame.path,{machine_id:data[i].id,reward_status:data[i].reward_status,machineInfo:succ})
                            }else if (2 == UserInfo.clickSLorGZ) {
                                UIMgr.getInstance().openSingleView(UIConfig.GZGame.path,{machine_id:data[i].id,reward_status:data[i].reward_status,machineInfo:succ})
                            }
                        })
                    }else{
                        // 如果下载链接为空
                        if (UserInfo.defaultConfig["download_url"] == ""){
                            MsgBoxWrap.showConfirm(Tools.GetLocalized("不支持WebRTC提示"))
                        }else{
                            UIMgr.getInstance().openView("preLoad/world/MsgBox", { content : Tools.GetLocalized("不支持WebRTC提示"), confirm : ()=>{
                                window.open(UserInfo.defaultConfig["download_url"], '_blank')
                            }, cancel : ()=>{}, autoclose : true, btnSureName : Tools.GetLocalized("前往下载") })
                        }
                    }
                })
            }else {
                btn_enter.off(cc.Node.EventType.TOUCH_END)
                btn_enter.getComponent(Sprite).grayscale = true
            }
        }
    }

    /** 检测WebRTC支持情况 */
    isWebRTCSupported(): boolean {
        return !!window.RTCPeerConnection;
    }

    chectBoxClick (target:cc.Toggle) {
        let data = []
        if (target.isChecked) {
            for (let i=0; i<this.m_uidata.machineList.length; i++) {
                if (0 == this.m_uidata.machineList[i].gaming) {
                    data.push(this.m_uidata.machineList[i])
                }
            }
            this.initList(data)
        }else {
            for (let i=0; i<this.m_uidata.machineList.length; i++) {
                if (0 != this.m_uidata.machineList[i].gaming) {
                    data.push(this.m_uidata.machineList[i])
                }
            }
            this.initList(data)
        }
    }

    btnCloseCall () {
        this.close()
    }
}


