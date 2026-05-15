import * as cc from 'cc';
import { Message } from '../../base/core/MessageMgr';
import { StoreMgr } from '../../base/core/StoreMgr';
import { BaseView } from '../../base/frame/BaseView';
import { LocalizadManager } from '../../base/localized/LocalizedManager';
import List from '../../common/scroll/List';
import { LabelConfig } from '../../config/LabelConfig';
import { UserInfo } from '../common/UserInfo';
const { ccclass, property } = cc._decorator;

@ccclass('ChangeLine')
export class ChangeLine extends BaseView {

    @property(List)
    lineList:List = null

    private currLine:number = 0

    private defaultNameArr:string[] = ["线 路 一","线 路 二","线 路 三","线 路 四"]
    private defaultNameArr2:string[] = ["线 路 一（当前选择）","线 路 二（当前选择）","线 路 三（当前选择）","线 路 四（当前选择）"]

    private color1:cc.Color = new cc.Color(167,18,13)
    private color2:cc.Color = new cc.Color(9,20,90)

    start() {
        this.currLine = StoreMgr.getInstance().getIntValue("CURR_LINE",0)
        let l = this.m_uidata.data.media_combine.length 
        this.lineList.numItems = l > 4 ? 4 : l
    }

    renderEvent (item: cc.Node, idx: number) {
        let str = LabelConfig[this.defaultNameArr[Math.abs(idx)]] ? LabelConfig[this.defaultNameArr[Math.abs(idx)]][LocalizadManager.getInstance().getLanauge()-1]:LabelConfig[this.defaultNameArr[Math.abs(idx)]]
        item.getChildByName("name").getComponent(cc.Label).string = str
        item.getChildByName("name").getComponent(cc.LabelOutline).color = this.color1
        if (Math.abs(idx) == this.currLine) {
            item.getComponent(cc.Button).interactable = false
            let str2 = LabelConfig[this.defaultNameArr2[Math.abs(idx)]] ? LabelConfig[this.defaultNameArr2[Math.abs(idx)]][LocalizadManager.getInstance().getLanauge()-1]:LabelConfig[this.defaultNameArr2[Math.abs(idx)]]
            item.getChildByName("name").getComponent(cc.Label).string = str2
            item.getChildByName("name").getComponent(cc.LabelOutline).color = this.color2
        }else {
            item.getComponent(cc.Button).interactable = true
        }
        
    }

    listItemClick (item: cc.Node, selectedId: number, lastSelectedId: number, val: number) {
        for (let i=0; i<item.parent.children.length; i++) {
            let str = LabelConfig[this.defaultNameArr[i]] ? LabelConfig[this.defaultNameArr[i

            ]][LocalizadManager.getInstance().getLanauge()-1]:LabelConfig[this.defaultNameArr[i]]
            let str2 = LabelConfig[this.defaultNameArr2[selectedId]] ? LabelConfig[this.defaultNameArr2[selectedId]][LocalizadManager.getInstance().getLanauge()-1]:LabelConfig[this.defaultNameArr2[selectedId]]

            //UserInfo.closeAllGameSocket()
            item.parent.children[i].getComponent(cc.Button).interactable = true
            item.parent.children[i].getChildByName("name").getComponent(cc.Label).string = str
            item.parent.children[i].getChildByName("name").getComponent(cc.LabelOutline).color = this.color1
            if (selectedId == i) {
                item.parent.children[i].getComponent(cc.Button).interactable = false
                item.getChildByName("name").getComponent(cc.Label).string = this.defaultNameArr2[selectedId]
                item.getChildByName("name").getComponent(cc.LabelOutline).color = this.color2
                StoreMgr.getInstance().setIntValue("CURR_LINE",selectedId)
                this.scheduleOnce(() => {
                    Message.dispatchEvent("ChangeLine",selectedId)
                    this.close()
                },0.1)
            }
        }
    }

    btnCloseCall () { this.close() }
}


