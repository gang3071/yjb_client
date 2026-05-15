
import { path, sys } from "cc"
import { Message } from "../../base/core/MessageMgr"
import { UIMgr } from "../../base/core/UIMgr"
import { LocalizadManager } from "../../base/localized/LocalizedManager"
import { utils } from "../../base/utils/utils"
import { AlterTipsWrap } from "../../base/utils/view/AlterTipsWrap"
import { LoadingViewWrap } from "../../base/utils/view/LoadingViewWrap"
import { MsgBoxWrap } from "../../base/utils/view/MsgBoxWrap"
import { getCurEnv } from "../../config/Env"
import { LabelConfig } from "../../config/LabelConfig"
import { UIConfig } from "../../config/UIConfig"
import { httpRequest } from "../../NetMgr/HttpRequest"
import { pushSocket } from "../../NetMgr/pushSocket"
import { SaveState } from '../Lobby/SaveState';
import { COUNTRY_CODE, SERVER_LIST, WSS_TYPE } from "../../config/ServerConfig"
import { StoreMgr } from "../../base/core/StoreMgr"
import { Tools } from "../../base/utils/util/Tools"

interface socketToMachine {
    socketObj:pushSocket,
    machineId:number
}

export class UserInfo {
    public static avatar:string = ""
    public static currency:string = null
    public static flag:string = ""
    public static id:number = 0
    public static phone:string = ""
    public static recommend_code:string = ""
    public static type:string = ""
    public static wallet_list:any = null
    public static playingMachine:any[] = []
    public static machine_play_num:number = 1

    public static clickSLorGZ:number = 1

    public static authorization:string = ""
    public static refreshAuthorization:string = ""

    public static infoFun:any = null

    public static socketObj:pushSocket = null

    public static authorizeCode:number = 0
    public static authorizeKey:string = ""

    public static LetTalkData:any = {}

    public static talk_user_id:any = null

    public static uuid:string = ""

    public static recommend_player_uuid:string = ""

    public static cname:string = ""

    public static has_set_play_password:boolean = false

    public static country_code:string = ""

    public static defaultAreaNum:string = COUNTRY_CODE

    public static AreaNum:string = "+" + COUNTRY_CODE

    public static avatar_index:number = -1

    public static keFuLink:string = ""

    public static isReqKeFuLink:boolean = false

    public static playingMachineInfo:any[] = []

    public static bindBankBardInfo:any = null

    public static machineIdTowebsocketObj:socketToMachine[] = []

    public static recharge_order_expiration:number = 0

    public static defaultConfig:any = null

    public static activityReward:any = null

    public static is_promoter:any = false

    public static need_jump_reg:any = true

    public static promoter_code:string = ""

    public static isApp:string = ""

    public static websocketUrl:string = SERVER_LIST[getCurEnv()]

    public static commonSocketObject:pushSocket = null
    public static prizePoolSocketObject:pushSocket = null

    public static mailNoReadNums:number = 0

    public static recommend_id:number = null

    public static isOpenBgAudio:boolean = false

    public static isPhoneAppLogin = null

    public static lineCode:string = ""
    
    public static lineState:string = ""

    public static lineAvatar:string = ""

    public static line_user_id:string = ""

    public static line_name:string = ""

    public static line_group:string = ""

    /** 全民代理名称 */
    public static national_promoter:string = ""
    /** 全民代理等级 */
    public static national_level:string = ""
    /** 充值按钮开关 */
    public static switch_shop:number = 0
    /** 玩家个人全民代理开关 */
    public static status_national:number = 0
    /** 反水开关 */
    public static status_reverse_water:number = 0
    


    public static requestUserInfo (callback?:any) {
        httpRequest.post("api/v1/player-info",{
        
        },(succ:any) => {
            this.setInfo(succ)
            if (callback) {
                callback()
            }
        },(fail:any) => {
            
        }) 
    }


    public static setInfo (data:any) {
        this.websocketUrl = SERVER_LIST[getCurEnv()]
        this.avatar = data.avatar
        this.currency = data.currency
        this.flag = data.flag
        this.id = data.id
        this.phone = data.phone || ""
        this.recommend_code = data.recommend_code
        this.type = data.type
        this.wallet_list = data.wallet_list
        // this.wallet_list.money = utils.keepTwoDecimalStr(Number(this.wallet_list.money))
        this.wallet_list.money = this.wallet_list.money
        this.playingMachine = data.playing_machine
        this.talk_user_id = data.talk_user_id
        this.uuid = data.uuid
        this.recommend_player_uuid = data.recommend_player_uuid
        this.cname = data.name
        this.has_set_play_password = data.has_set_play_password
        this.country_code = data.country_code || ""
        this.machine_play_num = data.machine_play_num
        this.recharge_order_expiration = Number(data.recharge_order_expiration)
        this.is_promoter = data.is_promoter
        this.mailNoReadNums = data.notice_num
        this.recommend_id = data.recommend_id
        /** 全民代理名称 */
        this.national_promoter = data.national_promoter
        /** 全民代理等级 */
        this.national_level = data.national_level
        /** 充值按钮开关 */
        this.switch_shop = data.switch_shop
        this.status_national = data.status_national
        this.status_reverse_water = data.status_reverse_water

        Message.dispatchEvent("PlayerNotice",{notice_num:data.notice_num})
        Message.dispatchEvent("UpdateUserInfo")
        Message.dispatchEvent("UpdateMoney")
    }

    public static closeCommonSocket () {
        if (this.commonSocketObject) {
            this.commonSocketObject.disconnect()
            this.commonSocketObject = null
        }
    }

    public static commonSocket () {
        this.closeCommonSocket()
        // 建立连接
        let uu = this.websocketUrl.split("//").pop()
        this.commonSocketObject = new pushSocket({
            url: WSS_TYPE + uu.slice(0,uu.length-1), // websocket地址
            app_key: '20f94408fc4c52845f162e92a253c7a3',
            auth: '/plugin/webman/push/auth' // 订阅鉴权(仅限于私有频道)
        });
        // 假设用户uid为1
        let uid = UserInfo.id;
        // 浏览器监听user-1频道的消息，也就是用户uid为1的用户消息
        let user_channel = this.commonSocketObject.subscribe('player-' + uid);
        user_channel.on('message', (data) => {
            // data里是消息内容
            let msg = JSON.parse(data.content)
            // console.log("-----commonSocket-----",msg.msg_type,msg);
            if (msg.msg_type == "player_info") {
                Message.dispatchEvent("UpdateMachineData",msg)
                UserInfo.wallet_list.money = utils.keepTwoDecimalStr(Number(msg.amount_after))
                Message.dispatchEvent("UpdateMoney")
                if (10 == msg.type) {
                    Message.dispatchEvent("GetActivityReward",msg.amount.toString())
                }
            }
            if (msg.msg_type == "player_activity_phase") {
                UIMgr.getInstance().openView(UIConfig.ActivityTips.path,{data:msg})
            }
            if (msg.msg_type == "player_lottery_allow") {
                UIMgr.getInstance().openView(UIConfig.PrizeTips.path,{data:msg, type:"socket"})
            }
            if (msg.msg_type == "player_notice") {
                this.mailNoReadNums = msg.notice_num
                Message.dispatchEvent("PlayerNotice",msg)
            }
            if (msg.msg_type == "player_notice_num") {
                Message.dispatchEvent("MailNums",msg)
            }
            if (msg.msg_type == "player_machine_keeping") {
                Message.dispatchEvent("MachineKeepTime",msg)
            }
        });


        let prizePookl_channel = this.commonSocketObject.subscribe('group-lottery-pool');
        prizePookl_channel.on('message',(data) => {
            let msg = JSON.parse(data.content)
            // console.log("-----prizepool socket-----",msg);
            Message.dispatchEvent("PrizePoolChange",msg)
        })
    }

    public static initGameSocket (machine_id:number) {
        // if (null != this.socketObj && this.socketObj.connection.state !== "") {
        //     return
        // }
        for (let i=0; i<this.machineIdTowebsocketObj.length; i++) {
            if (machine_id == this.machineIdTowebsocketObj[i].machineId) {
                return
            }
        }
       
        // 建立连接
        let uu = this.websocketUrl.split("//").pop()
        
        let socketObj = new pushSocket({
            url: WSS_TYPE + uu.slice(0,uu.length-1), // websocket地址
            app_key: '20f94408fc4c52845f162e92a253c7a3',
            auth: '/plugin/webman/push/auth', // 订阅鉴权(仅限于私有频道)
            failed: () => {
                this.initGameSocket(machine_id)
            }
        });
        // 假设用户uid为1
        let uid = UserInfo.id;
        // 浏览器监听user-1频道的消息，也就是用户uid为1的用户消息
        let user_channel = socketObj.subscribe('player-' + uid + "-" + machine_id);
        let user_channel_2 = socketObj.subscribe('group-' + machine_id);

        let obj:socketToMachine = {
            machineId:machine_id,
            socketObj:socketObj
        }

        this.machineIdTowebsocketObj.push(obj)

        // 当user-1频道有message事件的消息时
        user_channel.on('message', (data) => {
            // data里是消息内容
            let msg = JSON.parse(data.content)
            // console.log("-- game message----",msg.msg_type,msg);
            if (msg.msg_type == "machine_data") {
                Message.dispatchEvent("UpdateMachineData",msg)
                UserInfo.wallet_list.money = utils.keepTwoDecimalStr(Number(msg.game_amount))
                Message.dispatchEvent("UpdateMoney")
            }else if (msg.msg_type == "kick_out") {
                console.log("user_channel被踢出游戏",msg);
                UserInfo.wallet_list.money = utils.keepTwoDecimalStr(Number(msg.after_game_amount))
                Message.dispatchEvent("UpdateMoney")
                this.closeGameSocket(machine_id)
                Message.dispatchEvent("KickOutGame",msg)
                let str = msg.machine_name + " " + msg.machine_code + "\n\n" + Tools.GetLocalized("长时间未操作，被踢出游戏")
                MsgBoxWrap.showConfirm(str, () => {})
            }else if (msg.msg_type == "machine_start") {
                if (UserInfo.id != msg.gaming_user_id) {
                    Message.dispatchEvent("UpdateMoney")
                    this.closeGameSocket(machine_id)
                    Message.dispatchEvent("KickOutGame",msg)

                    MsgBoxWrap.showConfirm(Tools.GetLocalized("该机台被其他玩家使用，被踢出游戏"),() => {})
                }
            }else if (msg.msg_type == "player_machine_keeping") {
                Message.dispatchEvent("player_machine_keeping",msg)
            }else if (msg.msg_type == "auto") {
                Message.dispatchEvent("auto",msg)
            // 机器信息改变
            }else if (msg.msg_type == "machine_now_info"){
                Message.dispatchEvent("UpdateMachineData", msg)
            }
        });
        
        user_channel_2.on('message', (data) => {
            // data里是消息内容
            let msg = JSON.parse(data.content)
            // console.log(msg.msg_type,msg);
            if (msg.msg_type == "machine_data") {
                Message.dispatchEvent("UpdateMachineData",msg)
                console.log("=====",msg.game_amount)
                UserInfo.wallet_list.money = utils.keepTwoDecimalStr(Number(msg.game_amount))
                Message.dispatchEvent("UpdateMoney")
            }else if (msg.msg_type == "kick_out") {
                console.log("user_channel_2被踢出游戏",msg);
                UserInfo.wallet_list.money = utils.keepTwoDecimalStr(Number(msg.after_game_amount))
                Message.dispatchEvent("UpdateMoney")
                this.closeGameSocket(machine_id)
                Message.dispatchEvent("KickOutGame",msg)
                
                let str = msg.machine_name + " " + msg.machine_code + "\n\n" + Tools.GetLocalized("该机台被其他玩家使用，被踢出游戏")
                MsgBoxWrap.showConfirm(str,() => {})
            }else if (msg.msg_type == "machine_start") {
                if (UserInfo.id != msg.gaming_user_id) {
                    Message.dispatchEvent("UpdateMoney")
                    this.closeGameSocket(machine_id)
                    Message.dispatchEvent("KickOutGame",msg)
                    MsgBoxWrap.showConfirm(Tools.GetLocalized("该机台被其他玩家使用，被踢出游戏"),() => {})
                }
            }else if (msg.msg_type == "machine_reward_end" && UserInfo.id != msg.gaming_user_id) {
                Message.dispatchEvent("machine_reward_end",msg)
            }
        });
    }

    public static closeGameSocket (machine_id:number) {
        console.log("====closeGameSocket=====",machine_id,this.machineIdTowebsocketObj)
        let socketObj:pushSocket = null
        for (let i=0; i<this.machineIdTowebsocketObj.length; i++) {
            if (machine_id == this.machineIdTowebsocketObj[i].machineId) {
                socketObj = this.machineIdTowebsocketObj[i].socketObj
            }
        }
        if (null == socketObj) {
            console.error("没找到socket")
            return
        }
        if (socketObj.connection.state !== "") {
            socketObj.connection.closeAndClean()
            socketObj.disconnect()
            socketObj = null
            for (let i=this.machineIdTowebsocketObj.length-1; 0 <= i; i--) {
                if (machine_id == this.machineIdTowebsocketObj[i].machineId) {
                    this.machineIdTowebsocketObj.splice(i, 1)
                    return
                }
            }
        }

    }

    /** 关闭所有游戏链接 */
    public static closeAllGameSocket () {
        for (let i=0; i<this.machineIdTowebsocketObj.length; i++) {
            this.machineIdTowebsocketObj[i].socketObj.disconnect()
        }
        this.machineIdTowebsocketObj = []
    }

    public static setupWebViewJavascriptBridge(callback) {
        if (window["WebViewJavascriptBridge"]) {
            //@ts-ignore
            return callback(WebViewJavascriptBridge)
        }
        if (window["WVJBCallbacks"]) {
            return window["WVJBCallbacks"].push(callback)
        }
        window["WVJBCallbacks"] = [callback];
        let WVJBIframe = document.createElement("iframe");
        WVJBIframe.style.display = "none";
        WVJBIframe.src = "wvjbscheme://__BRIDGE_LOADED__";
        document.documentElement.appendChild(WVJBIframe);
        setTimeout( () => {
            document.documentElement.removeChild(WVJBIframe)
        }, 0)
    }

    public static registerNativeCallbacks() {
        this.setupWebViewJavascriptBridge((bridge) => {
            // 注册可以被原生调用的方法
            bridge.registerHandler('updateUserInfo', (data: string, responseCallback: Function) => {
                console.log("Received from native:", data);
                Tools.httpReq("exit-game", {}, () => {})
                
                // 如果需要回调原生
                if (responseCallback) {
                    responseCallback("success");
                }
            });
        });
    }

    public static saveMoney (str:string) {
        // UIMgr.getInstance().openSingleView(UIConfig.SaveState.path,{str:"充值中"})
        this.setupWebViewJavascriptBridge((bridge) => {
            bridge.callHandler('topup', str, (responseData:any) => {
                console.log("topup:", responseData)
                let msg = JSON.parse(responseData)
                let desc:string = ""
                if (1 == msg.code) {
                    desc = "转入成功"
                    UserInfo.requestUserInfo()
                    Message.dispatchEvent("CZSuccess")
                }else if (0 == msg.code || 1004 == msg.code) {
                    
                    desc = msg.error
                }
                LoadingViewWrap.show()
                UIMgr.getInstance().openSingleView(UIConfig.SaveState.path,{str:desc})
            })
        })
    }

    public static takeMoney (str:string) {
        this.setupWebViewJavascriptBridge((bridge) => {
            bridge.callHandler('withdrawal', str, (responseData:any) => {
                console.log("withdrawal:", responseData)
                let msg = JSON.parse(responseData)
                if (1 == msg.code) {
                    AlterTipsWrap.show("提现成功")
                    UIMgr.getInstance().closeView(UIConfig.TakeMoney.path)
                }else if (0 == msg.code) {
                    AlterTipsWrap.show(msg.error)
                }
            })
        })
    }

    public static QSaveMoney (str:string) {
        this.setupWebViewJavascriptBridge((bridge) => {
            bridge.callHandler('getOffLine', str, (responseData:any) => {
                console.log("getOffLine:", responseData)
                // let msg = JSON.parse(responseData)
                // if (1 == msg.code) {
                //     AlterTipsWrap.show("提现成功")
                //     UIMgr.getInstance().closeView(UIConfig.TakeMoney.path)
                // }else if (0 == msg.code) {
                //     AlterTipsWrap.show(msg.error)
                // }
            })
        })
    }

    public static getQYuE (lab) {
        this.setupWebViewJavascriptBridge((bridge) => {
            bridge.callHandler('getBalance', "", (responseData:any) => {
                console.log("getBalance:", responseData)
                lab.string = (Number(responseData)/100)
                // let msg = JSON.parse(responseData)
                // if (1 == msg.code) {
                    
                // }else if (0 == msg.code) {
                //     AlterTipsWrap.show(msg.error)
                // }
            })
        })
    }

    public static finish () {
        this.setupWebViewJavascriptBridge((bridge) => {
            bridge.callHandler('finish', "", (responseData:any) => {
                console.log("finish:", responseData)
            })
        })
    }

    /** 通过安卓原生打开游戏 */
    public static openGame(url){
        this.setupWebViewJavascriptBridge((bridge) => {
            bridge.callHandler('openGame', url, () => {})
        })
    }

    /** 获取设备信息 */
    public static getMachineNo(){
        this.setupWebViewJavascriptBridge((bridge) => {
            bridge.callHandler('getMachineNo', "", (responseData:any) => {
                let msg = JSON.parse(responseData)
                if (200 == msg.code) {
                    // 设备信息
                    msg.data
                }else if (0 == msg.code) {
                    AlterTipsWrap.show(msg.error)
                }
            })
        })
    }

    /** 开始收款 */
    public static startCollectMoney(){
        this.setupWebViewJavascriptBridge((bridge) => {
            bridge.callHandler('startCollectMoney', "", (responseData:any) => {
                let msg = JSON.parse(responseData)
                if (200 == msg.code) {
                    
                }else if (0 == msg.code) {
                    AlterTipsWrap.show(msg.error)
                }
            })
        })
    }

    /** 结束收款 */
    public static stopCollectMoney(){
        this.setupWebViewJavascriptBridge((bridge) => {
            bridge.callHandler('stopCollectMoney', "", (responseData:any) => {
                let msg = JSON.parse(responseData)
                if (200 == msg.code) {
                    
                }else if (0 == msg.code) {
                    AlterTipsWrap.show(msg.error)
                }
            })
        })
    }

    /** 结束页面 */
    public static onCollectFinish(){
        this.setupWebViewJavascriptBridge((bridge) => {
            bridge.callHandler('onFinish', "", (responseData:any) => {
                let msg = JSON.parse(responseData)
                if (200 == msg.code) {
                    
                }else if (0 == msg.code) {
                    AlterTipsWrap.show(msg.error)
                }
            })
        })
    }

    public static getKeFuLink (width:number,height:number) {
        //@ts-ignore
        if (window.Tawk_API) {
            //@ts-ignore
            window.Tawk_API.setAttributes({
                'phone' : UserInfo.country_code + "  " + UserInfo.phone,
            }, function(error){
                console.log("===setAttributes===",error)
            });
            //@ts-ignore
            window.Tawk_API.toggle();
        }
        
        return
        const iframe = document.getElementById('chat-widget-minimized') as HTMLIFrameElement;
        // iframe.style.padding = 100 + "px"
        if (iframe) {
            var iframeDocument = iframe.contentWindow.document;
            iframeDocument.querySelectorAll('button')[0].click()
            setTimeout(() => {
                iframeDocument.querySelectorAll('button')[0].click()
            }, 500)
        }
        
        return

        // if (this.isReqKeFuLink) {return}
        // if ("" != this.keFuLink) {
        //     UIMgr.getInstance().openSingleView(UIConfig.KeFu.path)
        //     return
        // }

        httpRequest.post("api/v1/get-chat",null,(succ:any) => {
            console.log("------",UserInfo.isPhoneAppLogin,succ.chat_url)
            if (sys.browserType == "safari") {
                window.location.href = succ.chat_url
            }else {
                sys.openURL(succ.chat_url)
            }
            return
            if (null == UserInfo.isPhoneAppLogin) {
                if (sys.browserType == "safari") {
                    window.location.href = succ.chat_url
                }else {
                    sys.openURL(succ.chat_url)
                }
                
            }else {
                // sys.openURL(succ.chat_url)
                this.keFuLink = succ.chat_url + "&width="+width + "&height=" + height
                // console.log("---原生--",UIConfig.KeFu.path)
                LoadingViewWrap.show()
                UIMgr.getInstance().openSingleView(UIConfig.KeFu.path)
            }
            // sys.openURL(succ.chat_url+ "&isWeb=1");
            // this.keFuLink = succ.chat_url + "&width="+width + "&height=" + height
            // if (sys.isNative) {
                
            //     this.keFuLink = succ.chat_url + "&width="+width + "&height=" + height
            //     console.log("---原生--",UIConfig.KeFu.path)
            //     // UIMgr.getInstance().openSingleView(UIConfig.KeFu.path)
            // }else {
            //     this.keFuLink = succ.chat_url + "&width="+width + "&height=" + height
            //     console.log("---H5--",succ.chat_url+ "&isWeb=1")
            //     sys.openURL(succ.chat_url+ "&isWeb=1");
            //     // UIMgr.getInstance().openSingleView(UIConfig.KeFu.path)
            // }
            
            // 
        },(fail:any) => {
            
        })
    }
}