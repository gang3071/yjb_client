import * as cc from 'cc';
import { Message } from '../../base/core/MessageMgr';
import { UIMgr } from '../../base/core/UIMgr';
import { BaseView } from '../../base/frame/BaseView';
import { UrlImageView } from '../../base/gui/urlImageView';
import { utils } from '../../base/utils/utils';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { LoadingViewWrap } from '../../base/utils/view/LoadingViewWrap';
import { UIConfig } from '../../config/UIConfig';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { UserInfo } from '../common/UserInfo';
import { MediaVideo } from './mediaVideo';
import { SERVER_LIST } from '../../config/ServerConfig';
import { getCurEnv } from '../../config/Env';
import { Label } from 'cc';
import { LabelConfig } from '../../config/LabelConfig';
import { LocalizadManager } from '../../base/localized/LocalizedManager';
import { PlayOnlineVideo } from '../Lobby/PlayOnlineVideo';
import { Tools } from '../../base/utils/util/Tools';
const { ccclass, property } = cc._decorator;

@ccclass('MachineMore')
export class MachineMore extends BaseView {

    @property(cc.Node)
    btnBack:cc.Node = null

    @property(cc.Label)
    labMoney:cc.Label = null

    @property(cc.Sprite)
    imgAvatar:cc.Sprite = null

    @property(cc.Node)
    layoutMachine:cc.Node = null

    private media_combine

    setViewInfo (id : number, path : string) {
        super.setViewInfo(id,path)
        this.initEventListen()
    }

    start() {

        if (null != UserInfo.wallet_list) {
            this.updateMoney()
        }
        
        this.initAvatar()
    }

    onDisable () {
        this.cancelEventListen()
        // UserInfo.requestUserInfo()
    }

    initEventListen () {
        Message.on("UpdateMoney",this.updateMoney,this)
        Message.on("PlayVideo",this.playVideo,this)
        Message.on("StartLoading",this.startLoading,this)
        Message.on("KickOutGame",this.kickOutGame,this)
    }

    cancelEventListen () {
        Message.off("UpdateMoney",this.updateMoney,this)
        Message.off("PlayVideo",this.playVideo,this)
        Message.off("StartLoading",this.startLoading,this)
        Message.off("KickOutGame",this.kickOutGame,this)
    }

    kickOutGame (event: string, args: any) {
        for (let i=UserInfo.playingMachineInfo.length-1; i>=0; i--) {
            if (UserInfo.playingMachineInfo[i].id == args.machine_id) {
                utils.backExit(UserInfo.playingMachineInfo[i].id)
                // UserInfo.closeGameSocket(UserInfo.playingMachineInfo[i].id)
                let node = this.layoutMachine.children[i]
                node.destroy()
                node = null
                UserInfo.playingMachineInfo.splice(i,1)
                break
            }
        }
        if (0 == UserInfo.playingMachineInfo.length) {
            this.btnBackCall()
        }
    }

    startLoading () {
        this.initData()
    }

    playVideo (param:any) {
        for (let i=0; i<UserInfo.playingMachineInfo.length; i++) {
            
            let node = this.layoutMachine.children[i]
            
            node.getChildByName("item").getChildByName("item2").getChildByName("loadingNode").active = false
        }
    }

    updateMoney () {
        this.labMoney.string = UserInfo.wallet_list.money
    }

    closeAllMachine () {
        for (let i=0; i<UserInfo.playingMachineInfo.length; i++) {
            utils.backExit(UserInfo.playingMachineInfo[i].id)
            UserInfo.closeGameSocket(UserInfo.playingMachineInfo[i].id)
        }
    }

    requestMachineInfo (id:number) {
        
    }

    initData () {
        for (let i=0; i<UserInfo.playingMachineInfo.length; i++) {
            UserInfo.playingMachineInfo[i].media_combine = Tools.CombineMachineData(UserInfo.playingMachineInfo[i])
        }

        for (let i=0; i<3; i++) {
            this.layoutMachine.children[3-i].getChildByName("item").active = false
        }

        let title = this.btnBack.getChildByName("Label").getComponent(Label)
        if (this.m_uidata.data.type == 1) {
            title.string = "SLOT"
        }else if (this.m_uidata.data.type == 2) {
            title.string = LabelConfig["钢  珠"][LocalizadManager.getInstance().getLanauge() - 1]
        }
        
        for (let i=0; i<UserInfo.playingMachineInfo.length; i++) {
            let node = this.layoutMachine.children[i].getChildByName("item")
            let d = UserInfo.playingMachineInfo[i]
            node.active = true
            UserInfo.initGameSocket(d.id)
            node.getChildByName("item1").active = false
            node.getChildByName("item2").active = true
            node.getChildByName("item2").getChildByName("loadingNode").active = true
            let defaultMedia = d.media_combine[d.play_route]
            if (defaultMedia.mType == 1){
                Tools.httpReq("get-tencent-media", {media_id:defaultMedia.id}, (res)=>{
                    Tools.GetChildComp(node, "item2/tcplayer", PlayOnlineVideo).init(res, defaultMedia.id + "-more")
                })
                //node.getChildByName("item2").getChildByName("tcplayer").getComponent(PlayOnlineVideo).init(UserInfo.playingMachineInfo[i].tencent_machine_media[0], UserInfo.playingMachineInfo[i].id + "-more")
            }else if (defaultMedia.mType == 2){
                Tools.GetChildComp(node, "item2/mediaVideo", MediaVideo).setSourcesUrl(defaultMedia.pull_ip,defaultMedia.stream_name,d.id,i)
                //node.getChildByName("item2").getChildByName("mediaVideo").getComponent(MediaVideo).setSourcesUrl(UserInfo.playingMachineInfo[i].machine_media[0].pull_ip,UserInfo.playingMachineInfo[i].machine_media[0].stream_name,UserInfo.playingMachineInfo[i].id,i)
            }
            node.on(cc.Node.EventType.TOUCH_END,() => {
                httpRequest.post("api/v1/machine-info",{
                    machine_id:UserInfo.playingMachineInfo[i].id,
                },(succ:any) => {
                    this.closeAllMachine()
                    Tools.JumpToGame(succ, () => {this.close()})
                
                    // if (1 == UserInfo.playingMachineInfo[i].type) {
                    //     UserInfo.clickSLorGZ = 1
                    //     LoadingViewWrap.show()
                    //     UIMgr.getInstance().openSingleView(UIConfig.SLGame.path,{machine_id:UserInfo.playingMachineInfo[i].id,data:UserInfo.playingMachineInfo[i],machineInfo:succ},null,null,() => {
                    //         this.close()
                    //     })
                    // }else {
                    //     UserInfo.clickSLorGZ = 2
                    //     LoadingViewWrap.show()
                    //     UIMgr.getInstance().openSingleView(UIConfig.GZGame.path,{machine_id:UserInfo.playingMachineInfo[i].id,data:UserInfo.playingMachineInfo[i],machineInfo:succ},null,null,() => {
                    //         this.close()
                    //     })
                    // }
                    
                },(fail:any) => {
                    
                })
                
            })
        }
        if (4 != UserInfo.playingMachineInfo.length) {
            let node = this.layoutMachine.children[UserInfo.playingMachineInfo.length].getChildByName("item")
            node.active = true
            node.on(cc.Node.EventType.TOUCH_END,() => {
                Message.dispatchEvent("LeaveMachine")
                this.closeAllMachine()
                this.close()
            })
        }
    }

    btnBackCall () {
        if (5 == this.m_uidata.data.type) {
            Message.dispatchEvent("LeaveMachine")
            this.closeAllMachine()
            this.close()
            return
        }
        httpRequest.post("api/v1/machine-info",{
            machine_id:this.m_uidata.data.id,
        },(succ:any) => {
            this.closeAllMachine()
            this.close()
            if (1 == this.m_uidata.data.type) {
                LoadingViewWrap.show()
                UIMgr.getInstance().openSingleView(UIConfig.SLGame.path,{machine_id:this.m_uidata.data.id,data:this.m_uidata.data,machineInfo:succ})
            }else {
                LoadingViewWrap.show()
                UIMgr.getInstance().openSingleView(UIConfig.GZGame.path,{machine_id:this.m_uidata.data.id,data:this.m_uidata.data,machineInfo:succ})
            }
        },(fail:any) => {
            
        })
        
    }

    btnRefreshCall () {
        let fun = () => {
            AlterTipsWrap.show("刷新成功")
        }
        UserInfo.requestUserInfo(fun)
        this.closeAllMachine()

        for (let i=0; i<UserInfo.playingMachineInfo.length; i++) {
            let node = this.layoutMachine.children[i].getChildByName("item")
            node.active = true
            
            node.getChildByName("item1").active = false
            node.getChildByName("item2").active = true
            node.getChildByName("item2").getChildByName("loadingNode").active = true
            Message.dispatchEvent("ResetMachine_" + UserInfo.playingMachineInfo[i].id)
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
}


