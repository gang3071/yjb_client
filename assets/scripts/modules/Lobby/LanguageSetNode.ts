import * as cc from 'cc';
import { BaseView } from '../../base/frame/BaseView';
import { LANGUAGE_TYPE, LocalizadManager } from '../../base/localized/LocalizedManager';
const { ccclass, property } = cc._decorator;

@ccclass('LanguageSetNode')
export class LanguageSetNode extends BaseView {

    @property(cc.Layout)
    setLayout:cc.Layout = null

    private color3:cc.Color = new cc.Color(163,157,228)
    private color4:cc.Color = new cc.Color(255,155,11)

    start() {
        this.setSelectLanguage()
        let layoutChild = this.setLayout.node.children
        for (let i=0; i<layoutChild.length; i++) {
            let item = layoutChild[i]
            item.on(cc.Node.EventType.TOUCH_END,(target:cc.EventTouch) => {
                
                    for (let j=0; j<layoutChild.length; j++) {
                        let node = layoutChild[j]
                        node.getChildByName("img1").active = true
                        node.getChildByName("img2").active = false
                        node.getChildByName("name").getComponent(cc.Label).color = this.color3
                    }
                    // if (i != layoutChild.length-1){
                        target.getCurrentTarget().getChildByName("img1").active = false
                        target.getCurrentTarget().getChildByName("img2").active = true
                    // }
                    
                    target.getCurrentTarget().getChildByName("name").getComponent(cc.Label).color = this.color4
                    
                
            },this)
        }
    }

    setSelectLanguage () {
        let index = LocalizadManager.getInstance().getLanauge()
        let layoutChild = this.setLayout.node.children
        for (let j=0; j<layoutChild.length; j++) {
            let node = layoutChild[j]
            node.getChildByName("img1").active = true
            node.getChildByName("img2").active = false
            node.getChildByName("name").getComponent(cc.Label).color = this.color3
        }

        layoutChild[index-1].getChildByName("img1").active = false
        layoutChild[index-1].getChildByName("img2").active = true
        layoutChild[index-1].getChildByName("name").getComponent(cc.Label).color = this.color4
    }

    btnLanguageCall (target:cc.EventTouch,custom:string) {
        let index = Number(custom)
        let type = LANGUAGE_TYPE.ZH
        if (0 == index) {
            type = LANGUAGE_TYPE.ZH
        }else if (1 == index) {
            type = LANGUAGE_TYPE.FT
        }else if (2 == index) {
            type = LANGUAGE_TYPE.EN
        }else if (3 == index) {
            type = LANGUAGE_TYPE.JP
        }
        
        LocalizadManager.getInstance().switchLanguage(type)
        this.scheduleOnce(() => {
            this.btnSetBgCall()
        },0.1)
        
    }

    btnSetBgCall () {
        this.close()
    }

    update(deltaTime: number) {
        
    }
}


