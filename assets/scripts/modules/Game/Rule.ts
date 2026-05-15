import * as cc from 'cc';
import { UIMgr } from '../../base/core/UIMgr';
import { BaseView } from '../../base/frame/BaseView';
import { UIConfig } from '../../config/UIConfig';
import { ImgBase64 } from '../Lobby/ImgBase64';
const { ccclass, property } = cc._decorator;

@ccclass('Rule')
export class Rule extends BaseView {
    @property(cc.Node)
    h5Game: cc.Node = null;//webView所在节点

    @property(cc.Node)
    nodecontent:cc.Node = null

    private iframe: any = null


    start() {
        this.h5Game.getComponent(cc.WebView).url = this.m_uidata.data.machine_strategy
        this.h5Game.on('loaded', this.onWebViewLoaded, this);
        let videoElementArr = document.querySelectorAll("video")
        for (let i=0; i<videoElementArr.length; i++) {
            videoElementArr[i].style.display = "none"
        }
    }

    onWebViewLoaded() {
        window.addEventListener("message", this.receiveMessage, false);

        var element = document.getElementById('close-img');
        if (element) {
            element.parentNode.removeChild(element);
        }
        var img=document.createElement("img");
        img.id = "close-img"
        img.src=ImgBase64.exit;
    
        img.style.position = "absolute"
        img.style.top = "10px"
        img.style.right = "10px"
        img.style.width = "30px"
        img.style.height = "30px"
        img.style.zIndex = "1001";
        
        var main = document.getElementById('GameDiv');
        main.appendChild(img);
        main.appendChild(img);
        
        img.onclick = (function (param) {
            main.removeChild(img);//移除按钮
            parent.postMessage("cocos", "*")
        })

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
        if ("cocos" == event.data) {
            let videoElementArr = document.querySelectorAll("video")
            for (let i=0; i<videoElementArr.length; i++) {
                videoElementArr[i].style.display = "block"
            }
            UIMgr.getInstance().closeView(UIConfig.Rule.path)
        }
        // 
       
    }

    update () {
       
    }
}


