import * as cc from 'cc';
import { Message } from '../../base/core/MessageMgr';
import { UIMgr } from '../../base/core/UIMgr';
import { BaseView } from '../../base/frame/BaseView';
import { UrlImageView } from '../../base/gui/urlImageView';
import { LocalizadManager } from '../../base/localized/LocalizedManager';
import { utils } from '../../base/utils/utils';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { LoadingViewWrap } from '../../base/utils/view/LoadingViewWrap';
import List from '../../common/scroll/List';
import { LabelConfig } from '../../config/LabelConfig';
import { UIConfig } from '../../config/UIConfig';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { UserInfo } from '../common/UserInfo';
import { UserDataGameNode } from './UserDataGameNode';
const { ccclass, property } = cc._decorator;

@ccclass('UserData')
export class UserData extends BaseView {

    private currNode:number = 1
    private detailListData:any = null

    private typeNameArr:string[] = ["","修改金额","玩家赠送转入","玩家赠送转出","机台上分","机台下分","充值","提现"]

    private typeTitleName:string[] = ["全部","充值提现","游戏参与","转点获赠"]

    private color1:cc.Color = new cc.Color(74,223,101)
    private color2:cc.Color = new cc.Color(223,74,163)
    private color3:cc.Color = new cc.Color(163,157,228)
    private color4:cc.Color = new cc.Color(255,155,11)

    private itemPath:string[] = [UIConfig.UserDataInfoNode.path,UIConfig.UserDataLiChengNode.path,UIConfig.UserDataGameNode.path]

    start() {
        this.initEventListen()
        // this.initData()
        let itemParent = cc.find("content/itemParent",this.node)
        let parent = cc.find("content/parent",this.node)
        for (let i=0; i<itemParent.children.length; ++i) {
            let node = itemParent.children[i]
            node.on(cc.Node.EventType.TOUCH_END,(target:cc.EventTouch) => {
                for (let j=0; j<itemParent.children.length; ++j) {
                    itemParent.children[j].getChildByName("img1").active = true
                    itemParent.children[j].getChildByName("img2").active = false
                }
                let obj = target.getCurrentTarget() as cc.Node
                obj.getChildByName("img2").active = true
                for (let j=0; j<this.itemPath.length; j++) {
                    UIMgr.getInstance().closeView(this.itemPath[j])
                }
                // LoadingViewWrap.show()
                UIMgr.getInstance().openSingleView(this.itemPath[i],{},1,parent)
            })
        }
        // LoadingViewWrap.show()
        UIMgr.getInstance().openSingleView(this.itemPath[0],{},1,parent)
    }

    onDisable() {
        this.cancelEventListen()
    }

    initEventListen () {

    }
    
    cancelEventListen () {

    }

    resetPwdSucc () {

    }

    btnCloseCall() {
        this.close()
        for (let j=0; j<this.itemPath.length; j++) {
            UIMgr.getInstance().closeView(this.itemPath[j])
        }
    }
}


