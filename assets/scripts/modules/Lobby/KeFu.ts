import * as cc from 'cc';
import { UIMgr } from '../../base/core/UIMgr';
import { BaseView } from '../../base/frame/BaseView';
import { UIConfig } from '../../config/UIConfig';
import { UserInfo } from '../common/UserInfo';
const { ccclass, property } = cc._decorator;

@ccclass('KeFu')
export class KeFu extends BaseView {

    @property(cc.Node)
    h5Game: cc.Node = null;//webView所在节点

    private iframe: any = null


    start() {
        this.h5Game.getComponent(cc.WebView).url = UserInfo.keFuLink
        
        this.h5Game.on('loaded', this.onWebViewLoaded, this);
    }

    onWebViewLoaded() {
        window.addEventListener("message", this.receiveMessage, false);
        // let self = this;

        // console.log("=444444==",this.node.getComponent(cc.UITransform))

        if (null != UserInfo.isPhoneAppLogin) {
            var btn = document.createElement("div");
            btn.style.position = "fixed"
            btn.style.color = "white"
            btn.style.top = "15px"
            btn.style.left = "20px"
            btn.style.width = "100"
            btn.style.height = "100"
            btn.style.opacity = "0"
            btn.innerHTML = '返回';
            var main = document.getElementById('GameDiv');
            main.appendChild(btn);
        
            btn.onclick = (function (param) {
                main.removeChild(btn);//移除按钮
                parent.postMessage("cocos", "*")
            })
        }else {
            
        }
        

        setTimeout(() => {
            let canv = document.getElementById("GameDiv")
            let web = document.getElementById("webview-wrapper")
            console.log("----88--",canv.style.width,canv.style.height)
            web.style.transform = "none"
            web.style.width = canv.style.width
            web.style.height = canv.style.height
        },50)

        
        
    }

    receiveMessage (event) {
        console.log("child receiveMessage", event.data);
        if ("cocos-close" == event.data) {
            UIMgr.getInstance().closeView(UIConfig.KeFu.path)
        }
        if ("coco-focus" == event.data) {
            let canv = document.getElementById("GameDiv")
            let web = document.getElementById("webview-wrapper")
            web.style.width = canv.style.width
            web.style.height = canv.style.height
        }
        // 
       
    }

    update () {
       
    }

}


