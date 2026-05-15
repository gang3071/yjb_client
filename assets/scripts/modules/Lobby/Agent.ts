import * as cc from 'cc';
import { UIMgr } from '../../base/core/UIMgr';
import { BaseView } from '../../base/frame/BaseView';
import { LoadingViewWrap } from '../../base/utils/view/LoadingViewWrap';
import { UIConfig } from '../../config/UIConfig';
import { UserInfo } from '../common/UserInfo';
const { ccclass, property } = cc._decorator;

@ccclass('Agent')
export class Agent extends BaseView {

    @property([cc.Node])
    topNode:cc.Node[] = []

    @property(cc.Node)
    topNode1:cc.Node = null

    @property(cc.Node)
    topNode2:cc.Node = null

    @property(cc.Node)
    content:cc.Node = null

    private labColor1:cc.Color = new cc.Color(148,142,208)
    private labColor2:cc.Color = new cc.Color(255,155,11)

    private prefabPath:string[] = [UIConfig.PromotionData.path,UIConfig.MyPlayer.path,UIConfig.MyTeam.path]

    private currIndex:number = -1

    start() {
        this.initData()
    }

    initData () {
        if (null == UserInfo.recommend_id || 0 == UserInfo.recommend_id) {
            //一级代理
            this.topNode1.active = true
            this.topNode2.active = false
        }else {
            this.topNode1.active = false
            this.topNode2.active = true
        }
        for (let i=1; i<this.topNode1.children.length; i++) {
            let node = this.topNode1.children[i]
            node.on(cc.Node.EventType.TOUCH_END,(touch:cc.EventTouch) => {
                for (let j=1; j<this.topNode1.children.length; j++) {
                    this.topNode1.children[j].getChildByName("line").active = false
                    this.topNode1.children[j].getChildByName("Layout").getChildByName("Label").getComponent(cc.Label).color = this.labColor1
                }
                let target = touch.getCurrentTarget()
                target.getChildByName("line").active = true
                target.getChildByName("Layout").getChildByName("Label").getComponent(cc.Label).color = this.labColor2
                this.switchItem(i-1)
            })
        }

        for (let i=1; i<this.topNode2.children.length; i++) {
            let node = this.topNode2.children[i]
            node.on(cc.Node.EventType.TOUCH_END,(touch:cc.EventTouch) => {
                for (let j=1; j<this.topNode2.children.length; j++) {
                    this.topNode2.children[j].getChildByName("line").active = false
                    this.topNode2.children[j].getChildByName("Layout").getChildByName("Label").getComponent(cc.Label).color = this.labColor1
                }
                let target = touch.getCurrentTarget()
                target.getChildByName("line").active = true
                target.getChildByName("Layout").getChildByName("Label").getComponent(cc.Label).color = this.labColor2
                this.switchItem(i-1)
            })
        }

        // for (let i=0; i<this.topNode.length; i++) {
        //     this.topNode[i].on(cc.Node.EventType.TOUCH_END,(touch:cc.EventTouch) => {
        //         for (let j=0; j<this.topNode.length; j++) {
        //             this.topNode[j].getChildByName("line").active = false
        //             this.topNode[j].getChildByName("Layout").getChildByName("Label").getComponent(cc.Label).color = this.labColor1
        //         }
        //         let target = touch.getCurrentTarget()
        //         target.getChildByName("line").active = true
        //         target.getChildByName("Layout").getChildByName("Label").getComponent(cc.Label).color = this.labColor2
        //         this.switchItem(i)
        //     })
        // }

        this.switchItem(0)
    }

    switchItem (index:number) {
        if (index == this.currIndex) {
            return
        }
        this.currIndex = index
        for (let i=0; i<this.content.children.length; i++) {
            let node = this.content.children[i]
            node.destroy()
        }
        // this.content.removeAllChildren()
        // this.m_resLoader.loadPrefabNode(this.prefabPath[index],(node:cc.Node) => {
        //     node.parent = this.content
        // })
        LoadingViewWrap.show()
        UIMgr.getInstance().openSingleView(this.prefabPath[index],null,1,this.content)
    }

    btnCloseCall () {
        this.close()
        for (let j=0; j<this.prefabPath.length; j++) {
            UIMgr.getInstance().closeView(this.prefabPath[j])
        }
    }
}


