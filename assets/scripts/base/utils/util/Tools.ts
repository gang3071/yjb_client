import { _decorator, SpriteFrame, Node, Sprite, instantiate, Label, Prefab, Color, Size, UITransform } from 'cc';
import { httpRequest } from '../../../NetMgr/HttpRequest';
import { ResLoader } from '../../core/ResLoader';
import { Component } from 'cc';
import { LocalizadManager } from '../../localized/LocalizedManager';
import { LabelConfig } from '../../../config/LabelConfig';
import { ImageAsset } from 'cc';
import { Texture2D } from 'cc';
import { AlterTipsWrap } from '../view/AlterTipsWrap';
import { UIMgr } from '../../core/UIMgr';
const { ccclass } = _decorator;

type ConstructorOf<T> = new (...args: any[]) => T;
import QRCode from 'qrcode-generator';
import { assetManager } from 'cc';
import { RichText } from 'cc';
import { UserInfo } from '../../../modules/common/UserInfo';
import { LoadingViewWrap } from '../view/LoadingViewWrap';
import { UIConfig } from '../../../config/UIConfig';


// 定义阈值和对应的num值
const sizeThresholds = [
    { size: 20000000, num: 100 },
    { size: 19000000, num: 95 },
    { size: 18000000, num: 90 },
    { size: 17000000, num: 85 },
    { size: 16000000, num: 80 },
    { size: 15000000, num: 75 },
    { size: 14000000, num: 70 },
    { size: 13000000, num: 65 },
    { size: 12000000, num: 60 },
    { size: 11000000, num: 55 },
    { size: 10000000, num: 50 },
    { size: 9000000, num: 45 },
    { size: 8000000, num: 40 },
    { size: 7000000, num: 35 },
    { size: 6000000, num: 30 },
    { size: 5000000, num: 25 },
    { size: 4000000, num: 20 },
    { size: 3000000, num: 15 },
    { size: 2000000, num: 10 },
    { size: 1000000, num: 5 },
    { size: 500000, num: 2.5 },
    { size: 250000, num: 1.5 }
];

/** 用户代理等级和图片对照表 */
const AGENT_LV_TO_PIC = {
    ["等级青铜"] : "a",
    ["等级白银"] : "b",
    ["等级黄金"] : "c",
    ["等级VIP"] : "d",
    ["等级超级VIP"] : "e"
}

/** 通用工具类 */
@ccclass('Tools') 
export class Tools
{
    //#region Sprite相关操作
    /** 设置节点的SpriteFrame， 默认从resource/ui下面找 */
    static SetSpriteFrame(node:Node, uiname:string, uipath:string, fuc:Function = null) {
        let m_resLoader = new ResLoader();
        m_resLoader.loadSpriteFrame(uipath + "/" + uiname, (err:Error, prefab:SpriteFrame) => {
            if (err) {
                console.error("------图片获取失败------", err)
            }else {
                if (node){
                    let c = node.getComponent(Sprite)
                    if (c) c.spriteFrame = prefab
                    if (fuc) fuc()
                }
            }
            m_resLoader = null;
        })
    }

    /** 设置子节点uisprite */
    static SetChildSprite(node:Node, path:string, uiname:string, uipath:string, fuc:Function = null) {
        let n = node.getChildByPath(path)
        if (n) this.SetSpriteFrame(n, uiname, uipath, fuc)
    }

    /** 
     * 设置艺术字
     * itemPath:字体预制件位置, numPath:字体图片位置, pre:图片名前缀
    */
    static SetArtNums(str:any, item:Node, itemPath:string = "ui/numbers/num_Item", numPath:string = "ui/numbers", pre:string = "numbers_0") {
        str = String(str)
        item.destroyAllChildren()
        let m_resLoader = new ResLoader();
        m_resLoader.loadPrefabNode(itemPath, (prefab:Node) => { 
            console.log(itemPath, prefab)
            // 根据字符串长度，显示对应数量的数字图片
            for (let i = 0; i < str.length; i++) {
                let n = Tools.AddChild(item, prefab, "num_" + i)
                n.active = true
                this.SetSpriteFrame(n, pre + (str[i] == "." ? "dot" : str[i]), numPath)
            }
        })
    }
    //#endregion
    

    //#region http相关
    /** 发送http请求 */
    static httpReq(str:string, param:any, callback:Function, failCallBack:Function = null) {
        httpRequest.post("api/v1/" + str, param, callback, failCallBack)
    }
    //#endregion


    //#region Node 相关
    /** 添加子节点 */
    static AddChild(node:Node, prefab:Node|Prefab, name:string = null):Node {
       var n = instantiate(prefab as Node)
       node.addChild(n)
       if (name) n.name = name
       return n
    }

    /** 设置子节点显示 */
    static ActChild(node:Node, path:string, act:boolean)
    {
        let n = node.getChildByPath(path)
        if (n) n.active = act
    }

    /** 获取子节点组件 */
    static GetChildComp<T extends Component>(node: Node, path: string, compClass: ConstructorOf<T>): T {
        return node.getChildByPath(path)?.getComponent(compClass);
    }
    
    //#endregion


    //#region Text 相关
    /** 设置子节点文字 */
    static SetText(node:Node, str:string) {
        str = String(str)
        node.getComponent(Label).string = str
    }
    /** 设置子节点文字 */
    static SetChildText(node:Node, path:string, str:string) {
        str = String(str)
        let n = node.getChildByPath(path)
        n.getComponent(Label).string = str
    }
    /** 设置子节点文字 */
    static SetChildRichText(node:Node, path:string, str:string) {
        str = String(str)
        let n = node.getChildByPath(path)
        n.getComponent(RichText).string = str
    }
    /** 设置节点文字颜色 */
    static SetLabColor(node:Node, str:string) {
        node.getComponent(Label).color = Color.fromHEX(new Color(), str)
    }
    /** 设置子节点字体颜色 */
    static SetChildLabColor(node:Node, path:string, str:string) {
        let n = node.getChildByPath(path)
        n.getComponent(Label).color = Color.fromHEX(new Color(), str)
    }

    /** 设置节点大小 */
    static SetSize(node:Node, size:Size) {
        node.getComponent(UITransform).setContentSize(size);
    }

    /** 设置节点触摸事件 */
    static SetTouchEndEvt(node:Node, func:Function) {
        node.off(Node.EventType.TOUCH_END)
        node.on(Node.EventType.TOUCH_END, func)
    }

    /** 设置子节点触摸事件 */
    static SetChildTouchEndEvt(node:Node, path:string, func:Function) {
        let n = node.getChildByPath(path)
        if (n) this.SetTouchEndEvt(n, func)
    }
    //#endregion


    //#region 字符串操作
    /** 
     ** 替换占位符{0},{1}.... 
     ** 例子: const message = Tools.stringFormat("My name is {0} and I am {1} years old.", name, age);
    */
    static StringFormat(format: string, ...args: any[]): string {
        return format.replace(/{(\d+)}/g, (match, index) => {
          return typeof args[index] !== "undefined" ? args[index] : match;
        });
    }

    static StringLFormat(format: string, ...args: any[]): string {
        format = this.GetLocalized(format)
        return this.StringFormat(format, ...args)
    }
    //#endregion


    //#region 其他
    /** 本地化 */
    static GetLocalized(str : string) {
        return LabelConfig[str] ? LabelConfig[str][LocalizadManager.getInstance().getLanauge()-1] : str
    }
    /** 压缩上传图片成base64 */
    static CompressImageToBase64(param:any, callback:Function = null){
        var fileList = param.files[0];
        var reader = new FileReader();
        reader.readAsDataURL(fileList);
        reader.onload = (event) => {
            let image = new Image() //新建一个img标签（还没嵌入DOM节点)
            var dataImg  = event.target.result;
            var num = 1;
            //@ts-ignore
            image.src = event.target.result
            image.onload = () => {
                //由于不能将太多Base64字符给服务端发过于，咱们压缩一下
                //如果想支持更大图片，请继续加判断，增加除数
                // 检查文件大小是否超过20M
                if (fileList.size > 20000000) {
                    console.log("文件大小不能大于20M！");
                    param.value = '';
                    return;
                }
                // 根据文件大小设置num值
                for (const threshold of sizeThresholds) {
                    if (fileList.size > threshold.size) {
                        num = threshold.num;
                        break;
                    }
                }
                let canvas = document.createElement('canvas');
                let context = canvas.getContext('2d');
                let imageWidth = image.width / num;  //压缩后图片的大小
                let imageHeight = image.height / num;
                const minSize = 640; // 设置最小尺寸
                if (imageWidth < minSize || imageHeight < minSize) {
                    const scaleFactor = Math.max(minSize / imageWidth, minSize / imageHeight);
                    imageWidth *= scaleFactor;
                    imageHeight *= scaleFactor;
                }
                canvas.width = imageWidth;
                canvas.height = imageHeight;
                context.drawImage(image, 0, 0, imageWidth, imageHeight);
                dataImg = canvas.toDataURL('image/png');
                //此时的dataImg就是你要上传给服务器的字符
                param.value = '';
                if (callback) callback(dataImg)
                return dataImg;
            }
        };
    }

    

    /** 生成二维码 */
    static SetQRCode(text: string, item : Node){
        const qr = QRCode(0, 'M');
        qr.addData(text);
        qr.make();
        const dataUrl = qr.createDataURL(4, 4);
        const img = new Image();
        img.src = dataUrl;

        assetManager.loadRemote(dataUrl, {ext : '.png'}, (err, imgAsset: ImageAsset) => {
            if (err) {
                console.error(err.message || err);
                return;
            }
            const sp = new SpriteFrame()
            const tx = new Texture2D()
            tx.image = imgAsset
            sp.texture = tx
            item.getComponent(Sprite).spriteFrame = sp
        })
    }

    /** 通过base64字符串设置图片 */
    static SetBase64Pic(src: string, node: Node): void {
        let image = new Image()
        image.src = src // base 64是string，看后端返回是二进制，是否带头data:image/png;base64, 不带要手动添加
        image.onload = () => {
            let texture = new Texture2D()
            texture.image = new ImageAsset(image)
            let _frame = new SpriteFrame()
            _frame.texture = texture
            // 获取节点的容器
            let c = node.getComponent(Sprite)
            if (c) c.spriteFrame = _frame
        }    
    }

    /** 复制到剪切板 */
    static CopyToClipboard(str:string) {
        var input = str + '';
        const el = document.createElement('textarea');
        el.value = input;
        el.setAttribute('readonly', '');
        el.style.contain = 'strict';
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        el.style.fontSize = '12pt'; // Prevent zooming on iOS
        
        const selection = getSelection();
        var originalRange = null;
        if (selection.rangeCount > 0) {
            originalRange = selection.getRangeAt(0);
        }
        document.body.appendChild(el);
        el.select();
        el.selectionStart = 0;
        el.selectionEnd = input.length;
        
        var success = false;
        try {
            success = document.execCommand('copy');
        } catch (err) {}
        
        document.body.removeChild(el);
        
        if (originalRange) {
            selection.removeAllRanges();
            selection.addRange(originalRange);
        }
        AlterTipsWrap.show("复制成功")
        return success;
    }

    /** 获取代理等级本地化 */
    static GetAgentLvLocalized(agentLv:string, lv :number) {
        return this.StringFormat(this.GetLocalized(agentLv), lv)
    }

    /** 设置代理等级图标 */
    static SetAgentLvIcon(item:Node, agentLv:string, lv :number) {
        if (!AGENT_LV_TO_PIC[agentLv]) return
        var icon = "icon" + AGENT_LV_TO_PIC[agentLv] + this.Return2LengthNumber(lv)
        this.SetSpriteFrame(item, icon, "Lobby/ui/allagent/icon")
    }

    /** 设置子节点代理等级图标 */
    static SetChildAgentLvIcon(item:Node, path :string, agentLv:string, lv :number) {
        let n = item.getChildByPath(path)
        this.SetAgentLvIcon(n, agentLv, lv)
    }

    /** 返回两位数 */
    static Return2LengthNumber(n : number) {
        return n < 10 ? "0" + n : n.toString()
    }

    /** 打开弹窗 */
    static OpenPopView(str:string)
    {
        UIMgr.getInstance().openSingleView(str)
    }
    //#endregion


    //#region 数学算法
    static MathClampZeroToOne(value: number): number {
        return Math.max(0, Math.min(1, value));
    }

    static MathClamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }
    //#endregion


    /** 把腾讯和老的视频流整合在一起 */
    static CombineMachineData (d) {
        let res = []
        // UserInfo.defaultConfig.line_login_status 1: 老线路 2: 腾讯线路 3: 腾讯老线路都要

        // 老线路
        if (UserInfo.defaultConfig.machine_media_line == 1 || UserInfo.defaultConfig.machine_media_line == 3){
            for (let i = 0; i < d.machine_media.length; i++) {
                d.machine_media[i].mType = 2
                res.push(d.machine_media[i])
            }
        }

        // 腾讯线路
        if (UserInfo.defaultConfig.machine_media_line == 2 || UserInfo.defaultConfig.machine_media_line == 3){
            for (let i = 0; i < d.machine_media.length; i++) {
                let c = JSON.parse(JSON.stringify(d.machine_media[i]));
                c.mType = 1
                res.push(c)
            }
        }

        return res
    }

    static JumpToGame(msg, cb = null){
        if (1 == msg.type) {
            UserInfo.clickSLorGZ = 1
            LoadingViewWrap.show()
            UIMgr.getInstance().openSingleView(UIConfig.SLGame.path,{machine_id:msg.id,data:msg,machineInfo:msg},null,null,() => {
                if (cb) cb()
            })
        }else {
            UserInfo.clickSLorGZ = 2
            LoadingViewWrap.show()
            UIMgr.getInstance().openSingleView(UIConfig.GZGame.path,{machine_id:msg.id,data:msg,machineInfo:msg},null,null,() => {
                if (cb) cb()
            })
        }
    }

    static OpenWeb(url){
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
