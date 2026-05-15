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
import { GAME_VER, SERVER_LIST } from '../../config/ServerConfig';
import { getCurEnv } from '../../config/Env';
import { audioMgr } from '../common/AudioMgr';
import { StoreMgr } from '../../base/core/StoreMgr';
import { Tools } from '../../base/utils/util/Tools';
import { MsgBox } from '../../base/utils/view/MsgBox';
const { ccclass, property } = cc._decorator;

@ccclass('Lobby')
export class Lobby extends BaseView {
    @property(cc.Node)
    downNode:cc.Node = null

    @property(cc.Node)
    machineListNode:cc.Node = null

    @property(cc.Label)
    labMoney:cc.Label = null
    @property(cc.Label)
    game_ver:cc.Label = null

    @property(cc.Label)
    labName:cc.Label = null

    @property(cc.Sprite)
    imgAvatar:cc.Sprite = null

    // @property(cc.Sprite)
    // imgSL:cc.Sprite = null

    // @property(cc.Sprite)
    // imgGZ:cc.Sprite = null

    @property(cc.Node)
    parentNode:cc.Node = null

    @property(cc.Button)
    btnUserData:cc.Button = null

    @property(cc.Button)
    btnActivity:cc.Button = null

    @property(cc.Node)
    mailDot:cc.Node = null

    @property(cc.Label)
    labSlotPrize:cc.Label = null

    @property(cc.Label)
    labJackPrize:cc.Label = null
    
    @property(cc.Node)
    shopNode:cc.Node = null

    /** 讨论群按钮 */
    @property(cc.Node)
    btnLineGroup:cc.Node = null
    /** 排行榜按钮 */
    @property(cc.Node)
    btnRank:cc.Node = null
    /** 全民代理按钮按钮 */
    @property(cc.Node)
    btnAgent:cc.Node = null
    /** 下载按钮 */
    @property(cc.Node)
    btnDownload:cc.Node = null
    /** 按钮layout */
    @property(cc.Layout)
    bottom_btns:cc.Layout = null
    /** 跑马灯 */
    @property(cc.Node)
    paomadeng:cc.Node = null
    /** 返水按钮 */
    @property(cc.Node)
    btnFanShui:cc.Node = null
    /** 返水按钮 */
    @property(cc.Layout)
    btn_layout:cc.Layout = null
    



    private gameIndex:number = 0
    private types:number = 1

    private gameData:any = null


    private bottomSelectIndex:number = 0

    kefuTime = 0

    /** 记录保留时间通知 */
    private _keepAnnoce = {}

    start() {
        console.log("Date.now()Date.now()Date.now()Date.now()", Date.now())
        //@ts-ignore
        if (window.Tawk_API) {
            //@ts-ignore
        }

        // 注册可被原生调用的方法
        UserInfo.registerNativeCallbacks()

        this.game_ver.string = "ver:" + GAME_VER
        this._keepAnnoce = {}
        // 大陆版本隐藏按钮
        this.btnLineGroup.active = UserInfo.defaultConfig.discussion_group_status
        this.btnRank.active = UserInfo.defaultConfig.ranking_status
        // 获取声音开关配置
        UserInfo.isOpenBgAudio = StoreMgr.getInstance().getBoolValue("isOpenBgAudio", false)
        // 音量按钮展示
        Tools.ActChild(this.node, "ListNode/btnAudio/img2", UserInfo.isOpenBgAudio)
        UIMgr.getInstance().closeView(UIConfig.LoginBg.path)
        if ("" != UserInfo.lineCode) {
            StoreMgr.getInstance().setStringValue("LineCode",UserInfo.lineCode)
        }
        if (UserInfo.isOpenBgAudio) {
            audioMgr.playMusic("common/audio/bg")
        }
        if (0 == UserInfo.defaultConfig.activity_open) {
            this.btnUserData.node.setPosition(this.btnActivity.node.getPosition())
            this.btnActivity.node.active = false
        }
        this.initEventListen()
        this.initBottomClick()
        let fun = () => {
            this.labName.string = "" == UserInfo.cname ? UserInfo.uuid:UserInfo.cname
            UserInfo.commonSocket()
            this.mailDot.active = 0 == UserInfo.mailNoReadNums?false:true
        }
        UserInfo.requestUserInfo(fun)
        this.requestMachineInfo()
        this.requestConfig()
        this.requestLineGroup()
        this.initData()

        this.scheduleOnce(() => {
            this.m_resLoader.loadPrefab(UIConfig.PrizePoolFixReward.path,(error:Error,assets:any) => {

            })
        },1)

        cc.tween(this.labSlotPrize.node)
            .to(0.5,{scale:cc.v3(0.95,0.95,0.95)})
            .to(1,{scale:cc.v3(1,1,1)})
            .union()
            .repeatForever()
            .start()

        cc.tween(this.labJackPrize.node)
            .to(0.5,{scale:cc.v3(0.95,0.95,0.95)})
            .to(1,{scale:cc.v3(1,1,1)})
            .union()
            .repeatForever()
            .start()

        // 代理按钮周维特效转动
        cc.tween(this.btnAgent.getChildByName("light"))
            .by(2, {eulerAngles:cc.v3(0,0,360)})
            .repeatForever()
            .start()
    }

    onDisable () {
        this.cancelEventListen()
    }

    initEventListen () {
        Message.on("UpdateMoney",this.updateMoney,this)
        Message.on("UpdateUserInfo",this.updateUserInfo,this)
        Message.on("ChangeAvatarSucc",this.changeAvatarSucc,this)
        Message.on("ShiTiJiTai",this.shiTiJiTai,this)
        Message.on("DianZiGame",this.dianZiGame,this)
        Message.on("RealVideo",this.realVideo,this)
        Message.on("MyJiTai",this.myJiTai,this)
        Message.on("LeaveMachine",this.leaveMachine,this)
        Message.on("ChangeNameSucc",this.changeNameSucc,this)
        Message.on("GetActivityReward",this.getActivityReward,this)
        Message.on("PlayerNotice",this.getPlayerNotice,this)
        Message.on("PrizePoolChange",this.prizePoolChange,this)
        Message.on("MailNums",this.mailNums,this)
        Message.on("MachineKeepTime",this.machineKeepTimeCall,this)
    }

    cancelEventListen () {
        Message.off("UpdateMoney",this.updateMoney,this)
        Message.off("UpdateUserInfo",this.updateUserInfo,this)
        Message.off("ChangeAvatarSucc",this.changeAvatarSucc,this)
        Message.off("ShiTiJiTai",this.shiTiJiTai,this)
        Message.off("DianZiGame",this.dianZiGame,this)
        Message.off("RealVideo",this.realVideo,this)
        Message.off("MyJiTai",this.myJiTai,this)
        Message.off("LeaveMachine",this.leaveMachine,this)
        Message.off("ChangeNameSucc",this.changeNameSucc,this)
        Message.off("GetActivityReward",this.getActivityReward,this)
        Message.off("PlayerNotice",this.getPlayerNotice,this)
        Message.off("PrizePoolChange",this.prizePoolChange,this)
        Message.off("MailNums",this.mailNums,this)
        Message.off("MachineKeepTime",this.machineKeepTimeCall,this)
    }

    /** 保留时间通知 */
    machineKeepTimeCall (event:string,args:any) {
        // 如果在游戏页面不提示
        if (UIMgr.getInstance().getViewByPath(UIConfig.SLGame.path) || UIMgr.getInstance().getViewByPath(UIConfig.GZGame.path)) return
        if (1 == args.keeping) {
            if ( args.keep_seconds < 600 && (this._keepAnnoce[args.machine_id] ==  null || (Date.now() / 1000 - this._keepAnnoce[args.machine_id]) > 600 ) ){
                this._keepAnnoce[args.machine_id] = Date.now() / 1000
                httpRequest.post("api/v1/machine-info",{
                    machine_id:args.machine_id,
                    },(succ:any) => {
                        UIMgr.getInstance().openView("preLoad/world/MsgBox", 
                        { 
                            content : Tools.GetLocalized(succ.name + succ.code + Tools.GetLocalized("机器保留时间即将达到")), 
                            confirm : ()=>{ Tools.JumpToGame(succ) }, 
                            cancel : ()=>{}, 
                            autoclose : true, 
                            btnSureName : Tools.GetLocalized("返回机台") 
                        })
                    }
                )
            }
        }
    }

    /** 下载APP */
    btnDownApp () {
        window.open(UserInfo.defaultConfig["download_url"], '_blank')
    }

    mailNums (event:string,args:any) {
        this.mailDot.active = 0 == args.notice_num?false:true
    }

    prizePoolChange (event:string,args:any) {
        // return
        if (Number(args.slot_amount) != Number(this.labSlotPrize.string)) {
            this.prizePoolCoinAnim(this.labSlotPrize,Number(args.slot_amount)-Number(this.labSlotPrize.string))
        }
        if (Number(args.jack_amount) != Number(this.labJackPrize.string)) {
            this.prizePoolCoinAnim(this.labJackPrize,Number(args.jack_amount)-Number(this.labJackPrize.string))
        }
    }

    testLayb () {
        this.prizePoolCoinAnim(this.labSlotPrize,Number(this.labSlotPrize.string), 100)
    }

    prizePoolCoinAnim (target:cc.Label,endNums:number,time:number=3) {
        let obj:any = {}
        
        obj.num = 0
        // target.string = obj.num
        let oriValue = Number(target.string)
        cc.tween(obj)
            .to(time,{num:endNums},{progress:(start, end, current, ratio) => {
                // console.log("-----",start + (end + start) * ratio)
                target.string = (oriValue + Number(start + (end + start) * ratio)).toFixed(1)
                return start + (end + start) * ratio
            }})
            .start()
            
    }

    getPlayerNotice (event:string,args:any) {
        // this.mailDot.active = 0 == args.notice_num?false:true
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

    changeNameSucc () {
        this.labName.string = utils.sliceStr(UserInfo.cname) 
    }

    leaveMachine () {
        this.parentNode.removeAllChildren()
        this.bottomSelectIndex = 0
        for (let j=0; j<this.downNode.children.length; j++) {
            this.downNode.children[j].getChildByName("img1").active = true
            this.downNode.children[j].getChildByName("img2").active = false
            this.downNode.children[j].getChildByName("img3").active = false
        }
        this.downNode.children[0].getChildByName("img1").active = false
        this.downNode.children[0].getChildByName("img2").active = true
        this.downNode.children[0].getChildByName("img3").active = true
        this.gameIndex = this.gameData.game_cate_list[0]
        
        this.machineListNode.active = true
    }

    shiTiJiTai () {
        this.eventClickDownBtn(0)
    }

    dianZiGame () {
        this.eventClickDownBtn(1)
    }

    realVideo () {
        this.eventClickDownBtn(2)
    }

    myJiTai () {
        this.eventClickDownBtn(3)
    }

    eventClickDownBtn (i:number) {
        if (this.bottomSelectIndex == i) {return}
        // if (2 != i) {UIMgr.getInstance().closeView(UIConfig.RealVideoNode.path)}
        // if (3 != i) {UIMgr.getInstance().closeView(UIConfig.MyJiTaiListNode.path)}

        UIMgr.getInstance().closeView(UIConfig.DianZiGameNode2.path)
        UIMgr.getInstance().closeView(UIConfig.RealVideoNode.path)
        UIMgr.getInstance().closeView(UIConfig.MyJiTaiListNode.path)

        this.parentNode.destroyAllChildren()
        this.bottomSelectIndex = i
        for (let j=0; j<this.downNode.children.length; j++) {
            this.downNode.children[j].getChildByName("img1").active = true
            this.downNode.children[j].getChildByName("img2").active = false
            this.downNode.children[j].getChildByName("img3").active = false
        }
        let node = this.downNode.children[i]
        node.getChildByName("img1").active = false
        node.getChildByName("img2").active = true
        node.getChildByName("img3").active = true

        this.gameIndex = this.gameData.game_cate_list[i]?this.gameData.game_cate_list[i].id:1
        this.machineListNode.active = i == 0 ?true:false
        // 跑马灯展示
        this.paomadeng.active = i == 0

        if (0 == i) {
            UIMgr.getInstance().openView(UIConfig.MachineList.path,{game_id:this.m_uidata.game_id,is_free:this.m_uidata.is_free,
                cate_id:this.m_uidata.cate_id,page:this.m_uidata.page,size:this.m_uidata.size,isSave:this.m_uidata.isSave,succ:this.m_uidata.succ},1,this.parentNode)
        }

        let fun1 = (err:Error|null,view:BaseView|null) => {
            if (null == err) {
                if (1 != i) {
                    view.close()
                }
            }
        }
        let fun2 = (err:Error|null,view:BaseView|null) => {
            if (null == err) {
                if (2 != i) {
                    view.close()
                }
            }
        }

        if (1 == i) {
            // LoadingViewWrap.show()
            UIMgr.getInstance().openSingleView(UIConfig.DianZiGameNode2.path,null,1,this.parentNode,fun1)
        }

        if (2 == i) {
            // LoadingViewWrap.show()
            UIMgr.getInstance().openSingleView(UIConfig.RealVideoNode.path,null,1,this.parentNode,fun2)
        }

        if (3 == i) {
            LoadingViewWrap.show()
            UIMgr.getInstance().openSingleView(UIConfig.MyJiTaiListNode.path,null,1,this.parentNode)
        }
    }

    changeAvatarSucc () {
        if ("" == UserInfo.avatar) {return}
        if (UserInfo.avatar.indexOf("http") !== -1 || UserInfo.avatar.indexOf("https")) {
            this.imgAvatar.getComponent(UrlImageView).setUrl(UserInfo.avatar)
        }else {
            this.imgAvatar.getComponent(UrlImageView).setUrl(SERVER_LIST[getCurEnv()]+UserInfo.avatar)
        }
    }

    updateUserInfo () {    
        // 全民代理按钮显示
        this.btnAgent.active = UserInfo.defaultConfig.national_promoter_status && UserInfo.is_promoter == 0 && UserInfo.status_national == 1
        //下载按钮展示(有下载链接，并且是web版本， isApp: 1 安卓, 2 IOS)
        this.btnDownload.active = UserInfo.defaultConfig["download_url"] && UserInfo.defaultConfig["download_url"] != "" && UserInfo.isApp != "1" && UserInfo.isApp != "2"
        // 返水开关显示
        this.btnFanShui.active = UserInfo.defaultConfig.reverse_water_status && UserInfo.status_reverse_water == 1 
        // Shop按钮开关
        this.shopNode.active = UserInfo.defaultConfig.recharge_status && UserInfo.switch_shop == 1

        this.scheduleOnce(()=>{this.btn_layout.updateLayout(true)},0)
        
        this.labName.string = "" == UserInfo.cname ? UserInfo.uuid:UserInfo.cname
        this.changeAvatarSucc()
        if ("" == UserInfo.phone) {
            LoadingViewWrap.show()
            UIMgr.getInstance().openSingleView(UIConfig.BindPhone.path)
        }
    }

    updateMoney () {
        let m = Number(UserInfo.wallet_list.money).toFixed(2)
        this.labMoney.string = m.includes('.00') ? m.split('.')[0] : m
    }

    initData () {
        // if (0 == UserInfo.defaultConfig.activity_open) {
        //     this.btnUserData.node.setPosition(this.btnActivity.node.getPosition())
        //     this.btnActivity.node.active = false
        // }else {
        //     let pos = this.btnActivity.node.getPosition()
        //     this.btnUserData.node.setPosition(cc.v3(pos.x-134,pos.y))
        //     this.btnActivity.node.active = true
        // }
        
        if (null != UserInfo.wallet_list) {
            this.updateMoney()
        }

        if (UserInfo.activityReward) {
            for (let i=0; i<UserInfo.activityReward.length; i++) {
                UIMgr.getInstance().openView(UIConfig.ActivityTips.path,{data:UserInfo.activityReward[i]})
            }
        }
        
    }

    requestLineGroup () {
        if ("" != UserInfo.line_group) {
            // sys.openURL(UserInfo.line_group)
            window.open(UserInfo.line_group)
            return
        }else {
            httpRequest.post("api/v1/get-line-group",{},(succ:any) => {
                UserInfo.line_group = succ.Line_group
                // window.open(succ.Line_group)
                // sys.openURL(UserInfo.line_group)
            },(fail:any) => {
                
            })
        }
    }

    requestConfig () {
        // httpRequest.post("api/v1/get-setting",{
        //     "feature":"activity_open",
        // },(succ:any) => {
        //     if (0 == succ[0].status) {
        //         this.btnUserData.node.setPosition(this.btnActivity.node.getPosition())
        //         this.btnActivity.node.active = false
        //     }else {
        //         let pos = this.btnActivity.node.getPosition()
        //         this.btnUserData.node.setPosition(cc.v3(pos.x-134,pos.y))
        //         this.btnActivity.node.active = true
        //     }
        // },(fail:any) => {
            
        // })
    }

    requestMachineInfo () {
        httpRequest.post("api/v1/get-index",{
            game_cate:1,
        },(succ:any) => {
            this.gameData = succ
            this.gameIndex = this.gameData.game_cate_list[0].id

            let node = this.machineListNode.getChildByName("ScrollView").getChildByName("view").getChildByName("content").getChildByName("Node")
            for (let i=0; i<succ.game_list.length; i++) {
                if (1 == succ.game_list[i].type) {
                    this.prizePoolCoinAnim(this.labSlotPrize,Number(succ.game_list[i].lottery_pool.amount))
                    // this.imgSL.node.getComponent(UrlImageView).setUrl(succ.game_list[i].picture_url)
                    // node.getChildByName("item0").getChildByName("item").getChildByName("labPrize").getComponent(cc.Label).string = (Number(succ.game_list[i].lottery_pool.amount)).toString()
                }else if (2 == succ.game_list[i].type) {
                    this.prizePoolCoinAnim(this.labJackPrize,Number(succ.game_list[i].lottery_pool.amount))
                    // this.imgGZ.node.getComponent(UrlImageView).setUrl(succ.game_list[i].picture_url)
                    // node.getChildByName("item1").getChildByName("item").getChildByName("labPrize").getComponent(cc.Label).string = (Number(succ.game_list[i].lottery_pool.amount)).toString()
                }
            }
            
        },(fail:any) => {
            
        })
    }

    onMachineListRender (item: cc.Node, idx: number) {
        if (null != this.gameData.game_list[Math.abs(idx*2)+1]) {
            for (let i=0; i<2; i++) {
                let itemNode = item.getChildByName("item"+i).getChildByName("item")
                item.getChildByName("item"+i).active = true
            
                let img = itemNode.getChildByName("img")

                let data = this.gameData.game_list[Math.abs(idx)*2 + i]

                if ("" != data.picture_url) {
                    img.getComponent(UrlImageView).setUrl(data.picture_url)
                }

                if (1 == data.type) {
                    
                }else if (2 == data.type) {

                }

                itemNode.off(cc.Node.EventType.TOUCH_END)
                itemNode.on(cc.Node.EventType.TOUCH_END,() => {
                    
                })
            }
        }else {
            item.getChildByName("item1").active = false
            let itemNode = item.getChildByName("item0").getChildByName("item")

            let img = itemNode.getChildByName("img")

            let data = this.gameData.game_list[Math.abs(idx)*2]

            if ("" != data.picture_url) {
                img.getComponent(UrlImageView).setUrl(data.picture_url)
            }
            

            if (1 == data.type) {
                
            }else if (2 == data.type) {

            }

            itemNode.off(cc.Node.EventType.TOUCH_END)
            itemNode.on(cc.Node.EventType.TOUCH_END,() => {
                
            })
        }
    }
    

    initBottomClick () {
        this.downNode.children[0].getChildByName("img1").active = false
        this.downNode.children[0].getChildByName("img2").active = true
        this.downNode.children[0].getChildByName("img3").active = true
        for (let i=0; i<this.downNode.children.length; i++) {
            let node = this.downNode.children[i]
            node.on(cc.Node.EventType.TOUCH_START,(target:cc.EventTouch) => {
                if (null == this.gameData) {
                    return
                }
                // 只有主页面播放背景音乐
                if(0 == i && UserInfo.isOpenBgAudio){
                    audioMgr.replayMusic()
                } else{
                    audioMgr.pauseMusic()
                }
                if (this.bottomSelectIndex == i) {return}
                // if (2 != i) {UIMgr.getInstance().closeView(UIConfig.RealVideoNode.path)}
                // if (3 != i) {UIMgr.getInstance().closeView(UIConfig.MyJiTaiListNode.path)}
                UIMgr.getInstance().closeView(UIConfig.DianZiGameNode2.path)
                UIMgr.getInstance().closeView(UIConfig.RealVideoNode.path)
                UIMgr.getInstance().closeView(UIConfig.MyJiTaiListNode.path)
                this.parentNode.removeAllChildren()
                this.bottomSelectIndex = i
                for (let j=0; j<this.downNode.children.length; j++) {
                    this.downNode.children[j].getChildByName("img1").active = true
                    this.downNode.children[j].getChildByName("img2").active = false
                    this.downNode.children[j].getChildByName("img3").active = false
                }
                node.getChildByName("img1").active = false
                node.getChildByName("img2").active = true
                node.getChildByName("img3").active = true
                this.gameIndex = this.gameData.game_cate_list[i]?this.gameData.game_cate_list[i].id:1

                this.machineListNode.active = i == 0?true:false
                // 跑马灯展示
                this.paomadeng.active = i == 0

                let fun1 = (err:Error|null,view:BaseView|null) => {
                    if (null == err) {
                        if (1 != i) {
                            view.close()
                        }
                    }
                }
                let fun2 = (err:Error|null,view:BaseView|null) => {
                    if (null == err) {
                        if (2 != i) {
                            view.close()
                        }
                    }
                }
                if (1 == i) {
                    // LoadingViewWrap.show()
                    UIMgr.getInstance().openSingleView(UIConfig.DianZiGameNode2.path,null,1,this.parentNode,fun1)
                }

                if (2 == i) {
                    // LoadingViewWrap.show()
                    UIMgr.getInstance().openSingleView(UIConfig.RealVideoNode.path,null,1,this.parentNode,fun2)
                }

                if (3 == i) {
                    // LoadingViewWrap.show()
                    UIMgr.getInstance().openSingleView(UIConfig.MyJiTaiListNode.path,null,1,this.parentNode)
                }
                
            },this)
        }
    }

    btnSLClickCall () {
        if (null != this.gameData) {
            UserInfo.clickSLorGZ = 1
            this.types = this.gameData.game_list[1].id
            LoadingViewWrap.show()
            UIMgr.getInstance().openSingleView(UIConfig.SelectMachine.path,{game_id:this.types,is_free:0,cate_id:0,page:1,size:200,isSave:false})
        }
    }

    btnGZClickCall () {
        if (null != this.gameData) {
            UserInfo.clickSLorGZ = 2
            this.types = this.gameData.game_list[0].id
            LoadingViewWrap.show()
            UIMgr.getInstance().openSingleView(UIConfig.SelectMachine.path,{game_id:this.types,is_free:0,cate_id:0,page:1,size:200,isSave:false})
        }
    }

    btnPrizePoolClickCall (target:cc.EventTouch,customs:string) {
        let index = Number(customs)
        UserInfo.clickSLorGZ = index
        LoadingViewWrap.show()
        UIMgr.getInstance().openSingleView(UIConfig.PrizePool.path)
    }

    btnUserDataCall () {
        // LoadingViewWrap.show()
        UIMgr.getInstance().openSingleView(UIConfig.UserData.path)
    }

    btnSaveMoney () {
        // if (!UserInfo.has_set_play_password) {
        //     AlterTipsWrap.show("请设置支付密码")
        //     return
        // }

        // httpRequest.post("api/v1/get-recharge",{
            
        // },(succ:any) => {
        //     if (succ.recharge_record.length == 0 || JSON.stringify(succ.recharge_record) === "{}") {
                
        //         if (UserInfo.defaultConfig.q_talk_recharge_status || UserInfo.defaultConfig.q_talk_point_status || UserInfo.defaultConfig.q_talk_withdraw_status) {
        //             LoadingViewWrap.show()
        //             UIMgr.getInstance().openSingleView(UIConfig.SaveMoney.path)
        //         }else if (UserInfo.defaultConfig.recharge_status) {
        //             httpRequest.post("api/v1/get-recharge-method",{
        //                 amount:0,
        //             },(succ:any) => {
                       
        //                 succ.showNode = 1
        //                 LoadingViewWrap.show()
        //                 UIMgr.getInstance().openSingleView(UIConfig.KeFuSaveMoney.path,{succ:succ})
        //             },(fail:any) => {
                        
        //             })
        //         }
                
        //     }else {
        //         succ.recharge_record.showNode = 2
        //         LoadingViewWrap.show()
        //         UIMgr.getInstance().openSingleView(UIConfig.KeFuSaveMoney.path,{succ:succ.recharge_record})
        //     }
            
        // },(fail:any) => {
            
        // })
        // if (!UserInfo.has_set_play_password) {
        //     AlterTipsWrap.show("请设置支付密码")
        //     return
        // }
        Tools.httpReq("check-bind-bankcard", null, (res) => {
            // 先获取是否有正在进行的订单
            httpRequest.post("api/v1/get-recharge",{},(succ:any) => {
                // 如果没有正在进行的订单
                if (succ.recharge_record.length == 0 || JSON.stringify(succ.recharge_record) === "{}") {
                    httpRequest.post("api/v1/get-recharge-method", { amount:0 }, (succ:any) => {
                        succ.showNode = 1
                        LoadingViewWrap.show()
                        UIMgr.getInstance().openSingleView(UIConfig.ChongZhi.path,{succ:succ})
                    })
                // 如果有正在进行的订单
                }else {
                    succ.recharge_record.showNode = 2
                    LoadingViewWrap.show()
                    UIMgr.getInstance().openSingleView(UIConfig.ChongZhiDetail.path,{succ:succ.recharge_record})
                }
            })
        }, (res)=>{
            AlterTipsWrap.show("请先绑定银行卡")
        })
    }

    btnGameRecordCall () {
        LoadingViewWrap.show()
        UIMgr.getInstance().openSingleView(UIConfig.GameRecord.path)
    }

    btnNoticeCall () {
        LoadingViewWrap.show()
        UIMgr.getInstance().openSingleView(UIConfig.Notice.path)
    }

    btnKeFuCall () {
        // let width = this.node.getComponent(cc.UITransform).width
        // let height = this.node.getComponent(cc.UITransform).height
        // UserInfo.getKeFuLink(width,height)
        UserInfo.getKeFuLink(360,748)

        
    }

    btnRefreshCall () {
        let fun = () => {
            AlterTipsWrap.show("刷新成功")
        }
        UserInfo.requestUserInfo(fun)
    }

    btnSetCall () {
        // LoadingViewWrap.show()
        UIMgr.getInstance().openSingleView(UIConfig.LanguageSetNode.path)
    }

    btnSaveMachineCall () {
        httpRequest.post("api/v1/favorite-machine-list",{
            is_free:0,
            page:1,
            size:100
        },(succ:any) => {
            if (0 == succ.machines.length) {
                AlterTipsWrap.show("没有收藏机台")
                return
            }
            UserInfo.clickSLorGZ = 3
            this.types = this.gameData.game_list[0].id
            LoadingViewWrap.show()
            UIMgr.getInstance().openSingleView(UIConfig.SelectMachine.path,{game_id:this.types,is_free:0,cate_id:0,page:1,size:200,isSave:true,succ:succ.machines})
        },(fail:any) => {
            
        })
    }

    btnActivityCall () {
        httpRequest.post("api/v1/activity-list",{
            
        },(succ:any) => {
            if (0 < succ.length) {
                LoadingViewWrap.show()
                UIMgr.getInstance().openSingleView(UIConfig.Activity.path,succ)
            }else {
                AlterTipsWrap.show("暂无活动")
            }
        },(fail:any) => {
            
        })
    }

    btnBgAudioCall () {
        UserInfo.isOpenBgAudio = !UserInfo.isOpenBgAudio
        Tools.ActChild(this.node, "ListNode/btnAudio/img2", UserInfo.isOpenBgAudio)
        StoreMgr.getInstance().setBoolValue("isOpenBgAudio", UserInfo.isOpenBgAudio)
        if (UserInfo.isOpenBgAudio) {
            audioMgr.playMusic("common/audio/bg")
        }else {
            audioMgr.pauseMusic()
        }
    }

    btnRankCall () {
        UIMgr.getInstance().openSingleView(UIConfig.Rank.path)
    }

    /** 打开全民代理 */
    btnAllAgentCall() { UIMgr.getInstance().openSingleView(UIConfig.PopAllAgent.path) }

    /** 打开反水 */
    btnFanShuiCall() { 
        UIMgr.getInstance().openSingleView(UIConfig.PopFanShui.path) 
    }

    public update(dt: number): void {
        // this.kefuTime += dt
        // if (this.kefuTime > 0.3) {
        //     this.kefuTime = 0
        //     const iframe = document.getElementById('chat-widget-container')
        //     if (iframe) {
        //         console.log("-----------------",1)
        //         iframe.style.width = "10px"
        //         iframe.style.height = "10px"
        //     }
        // }
    }

}


