import * as cc from 'cc';
import { BaseView } from '../../base/frame/BaseView';
import { WebView } from 'cc';
import { ImgBase64 } from './ImgBase64';
import { Message } from '../../base/core/MessageMgr';
import { UIMgr } from '../../base/core/UIMgr';
import { UIConfig } from '../../config/UIConfig';
import { utils } from '../../base/utils/utils';
import { Tools } from '../../base/utils/util/Tools';
const { ccclass, property } = cc._decorator;

globalThis.TestCode = function () {
    console.log("window.TestCode");
}

@ccclass('GameView')
export class GameView extends BaseView {

    @property(WebView)
    webview : WebView = null;

    // @property(WebView)
    // webBack: WebView = null

    public setUIData(data: any): void {
        if (data.url != "") {
            this.webview.url = data.url


        }
    }

    /**
     * width: 100%;
                        height: 100vh;
     */

    start() {
        
        
        this.webview.node.on('loaded', this.onWebViewLoaded, this);
        // this.webBack.node.on('loaded', this.onWebBackLoaded, this);

        let exitData= (`
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
                <style>
                    *{
                        margin: 0;
                        padding: 0;
                    }
                    .contant3{
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    img{

                    }
                </style>
            </head>

            <body>
                <div class="contant3">
                    <img src="${ImgBase64.exit}" style="overflow: hidden;" onclick="onClick()">
                </div>
            </body>
            <script>
                function onClick () {
                    // 如果 TestCode 是定义在 window 上，则
                    console.log("TestCode");
                    parent.postMessage("cocos-close", "*")
                    
                }
            </script>

            </html>`
        )

        // this.webBack.url = `data:text/html;charset=utf-8,${encodeURIComponent(exitData)}`;

        let scheme3 = "testkey3";

        let jsCallback3 =  (target, url) => {
            // 这里的返回值是内部页面的 URL 数值，需要自行解析自己需要的数据。
            // let str = url.replace(scheme1 + '://', ''); // str === 'a=1&b=2'
            // webview target
            console.log("------还好-----");
            Message.dispatchEvent("ExitMsg")
        }

        // this.webBack.setJavascriptInterfaceScheme(scheme3);
        // this.webBack.setOnJSCallback(jsCallback3);
    
    }

    onWebBackLoaded() {
        
    }

    onWebViewLoaded() {


        window.addEventListener("message", this.receiveMessage, false);

        let allIframes = document.querySelectorAll("iframe")
        allIframes[1].style = ""
        allIframes[1].style.border = "none"


        setTimeout(() => {
            var element = document.getElementById('close-img');
            if (element) {
                element.parentNode.removeChild(element);
            }
            var img=document.createElement("img");
            img.id = "close-img"
            img.src=ImgBase64.exit;

            img.style.position = "absolute"
            img.style.top = "10px"
            img.style.left = "10px"
            img.style.width = "30px"
            img.style.height = "30px"

            document.getElementById('GameDiv').appendChild(img);

            // 将按钮添加到文档中
            // document.body.appendChild(button);

            // 可选：添加点击事件
            img.addEventListener('click', () => {
                parent.postMessage("cocos-close", "*")
                var element = document.getElementById('close-img');
                if (element) {
                    element.parentNode.removeChild(element);
                }
            });
        }, 1000);

        let ww = document.getElementById("webview-wrapper")
        ww.setAttribute("webkit-playsinline","true")
        ww.setAttribute("playsinline","true")
        ww.setAttribute("allowsInlineMediaPlayback","true")

    }

    receiveMessage (event) {
        console.log("child receiveMessage", event.data);
            UIMgr.getInstance().getViewByPath(UIConfig.Lobby.path).node.active = true
            UIMgr.getInstance().getViewByPath(UIConfig.DianZiGameZhuanDian.path).node.active = true
        if ("cocos-close" == event.data) {
            Message.dispatchEvent("ExitMsg")
            UIMgr.getInstance().closeView(UIConfig.GameView.path)
            // 退出游戏,通知服务器刷新金额
            Tools.httpReq("exit-game", {}, () => {})

            setTimeout(() => {
                
                UIMgr.getInstance().closeView(UIConfig.GameViewBG.path)
                utils.setOrientation("V")
            }, 300);
            
        }
        
        // 
       
    }
}


