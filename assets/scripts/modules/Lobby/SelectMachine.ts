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
const { ccclass, property } = cc._decorator;

@ccclass('SelectMachine')
export class SelectMachine extends BaseView {

    @property(cc.Node)
    downNode:cc.Node = null

    @property(cc.Node)
    parentNode:cc.Node = null

    private gameData:any = null

    private clickRefresh:boolean = false

    private color1:cc.Color = new cc.Color(255,255,255)
    private color2:cc.Color = new cc.Color(255,155,11)

    private widget1:number = 300
    private widget2:number = 154

    private jiTaiSelectId:number = 0

    private bottomSelectIndex = 0

    start() {
        // this.initEventListen()
        // this.initData()
        LoadingViewWrap.show()
        if (this.m_uidata.isSave) {
            UIMgr.getInstance().openSingleView(UIConfig.FavoriteMachineList.path,this.m_uidata.succ,null,this.parentNode)
        }else {
            UIMgr.getInstance().openSingleView(UIConfig.MachineList.path,{game_id:this.m_uidata.game_id,is_free:this.m_uidata.is_free,
                cate_id:this.m_uidata.cate_id,page:this.m_uidata.page,size:this.m_uidata.size,isSave:this.m_uidata.isSave,succ:this.m_uidata.succ},null,this.parentNode)
        }
        

        this.initBottomClick()
    }

    onEnable () {

    }

    initBottomClick () {
        this.downNode.children[0].getChildByName("img1").active = false
        this.downNode.children[0].getChildByName("img2").active = true
        this.downNode.children[0].getChildByName("img3").active = true
        for (let i=0; i<this.downNode.children.length; i++) {
            let node = this.downNode.children[i]
            node.on(cc.Node.EventType.TOUCH_START,(target:cc.EventTouch) => {
                if (this.bottomSelectIndex == i) {return}
                this.parentNode.destroyAllChildren()
                this.bottomSelectIndex = i
                for (let j=0; j<this.downNode.children.length; j++) {
                    this.downNode.children[j].getChildByName("img1").active = true
                    this.downNode.children[j].getChildByName("img2").active = false
                    this.downNode.children[j].getChildByName("img3").active = false
                }
                node.getChildByName("img1").active = false
                node.getChildByName("img2").active = true
                node.getChildByName("img3").active = true

                let eventName:string = ""
                if (0 == i) {
                    eventName = "ShiTiJiTai"
                }else if (1 == i) {
                    eventName = "DianZiGame"
                }else if (2 == i) {
                    eventName = "RealVideo"
                }else if (3 == i) {
                    eventName = "MyJiTai"
                }
                Message.dispatchEvent(eventName)
                this.close()
                UIMgr.getInstance().closeView(UIConfig.SelectMachine.path)
                // if (0 == i) {
                //     UIMgr.getInstance().openView(UIConfig.MachineList.path,{game_id:this.m_uidata.game_id,is_free:this.m_uidata.is_free,
                //         cate_id:this.m_uidata.cate_id,page:this.m_uidata.page,size:this.m_uidata.size,isSave:this.m_uidata.isSave,succ:this.m_uidata.succ},1,this.parentNode)
                // }

                // if (2 == i) {
                //     UIMgr.getInstance().openView(UIConfig.RealVideoNode.path,null,1,this.parentNode)
                // }

                // if (3 == i) {
                //     UIMgr.getInstance().openView(UIConfig.MyJiTaiListNode.path,null,1,this.parentNode)
                // }
                
            },this)
        }
    }
}


