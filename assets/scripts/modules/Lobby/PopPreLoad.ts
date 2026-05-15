import { _decorator, Node, Sprite, Label } from "cc";
import { BaseView } from "../../base/frame/BaseView";
import { ABMgr } from "../common/AssetBundelMgr";
import { LOGO_TYPE, NOW_SERVER_EREA, SERVER_EREA, SHOW_LOGO } from "../../config/ServerConfig";
const {ccclass, property} = _decorator;

@ccclass('PopPreLoad')
export class PopPreLoad extends BaseView {
    /** 进度条 */
    @property(Node)
    private bar : Node = null;
    /** 文本显示 */
    @property(Node)
    private lab_pro : Node = null;
    /** 图标 */
    @property(Node)
    private logo_yjb : Node = null;
    @property(Node)
    private logo_qql : Node = null;
    /** logo */
    @property(Node)
    logo_bl:Node = null
    /** logo */
    @property(Node)
    logo_vip:Node = null
    /** logo */
    @property(Node)
    bg_vip:Node = null
    /** logo */
    @property(Node)
    bg_normal:Node = null
    
    /** 资源名称 */
    private res : any = null;
    /** 回调函数 */
    private func : Function = null;

    start() {
        //logo 显示
        this.logo_yjb.active = SHOW_LOGO == LOGO_TYPE.YJB
        this.logo_qql.active = SHOW_LOGO == LOGO_TYPE.QQL
        this.logo_bl.active = SHOW_LOGO == LOGO_TYPE.BL
        this.logo_vip.active = SHOW_LOGO == LOGO_TYPE.VIP

        this.bg_normal.active = SHOW_LOGO != LOGO_TYPE.VIP
        this.bg_vip.active = SHOW_LOGO == LOGO_TYPE.VIP
        this.res = this.m_uidata.res
        this.func = this.m_uidata.func
        this.bar.getComponent(Sprite).fillRange = 0
        this.lab_pro.getComponent(Label).string = ""
        this.loadRes()
    }
    
    loadRes(){
        ABMgr.loadAssetBundleDir(this.res , ()=>{
            this.func()
            this.close()
        }, this.bar, this.lab_pro)
    }
}