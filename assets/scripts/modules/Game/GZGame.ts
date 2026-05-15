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
import { Tools } from '../../base/utils/util/Tools';
import { PlayOnlineVideo } from '../Lobby/PlayOnlineVideo';
import { StoreMgr } from '../../base/core/StoreMgr';
const { ccclass, property } = cc._decorator;

/** 超时次数 */
const TIMEOUT_TIMES = 3;

@ccclass('GZGame')
export class GZGame extends BaseView {

    @property(cc.Node)
    btnMusicOpen:cc.Node = null
    @property(cc.Node)
    btnMusicClose:cc.Node = null

    @property(cc.Node)
    nodeDetail:cc.Node = null

    @property(cc.Node)
    btnAuto:cc.Node = null
    @property(cc.Node)
    btnStopAuto:cc.Node = null

    @property(cc.Node)
    mediaNode:cc.Node = null

    @property(PlayOnlineVideo)
    videoNode:PlayOnlineVideo = null

    @property(cc.Label)
    labMoney:cc.Label = null

    @property(cc.Node)
    contentNode:cc.Node = null

    @property(cc.Node)
    videoSprite:cc.Node = null

    @property(cc.Sprite)
    imgAvatar:cc.Sprite = null

    @property(cc.Label)
    labMachineName:cc.Label = null

    @property(cc.Label)
    labMachineId:cc.Label = null

    @property(cc.Label)
    labMachineLv:cc.Label = null

    @property(cc.Node)
    btnSaveMachine:cc.Node = null

    @property(cc.Node)
    btnCancelMachine:cc.Node = null

    @property(cc.Node)
    loadingNode:cc.Node = null

    @property(cc.Node)
    btnMoreMachine:cc.Node = null

    @property(cc.Node)
    btnBack:cc.Node = null

    @property(cc.Prefab)
    startAnimNode:cc.Prefab = null

    @property(cc.Node)
    downNode:cc.Node = null

    @property(cc.Node)
    btnStart:cc.Node = null

    // @property(cc.Node)
    // setNode:cc.Node = null

    @property(cc.Node)
    btnXiaFen:cc.Node = null

    @property(cc.Node)
    btnShangFen:cc.Node = null

    @property(cc.Node)
    btnShangZhuan:cc.Node = null

    @property(cc.Node)
    btnXiaZhuan:cc.Node = null

    @property(cc.Node)
    btnShangZhuanAll:cc.Node = null

    @property(cc.Node)
    btnXiaZhuanAll:cc.Node = null

    @property(cc.Node)
    btnKanBiao:cc.Node = null

    @property(cc.Node)
    nodeBottom:cc.Node = null

    @property(cc.Label)
    labNotice:cc.Label = null

    @property(cc.Node)
    saveMachineNode:cc.Node = null

    @property(cc.Node)
    moveNode:cc.Node = null

    @property(cc.Node)
    btnAddCoin:cc.Node = null

    @property(cc.Node)
    guanzhanNode:cc.Node = null

    @property(cc.Node)
    xialaNode:cc.Node = null

    /** 机台名称 */
    @property(cc.Label)
    gameName:cc.Label = null
    /** 链接超时 */
    @property(cc.Node)
    timeout:cc.Node = null
    /** 退出倒计时 */
    @property(cc.Node)
    exitMask:cc.Node = null
    

    startPos = new cc.Vec3(3,0,0)
    endPos = new cc.Vec3(800,0,0)

    msgArr:string[] = []

    private machineData:any = null

    private machineInfo:any = null

    private isShangFenSucc:boolean = false

    originalTouchDistance:number = -1
    originalNodeScale:cc.Vec3 = new cc.Vec3(1,1,1)
    minScale:number = 1
    maxScale:number = 2

    originalPos:cc.Vec3 = null

    saveMachineNodeIsMove:boolean = false

    datas:any[] = []

    /** 视频超时提示次数 */
    private tips_time = 0
    private begin_time = 0
    
    dtTime = 0

    /** 彩金池记录 */
    private _lotteryNum
    /** 当前播放的视频 */
    private _nowVideo:any = null

    /** 如果不是正在玩的机器，倒计时300秒退出 */
    private _freeTime:number = 0
    /** 是否需要倒计时 */
    private _willExit:boolean = false

    start() {
        this.resetTimeout()
        //UIMgr.getInstance().closeView(UIConfig.MachineDetail.path)
        if (this.m_uidata.machineInfo.has_spectator) {
            this.xialaNode.active = false
            this.saveMachineNode.active = false
            this.guanzhanNode.active = true
        }
        this.btnAddCoin.active = UserInfo.defaultConfig.recharge_status && UserInfo.switch_shop == 1
        
        this.moveNode.getComponent(cc.UITransform).width = this.moveNode.parent.getComponent(cc.UITransform).width
        for (let i=0; i<this.moveNode.children.length; i++) {
            let node = this.moveNode.children[i].getChildByName("Layout")
            node.getComponent(cc.UITransform).width = Math.ceil(this.moveNode.getComponent(cc.UITransform).width/3)
            node.getChildByName("Label").getComponent(cc.Label).string = ""
            node.getChildByName("desc").getComponent(cc.Label).string = ""
        }
        // 整合腾讯流和webrtc流
        this.m_uidata.machineInfo.media_combine = Tools.CombineMachineData(this.m_uidata.machineInfo)

        this.moveNode.setPosition(cc.v3(-this.moveNode.parent.getComponent(cc.UITransform).width/2,0,0))
        this.getPrizePoolList()
        //audioMgr.pauseMusic()
        this.nodeDetail.active = false
        this.labMachineName.node.active = false
        UserInfo.initGameSocket(this.m_uidata.machine_id)
        this.initEventListen()
        this.initData()
        // this.requestMachineInfo()
        this.requestNotice()
        this.requestMachineMoreInfo()
        if (!this.m_uidata.machineInfo.has_spectator) {
            this.sendActionReq("combine_status")
        }


        // let nodeContent = this.node.getComponent(cc.UITransform)
        // let nodeWidth = 1080
        // let nodeHeight = 1920
        // this.videoSprite.setScale((nodeContent.height-190)/nodeHeight,nodeContent.width / nodeWidth)
        
        // this.videoSprite.setPosition(cc.v3(this.videoSprite.getPosition().x,nodeContent.height/2 - 190))
        // this.originalPos = this.videoSprite.getPosition()

        this.btnXiaFen.on(cc.Node.EventType.TOUCH_START,(target:cc.EventTouch) => {
            let node = target.getCurrentTarget()
            node.getChildByName("img1").active = false
            node.getChildByName("img2").active = true
        })
        this.btnXiaFen.on(cc.Node.EventType.TOUCH_CANCEL,(target:cc.EventTouch) => {
            let node = target.getCurrentTarget()
            node.getChildByName("img1").active = true
            node.getChildByName("img2").active = false
        })
        this.btnXiaFen.on(cc.Node.EventType.TOUCH_END,(target:cc.EventTouch) => {
            let node = target.getCurrentTarget()
            node.getChildByName("img1").active = true
            node.getChildByName("img2").active = false
            this.btnXiaFenCall()
        })

        this.btnShangFen.on(cc.Node.EventType.TOUCH_START,(target:cc.EventTouch) => {
            let node = target.getCurrentTarget()
            node.getChildByName("img1").active = false
            node.getChildByName("img2").active = true
        })
        this.btnShangFen.on(cc.Node.EventType.TOUCH_CANCEL,(target:cc.EventTouch) => {
            let node = target.getCurrentTarget()
            node.getChildByName("img1").active = true
            node.getChildByName("img2").active = false
        })
        this.btnShangFen.on(cc.Node.EventType.TOUCH_END,(target:cc.EventTouch) => {
            let node = target.getCurrentTarget()
            node.getChildByName("img1").active = true
            node.getChildByName("img2").active = false
            this.btnShangFenCall()
        })

        this.btnShangZhuan.on(cc.Node.EventType.TOUCH_START,(target:cc.EventTouch) => {
            let node = target.getCurrentTarget()
            node.getChildByName("img1").active = false
            node.getChildByName("img2").active = true
        })
        this.btnShangZhuan.on(cc.Node.EventType.TOUCH_CANCEL,(target:cc.EventTouch) => {
            let node = target.getCurrentTarget()
            node.getChildByName("img1").active = true
            node.getChildByName("img2").active = false
        })
        this.btnShangZhuan.on(cc.Node.EventType.TOUCH_END,(target:cc.EventTouch) => {
            let node = target.getCurrentTarget()
            node.getChildByName("img1").active = true
            node.getChildByName("img2").active = false
            this.btnShangZhuanCall()
        })

        this.btnXiaZhuan.on(cc.Node.EventType.TOUCH_START,(target:cc.EventTouch) => {
            let node = target.getCurrentTarget()
            node.getChildByName("img1").active = false
            node.getChildByName("img2").active = true
        })
        this.btnXiaZhuan.on(cc.Node.EventType.TOUCH_CANCEL,(target:cc.EventTouch) => {
            let node = target.getCurrentTarget()
            node.getChildByName("img1").active = true
            node.getChildByName("img2").active = false
        })
        this.btnXiaZhuan.on(cc.Node.EventType.TOUCH_END,(target:cc.EventTouch) => {
            let node = target.getCurrentTarget()
            node.getChildByName("img1").active = true
            node.getChildByName("img2").active = false
            this.btnXiaZhuanCall()
        })

        this.btnShangZhuanAll.on(cc.Node.EventType.TOUCH_START,(target:cc.EventTouch) => {
            let node = target.getCurrentTarget()
            node.getChildByName("img1").active = false
            node.getChildByName("img2").active = true
        })
        this.btnShangZhuanAll.on(cc.Node.EventType.TOUCH_CANCEL,(target:cc.EventTouch) => {
            let node = target.getCurrentTarget()
            node.getChildByName("img1").active = true
            node.getChildByName("img2").active = false
        })
        this.btnShangZhuanAll.on(cc.Node.EventType.TOUCH_END,(target:cc.EventTouch) => {
            let node = target.getCurrentTarget()
            node.getChildByName("img1").active = true
            node.getChildByName("img2").active = false
            this.btnShangZhuanAllCall()
        })

        this.btnXiaZhuanAll.on(cc.Node.EventType.TOUCH_START,(target:cc.EventTouch) => {
            let node = target.getCurrentTarget()
            node.getChildByName("img1").active = false
            node.getChildByName("img2").active = true
        })
        this.btnXiaZhuanAll.on(cc.Node.EventType.TOUCH_CANCEL,(target:cc.EventTouch) => {
            let node = target.getCurrentTarget()
            node.getChildByName("img1").active = true
            node.getChildByName("img2").active = false
        })
        this.btnXiaZhuanAll.on(cc.Node.EventType.TOUCH_END,(target:cc.EventTouch) => {
            let node = target.getCurrentTarget()
            node.getChildByName("img1").active = true
            node.getChildByName("img2").active = false
            this.btnXiaZhuanAllCall()
        })

        this.btnKanBiao.on(cc.Node.EventType.TOUCH_START,(target:cc.EventTouch) => {
            let node = target.getCurrentTarget()
            node.getChildByName("img1").active = false
            node.getChildByName("img2").active = true
        })
        this.btnKanBiao.on(cc.Node.EventType.TOUCH_CANCEL,(target:cc.EventTouch) => {
            let node = target.getCurrentTarget()
            node.getChildByName("img1").active = true
            node.getChildByName("img2").active = false
        })
        this.btnKanBiao.on(cc.Node.EventType.TOUCH_END,(target:cc.EventTouch) => {
            let node = target.getCurrentTarget()
            node.getChildByName("img1").active = true
            node.getChildByName("img2").active = false
            this.btnKanBiaoCall()
        })
    }

    initEventListen () {
        Message.on("XiaFenExit",this.eventXiaFenExit,this)
        Message.on("UpdateMoney",this.updateMoney,this)
        Message.on("KickOutGame",this.kickOutGame,this)
        Message.on("ShangFenSucc",this.shangFenSucc,this)
        Message.on("LeaveMachineSure",this.leaveMachineSure,this)
        Message.on("PlayVideo",this.playVideo,this)
        Message.on("GiveupMachine",this.giveupMachine,this)
        Message.on("player_machine_keeping",this.playerMachineKeeping,this)
        Message.on("ChangeLine",this.eventChangeLine,this)
        Message.on("GetActivityReward",this.getActivityReward,this)
        Message.on("auto",this.msgAuto,this)
        Message.on("machine_reward_end",this.machine_reward_end,this)
        Message.on("UpdateMachineData", this.UpdateData, this)

        this.nodeDetail.on(cc.Node.EventType.ACTIVE_IN_HIERARCHY_CHANGED,() => {
            if (this.nodeDetail.active) {
                this.labNotice.node.parent.getComponent(cc.UIOpacity).opacity = 0
                this.labMachineName.node.active = this.labNotice.string == ""?true:false
                
            }else {
                this.labNotice.node.parent.getComponent(cc.UIOpacity).opacity = 255
                this.labMachineName.node.active = false
            }
        })
    }

    onDisable () {
        
        Message.off("XiaFenExit",this.eventXiaFenExit,this)
        Message.off("UpdateMoney",this.updateMoney,this)
        Message.off("KickOutGame",this.kickOutGame,this)
        Message.off("ShangFenSucc",this.shangFenSucc,this)
        Message.off("LeaveMachineSure",this.leaveMachineSure,this)
        Message.off("PlayVideo",this.playVideo,this)
        Message.off("GiveupMachine",this.giveupMachine,this)
        Message.off("player_machine_keeping",this.playerMachineKeeping,this)
        Message.off("ChangeLine",this.eventChangeLine,this)
        Message.off("GetActivityReward",this.getActivityReward,this)
        Message.off("auto",this.msgAuto,this)
        Message.off("machine_reward_end",this.machine_reward_end,this)
        Message.off("UpdateMachineData", this.UpdateData, this)

        // if (UserInfo.isOpenBgAudio) {
        //     audioMgr.playMusic("common/audio/bg")
        // }
        UserInfo.closeGameSocket(this.m_uidata.machine_id)
        UIMgr.getInstance().closeView(UIConfig.GZXiaFen.path)
        UIMgr.getInstance().closeView(UIConfig.ShangFen.path)
        UIMgr.getInstance().closeView(UIConfig.LeaveMachine.path)
        UIMgr.getInstance().closeView(UIConfig.ChangeLine.path)
        UserInfo.requestUserInfo()
    }

    machine_reward_end (event:string,args:any) {
        this.close()
    }

    msgAuto (event:string,args:any) {
        this.btnAuto.active = args.status == true?false:true
        this.btnStopAuto.active = args.status == true?true:false
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

    eventChangeLine (event:string,args:any) {
        this.resetTimeout()
        utils.backExit(this.m_uidata.machineInfo.id)
        this.loadingNode.active = true
        this.videoNode.desPlayer()
        let succ = this.m_uidata.machineInfo
        this.playMedia(succ.media_combine[args], args)
        //this.playTcplayerVideo(succ.media_combine[args])
        //this.mediaNode.getComponent(MediaVideo).setSourcesUrl(succ.machine_media[args].pull_ip,succ.machine_media[args].stream_name,succ.machine_media[args].machine_id,0)
    }

    /** 根据类型播放视频， */
    playMedia(succ, n){
        StoreMgr.getInstance().setIntValue("CURR_LINE", n)
        this.videoNode.node.parent.active = succ.mType == 1
        this.mediaNode.parent.active = succ.mType == 2
        if (succ.mType == 1){
            Tools.httpReq("get-tencent-media", {media_id:succ.id}, (res)=>{
                this.playTcplayerVideo(res)
            })
        }else if(succ.mType == 2){
            this.mediaNode.getComponent(MediaVideo).setSourcesUrl(succ.pull_ip, succ.stream_name, succ.machine_id, 0)
        }
    }

    playerMachineKeeping (event:string,args:any) {
        this.initSaveMachineNodeState(args)
    }

    giveupMachine () {
        this.sendActionReq("leave")
    }

    setVideoMute (t) {
        //@ts-ignore
        if (window["changeVideoMuteStatus_"+this.m_uidata.machine_id]) {
            //@ts-ignore
            window["changeVideoMuteStatus_"+this.m_uidata.machine_id]()
        }

        this.videoNode.voiceChange(t)
    }

    playVideo () {
        this.loadingNode.active = false
        // this.setVideoMute()
    }

    leaveMachineSure () {
        utils.backExit(this.m_uidata.machineInfo.id)
        this.close()
        Message.dispatchEvent("LeaveMachine")
    }

    shangFenSucc () {
        this.isShangFenSucc = true
        this._willExit = false
        this.exitMask.active = false
        this.requestMachineMoreInfo()
    }

    kickOutGame (event:string,args:any) {
        if (args.machine_id == this.m_uidata.machineInfo.id) {
            utils.backExit(this.m_uidata.machineInfo.id)
            this.close()
            Message.dispatchEvent("LeaveMachine")
        }
    }

    /** 更新数据 */
    UpdateData(event:string, args:any){
        if (args.id == this.m_uidata.machineInfo.id) {
            this.m_uidata.machineInfo.auto = args.machine_info.auto
            this.m_uidata.machineInfo.move_point = args.machine_info.move_point
            this.m_uidata.machineInfo.reward_status = args.machine_info.reward_status
            this.m_uidata.machineInfo.turn = args.machine_info.turn
            this.m_uidata.machineInfo.point = args.machine_info.point
            this.m_uidata.machineInfo.score = args.machine_info.score
            this.m_uidata.machineInfo.win_number = args.machine_info.win_number
            this.m_uidata.machineInfo.push_auto = args.machine_info.push_auto
        }
    }

    updateMoney () {
        let m = Number(UserInfo.wallet_list.money).toFixed(2)
        this.labMoney.string = m.includes('.00') ? m.split('.')[0] : m
    }

    playTcplayerVideo (d) {
        this.videoNode.init(d, this.m_uidata.machine_id)
        this._nowVideo = d
    }

    startExit(){
        this._freeTime = 300;
        this._willExit = true
    }

    initData () {
        if (null != UserInfo.wallet_list) {
            this.updateMoney()
        }
        this.initAvatar()
        let succ = this.m_uidata.machineInfo
        this.btnSaveMachine.active = 0 == succ.has_favorite?true:false
        this.btnCancelMachine.active = 1 == succ.has_favorite?true:false
        this.labMachineName.string = succ.name
        this.labMachineId.string = succ.code
        this.labMachineLv.string = succ.machine_category.name
        this.gameName.string = succ.name 
        this.machineInfo = succ

        // 如果不是自己在玩，开始倒计时300秒后退出游戏
        if (this.machineInfo.gaming_user_id != UserInfo.id){
            this.startExit()
        }
        //let url = "http://" + succ.machine_media[0].pull_ip + "/ShenQi/streams/" + succ.machine_media[0].stream_name + ".m3u8"
        //this.mediaNode.getComponent(MediaVideo).setSourcesUrl(succ.machine_media[0].pull_ip,succ.machine_media[0].stream_name,succ.machine_media[0].machine_id,0)
        let defaultMedia = succ.media_combine[succ.play_route]
        if (defaultMedia){
            this.playMedia(defaultMedia, succ.play_route)
        }else{
            AlterTipsWrap.show(Tools.GetLocalized("暂时无法播放"))
        }
        // this.btnBack.getChildByName("img1").active = UserInfo.clickSLorGZ == 1 ? true:false
        // this.btnBack.getChildByName("img2").active = UserInfo.clickSLorGZ == 2 ? true:false

        this.btnAuto.active = succ.push_auto == 0?true:false
        this.btnStopAuto.active = succ.push_auto == 1?true:false

        this.saveMachineNode.setPosition(cc.v3(this.node.getComponent(cc.UITransform).width/2-140,0))
        this.initSaveMachineNodeState(succ)

        this.saveMachineNode.on(cc.Node.EventType.TOUCH_START,(event:cc.EventTouch) => {
            this.saveMachineNodeIsMove = false
        })

        this.saveMachineNode.on(cc.Node.EventType.TOUCH_MOVE,(event:cc.EventTouch) => {
            if (this.saveMachineNode.getPosition().x <this.node.getComponent(cc.UITransform).width/2-140) {
                return
            }
            this.saveMachineNodeIsMove = true
            let pos  = event.getUILocation()
            let movePos = this.saveMachineNode.getComponent(cc.UITransform).convertToNodeSpaceAR(cc.v3(pos.x,pos.y))
            movePos.x = this.node.getComponent(cc.UITransform).width/2-140
            movePos.y = this.saveMachineNode.getPosition().y + event.getDeltaY()
            this.saveMachineNode.setPosition(movePos)
        })

        this.saveMachineNode.on(cc.Node.EventType.TOUCH_END,(event:cc.EventTouch) => {
            // if (this.saveMachineNodeIsMove) {
            //     this.saveMachineNodeIsMove = false
            //     return
            // }
            if (this.saveMachineNode.getPosition().x == this.node.getComponent(cc.UITransform).width/2-this.saveMachineNode.getComponent(cc.UITransform).width) {
                this.saveMachineNode.setPosition(cc.v3(this.node.getComponent(cc.UITransform).width/2-140,this.saveMachineNode.getPosition().y))
                this.saveMachineNode.getChildByName("timeRemain").active = true
                this.saveMachineNode.getChildByName("layout").active = false
                return
            }
            this.saveMachineNode.getChildByName("timeRemain").active = false
            this.saveMachineNode.getChildByName("layout").active = true
            let endPos = cc.v3(
                this.node.getComponent(cc.UITransform).width/2-this.saveMachineNode.getComponent(cc.UITransform).width,
                this.saveMachineNode.getPosition().y)
            cc.tween(this.saveMachineNode)
                .to(0.5,{position:endPos})
                .start()
        })
 
    }

    initSaveMachineNodeState (data:any) {
        this.saveMachineNode.getChildByName("normal").active = data.keeping == 0 ? true:false
        this.saveMachineNode.getChildByName("hold").active = data.keeping == 1 ? true:false

        if (0 == Number(data.keep_seconds)) {
            this.saveMachineNode.getChildByName("normal").active = true
            this.saveMachineNode.getChildByName("hold").active = false
        }

        const hours = Math.floor(Number(data.keep_seconds) / 3600);
        let minutes:any = Math.floor((Number(data.keep_seconds) % 3600) / 60);
        let remainingSeconds:any = Number(data.keep_seconds) % 60;

        if(minutes < 10 && 0 != minutes){
            minutes = "0" + minutes
        }

        if(remainingSeconds < 10 && 0 != remainingSeconds){
            remainingSeconds = "0" + remainingSeconds
        } 


        // 格式化输出，确保每部分都是两位数字
        const formattedHours = (hours);
        const formattedMinutes = (minutes);
        const formattedSeconds = (remainingSeconds);
        
        this.saveMachineNode.getChildByName("timeRemain").getComponent(cc.Label).string = (formattedHours + "h\n" + formattedMinutes + "m")
        this.saveMachineNode.getChildByName("layout").getChildByName("timeRemain").getComponent(cc.Label).string = (formattedHours + "h" + formattedMinutes + "m"+ formattedSeconds + "s")
    }

    btnKeepMachineCall () {
        httpRequest.post("api/v1/machine-keep",{
            machine_id:this.m_uidata.machine_id,
        },(succ:any) => {
            AlterTipsWrap.show("保留成功")
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

    eventXiaFenExit () {
        // this.btnBackCall()
        utils.backExit(this.m_uidata.machineInfo.id)
        this.close()
        Message.dispatchEvent("LeaveMachine")
    }

    btnDetailCall () {
        if (this.nodeDetail.active) {
            this.nodeDetail.active = false
        }else {
            this.nodeDetail.active = true
        }
    }

    btnMusicOpenCall () {
        this.btnMusicOpen.active = false
        this.btnMusicClose.active = true
        this.setVideoMute(true)
    }

    btnMusicCloseCall () {
        this.btnMusicOpen.active = true
        this.btnMusicClose.active = false
        this.setVideoMute(false)
    }

    btnMoreMachineCall () {
        LoadingViewWrap.show()
        UIMgr.getInstance().openSingleView(UIConfig.MachineMore.path,{machine_id:this.m_uidata.machine_id,data:this.m_uidata.machineInfo},null,null,() => {
            console.log("=gz==btnMoreMachineCall===")
            utils.backExit(this.m_uidata.machineInfo.id)
            this.close()
            Message.dispatchEvent("StartLoading")
        })
        
    }

    requestNotice () {
        // httpRequest.post("api/v1/home-page-ads",
        //     {},
        //     (succ:any) => {

        //         this.msgArr.push(succ.marquee)
        //         this.getMsg()
              
        //     },(fail:any) => {

        //     }
        // )
        this.doAction(this.m_uidata.machineInfo.machine_marquee)
    }

    getMsg () {
        // let msg = this.msgArr.shift()
        // if (msg) {
        //     this.doAction(msg)
        // }
        if (this.msgArr[0]) {
            let msg = this.msgArr[0]
            this.doAction(msg)
        }
    }

    doAction (str:string) {
        this.labNotice.string = str
        this.labNotice.node.setPosition(this.endPos)
        this.scheduleOnce(() => {
            cc.tween(this.labNotice.node)
                .delay(0.2)
                .to(10,{position:cc.v3(-this.labNotice.node.getComponent(cc.UITransform).width,this.startPos.y,this.startPos.z)})
                .call(() => {
                    this.requestNotice()
                })
                .start()
        },0.1)
    }

    doAction2 () {
        this.moveNode.setPosition(cc.v3(-this.moveNode.parent.getComponent(cc.UITransform).width/2,0,0))
        this.scheduleOnce(() => {
            cc.tween(this.moveNode)
                .delay(3)
                .to(5,{position:cc.v3(-this.moveNode.getComponent(cc.UITransform).width-this.moveNode.parent.getComponent(cc.UITransform).width/2,0,0)})
                .call(() => {
                    this.doAction2()
                })
                .start()
        },0.1)  
    }

    requestMachineMoreInfo () {
        httpRequest.post("api/v1/playing-machine",{
            machine_id:this.m_uidata.machine_id,
        },(succ:any) => {
            UserInfo.playingMachineInfo = succ.playing_machine
            if (0 < succ.playing_machine.length) {
                this.btnMoreMachine.getComponent(cc.Sprite).grayscale = false
                this.btnMoreMachine.getComponent(cc.Button).interactable = true
            }
        },(fail:any) => {
            
        })
    }

    requestMachineInfo () {
        httpRequest.post("api/v1/machine-info",{
            machine_id:this.m_uidata.machine_id,
        },(succ:any) => {
            this.btnSaveMachine.active = 0 == succ.has_favorite?true:false
            this.btnCancelMachine.active = 1 == succ.has_favorite?true:false
            this.labMachineName.string = succ.name
            this.labMachineId.string = succ.code + " " + `${succ.odds_x}:${succ.odds_y}`
            this.machineInfo = succ
            this.playMedia(succ.tencent_machine_media[0], 0)
            //let url = "http://" + succ.machine_media[0].pull_ip + "/ShenQi/streams/" + succ.machine_media[0].stream_name + ".m3u8"
            //this.playTcplayerVideo(succ.tencent_machine_media[0])
            //this.mediaNode.getComponent(MediaVideo).setSourcesUrl(succ.machine_media[0].pull_ip,succ.machine_media[0].stream_name,succ.machine_media[0].machine_id,0)
        })
    }

    sendActionReq (action:string) {
        httpRequest.post("api/v1/jackpot-action",{
            machine_id:this.m_uidata.machine_id,
            action:action
        },(succ:any) => {
            if ("combine_status" == action) {
                this.machineData = succ
            }
            if ("plc_push_5hz" == action) {
                this.btnStopAuto.active = true
                this.btnAuto.active = false
            }
            if ("plc_up_turn_100" == action) {
                AlterTipsWrap.show("上转成功")
            }
            if ("plc_down_turn" == action) {
                AlterTipsWrap.show("下转成功")
            }
            if ("all_up_turn" == action) {
                AlterTipsWrap.show("上转All成功")
            }
            if ("all_down_turn" == action) {
                AlterTipsWrap.show("下转All成功")
            }
            if ("plc_start_or_stop" == action) {
                // AlterTipsWrap.show("开始游戏")
            }
            if ("plc_push_5hz" == action) {
                AlterTipsWrap.show("开始自动")
            }
            if ("plc_push_stop" == action) {
                AlterTipsWrap.show("停止自动")
            }
            if ("leave" == action) {
                utils.backExit(this.m_uidata.machineInfo.id)
                this.close()
                Message.dispatchEvent("LeaveMachine")
            }
            if ("reward_switch" == action) {
                // AlterTipsWrap.show("操作成功")
            }
            // AlterTipsWrap.show(succ.msg)
        },(fail:any) => {
            
        })
    }

    btnAutoCall () {
        if (this.isKaiJiangState()) {
            AlterTipsWrap.show("开奖中，无法操作")
            return
        }
        if (-1 == this.judgeLimit()) {
            return
        }
        
        this.sendActionReq("plc_push_5hz")
    }

    btnStopAutoCall () {
        if (this.isKaiJiangState()) {
            AlterTipsWrap.show("开奖中，无法操作")
            return
        }
        if (-1 == this.judgeLimit()) {
            return
        }
        this.btnStopAuto.active = false
        this.btnAuto.active = true
        this.sendActionReq("plc_push_stop")
    }

    btnStartCall () {
        if (this.isKaiJiangState()) {
            AlterTipsWrap.show("开奖中，无法操作")
            return
        }
        if (-1 == this.judgeLimit()) {
            return
        }

        // let str = LabelConfig["机台内有保留玉时，\n\n开始/暂停可能导致吃转是否执行"]?LabelConfig["机台内有保留玉时，\n\n开始/暂停可能导致吃转是否执行"][LocalizadManager.getInstance().getLanauge()-1]:"机台内有保留玉时，\n\n开始/暂停可能导致吃转是否执行"
        // MsgBoxWrap.showConfirmCancel(str,() => {
            this.sendActionReq("plc_start_or_stop")
            if (this.machineInfo.gaming_user_id == UserInfo.id || this.isShangFenSucc) {
                let node = cc.instantiate(this.startAnimNode)
                node.setPosition(new cc.Vec3(0,0,0))
                this.downNode.addChild(node)
            }
        // },() => {

        // })

        
        
    }

    btnShangFenCall () {
        if (this.isKaiJiangState()) {
            AlterTipsWrap.show("开奖中，无法操作")
            return
        }
        if (-1 == this.judgeLimit()) {
            return
        }
        httpRequest.post("api/v1/show_open_point_rule",{
            cate_id:this.m_uidata.machineInfo.cate_id,
            machine_id:this.m_uidata.machine_id

        },(succ:any) => {
            if (succ.machineCategory.if_se_give_point) {
                if (succ.machineCategory.is_allow_client_give_point) {
                    LoadingViewWrap.show()
                    UIMgr.getInstance().openSingleView(UIConfig.ShangFen.path,{data:this.m_uidata.machineInfo,machine_id:this.m_uidata.machine_id,isGzOrSl:2,succ:succ.machineCategory})
                }else {
                    AlterTipsWrap.show("当前享受开分赠点福利，当前转数不为0，无法继续进行开分操作")
                    return
                }
            }else {
                LoadingViewWrap.show()
                UIMgr.getInstance().openSingleView(UIConfig.ShangFen.path,{data:this.m_uidata.machineInfo,machine_id:this.m_uidata.machine_id,isGzOrSl:2,succ:succ.machineCategory})
            }
        })
        
    }

    btnXiaFenCall () {
        if (this.isKaiJiangState()) {
            AlterTipsWrap.show("开奖中，无法操作")
            return
        }
        if (-1 == this.judgeLimit()) {
            return
        }
        LoadingViewWrap.show()
        UIMgr.getInstance().openSingleView(UIConfig.GZXiaFen.path,{data:this.machineData,machine_id:this.m_uidata.machine_id,isGzOrSl:2})
    }

    btnShangZhuanCall () {
        if (this.isKaiJiangState()) {
            AlterTipsWrap.show("开奖中，无法操作")
            return
        }
        if (-1 == this.judgeLimit()) {
            return
        }
        this.sendActionReq("plc_up_turn_100")
    }

    btnXiaZhuanCall () {
        if (this.isKaiJiangState()) {
            AlterTipsWrap.show("开奖中，无法操作")
            return
        }
        if (-1 == this.judgeLimit()) {
            return
        }
        this.sendActionReq("plc_down_turn")
    }

    btnShangZhuanAllCall () {
        if (this.isKaiJiangState()) {
            AlterTipsWrap.show("开奖中，无法操作")
            return
        }
        if (-1 == this.judgeLimit()) {
            return
        }
        this.sendActionReq("all_up_turn")
    }

    btnXiaZhuanAllCall () {
        if (this.isKaiJiangState()) {
            AlterTipsWrap.show("开奖中，无法操作")
            return
        }
        if (-1 == this.judgeLimit()) {
            return
        }
        this.sendActionReq("all_down_turn")
    }

    judgeLimit () {
        if (this.m_uidata.machineInfo.gaming_user_id != 0 && this.m_uidata.machineInfo.gaming_user_id != UserInfo.id) {
            AlterTipsWrap.show("有人使用")
            return -1
        }else {
            return 1
        }
    }

    isKaiJiangState () {
        // 暂时停用开奖中判断
        return false
        if (this.m_uidata.machineInfo.reward_status && 1 == this.m_uidata.machineInfo.reward_status) {
            return true
        }
        return false
    }

    btnSaveMachineCall () {
        httpRequest.post("api/v1/favorite-machine",{
            machine_id:this.m_uidata.machine_id,
        },(succ:any) => {
            AlterTipsWrap.show("收藏成功")
            this.btnSaveMachine.active = false
            this.btnCancelMachine.active = true
        },(fail:any) => {
            
        })
    }

    btnCancelMachineCall () {
        httpRequest.post("api/v1/cancel-favorite-machine",{
            machine_id:this.m_uidata.machine_id,
        },(succ:any) => {
            AlterTipsWrap.show("取消收藏成功")
            this.btnSaveMachine.active = true
            this.btnCancelMachine.active = false
        })
    }

    btnResetMachineCall (reset = true) {
        if (reset) {this.resetTimeout()}
        let n = StoreMgr.getInstance().getIntValue("CURR_LINE", 0)
        let msg = this.m_uidata.machineInfo.media_combine[n]
        if (msg.mType == 2) {
            utils.backExit(this.m_uidata.machineInfo.id)
            Message.dispatchEvent("ResetMachine_" + this.m_uidata.machineInfo.id)
        } else if (msg.mType == 1){
            this.playMedia(msg, n)
        }
        this.loadingNode.active = true
    }

    btnSaveMoney () {
        // if (!UserInfo.has_set_play_password) {
        //     AlterTipsWrap.show("请设置支付密码")
        //     return
        // }
        httpRequest.post("api/v1/get-recharge",{
            
        },(succ:any) => {
            if (succ.recharge_record.length == 0 || JSON.stringify(succ.recharge_record) === "{}") {
                httpRequest.post("api/v1/get-recharge-method",{
                    amount:0,
                },(succ:any) => {
                    
                    succ.showNode = 1
                    LoadingViewWrap.show()
                    UIMgr.getInstance().openSingleView(UIConfig.ChongZhi.path,{succ:succ})
                },(fail:any) => {
                    
                })
            }else {
                succ.recharge_record.showNode = 2
                LoadingViewWrap.show()
                UIMgr.getInstance().openSingleView(UIConfig.ChongZhiDetail.path,{succ:succ.recharge_record})
            }
            
        },(fail:any) => {
            
        })
    }

    btnKanBiaoCall () {
        this.sendActionReq("reward_switch")
    }

    btnKeFuCall () {
        let width = this.node.getComponent(cc.UITransform).width
        let height = this.node.getComponent(cc.UITransform).height
        UserInfo.getKeFuLink(width,height)
    }

    btnLvLiCall () {
        LoadingViewWrap.show()
        UIMgr.getInstance().openSingleView(UIConfig.GameLL.path,{data:this.machineData,machine_id:this.m_uidata.machine_id,isGzOrSl:2})
    }

    btnBackCall () {
        if (this.isShangFenSucc) {
            LoadingViewWrap.show()
            UIMgr.getInstance().openSingleView(UIConfig.LeaveMachine.path)
        }else {
            if (this.machineInfo.gaming_user_id == UserInfo.id) {
                LoadingViewWrap.show()
                UIMgr.getInstance().openSingleView(UIConfig.LeaveMachine.path)
            }else {
                utils.backExit(this.m_uidata.machineInfo.id)
                this.close()
                Message.dispatchEvent("LeaveMachine")
            }
        }
        // MsgBoxWrap.showConfirmCancel("离开机台会自动下分\n\n确定要离开吗？",() => {
        //     utils.backExit()
        //     this.close()
        //     Message.dispatchEvent("LeaveMachine")
        // },null)
        // utils.backExit()
        // this.close()
        // Message.dispatchEvent("LeaveMachine")
        // httpRequest.post("api/v1/jackpot-action",{
        //     machine_id:this.m_uidata.machine_id,
        //     action:"leave"
        // },(succ:any) => {
            
        // },(fail:any) => {
            
        // })
    }

    bottomShow () {
        this.nodeBottom.active = !this.nodeBottom.active
    }

    btnChangeLineCall () {
        LoadingViewWrap.show()
        UIMgr.getInstance().openSingleView(UIConfig.ChangeLine.path,{data:this.m_uidata.machineInfo})
    }

    btnRuleCall () {
        if ("" != this.m_uidata.machineInfo) {
            if ("" != this.m_uidata.machineInfo) {
                LoadingViewWrap.show()
                UIMgr.getInstance().openSingleView(UIConfig.Rule.path, {data:this.m_uidata.machineInfo})
            }
            // console.log("this.m_uidata.machineInfo------",this.m_uidata.machineInfo,this.m_uidata.machineInfo.machine_strategy)
            // utils.createKeFu(this.m_uidata.machineInfo.machine_strategy)
        }
    }

    touchNode () {
        if (this.nodeDetail.active) {
            this.nodeDetail.active = false
        }
    }

    getPrizePoolList () {
        httpRequest.post("api/v1/lottery-list",
            {type:this.m_uidata.machineInfo.type,page:1,size:10},
            (succ:any) => {
                if (0 < succ.lottery_list.length) {
                    this._lotteryNum = {}
                    this.doAction2()
                    //for (let i=0; i<succ.lottery_list.length; i++) {
                    // 暂时固定显示5条
                    for (let i=0; i<5; i++) {
                        Tools.SetChildText(this.moveNode.children[i], "Layout/desc", succ.lottery_list[i].name + ":")
                        this._lotteryNum[i] = ((Number(succ.lottery_list[i].rate)/100) * Number(succ.lottery_pool.amount)).toFixed(2)
                        let nums = this._lotteryNum[i]
                        Tools.SetChildText(this.moveNode.children[i], "Layout/Label", nums)
                    }
                }
            }
        )
    }

    resetTimeout(){
        this.tips_time = 0
        this.begin_time = 0
        this.timeout.active = false
    }
    
    update(dt: number) {
        this.dtTime += dt
        if (this.dtTime > 1) {
            this.dtTime = 0
            for (let i=0; i<this.moveNode.children.length; i++) {
                let r = this._lotteryNum[i] * (Math.random() * 0.2 + 0.9)
                Tools.SetChildText(this.moveNode.children[i], "Layout/Label", r.toFixed(2))
            }
        }

        // 不是自己游玩，超时退出
        if (this._willExit){
            this._freeTime -= dt
            if (this._freeTime < 0) {
                this.close()
                Message.dispatchEvent("LeaveMachine")
            } else if (this._freeTime < 30) {
                this.exitMask.active = true
                Tools.SetChildText(this.exitMask, "Label", Tools.StringFormat(Tools.GetLocalized("{0}s后即将离开机台"), Math.ceil(this._freeTime)))
            }
        }

        // 视讯超时提示
        if (this.tips_time < TIMEOUT_TIMES){
            if (this.mediaNode.getComponent(MediaVideo).getStat() == 2 || this.videoNode.isPlaying()) {
                this.timeout.active = false
                this.tips_time = TIMEOUT_TIMES + 1
            }
            this.begin_time += dt
            if (this.begin_time > 10) {
                this.begin_time = 0
                this.tips_time++
                this.timeout.active = true
                Tools.SetChildText(this.timeout, "tips", Tools.StringFormat(Tools.GetLocalized("视讯加载超时，重连中({0}/{1})"), this.tips_time, TIMEOUT_TIMES))
                this.btnResetMachineCall(false)
            }
        }else if(this.tips_time == TIMEOUT_TIMES){
            this.begin_time += dt
            if (this.begin_time > 10) {
                this.timeout.active = false
                this.tips_time++
                UIMgr.getInstance().openSingleView(UIConfig.PopVideoTips.path,{
                    fun1:()=>{this.btnChangeLineCall()},
                    fun2:()=>{this.btnResetMachineCall()}
                })
            }
        }
    }
}