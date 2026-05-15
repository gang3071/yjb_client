import { _decorator, Node, EventTouch, Label } from "cc";
import { BaseView } from "../../base/frame/BaseView";
import { Tools } from "../../base/utils/util/Tools";
const {ccclass, property} = _decorator;

@ccclass('PopVideoTips')
export class PopVideoTips extends BaseView {
    /** 预制件 */
    @property(Label)
    tips:Label;
    @property([Node])
    btns:Node[] = [];

    private data = null;

    start() {
        this.data = this.m_uidata;
        this.init()
    }

    init(){
        Tools.SetChildText(this.btns[0], "Label", Tools.GetLocalized("切换线路"))
        Tools.SetChildText(this.btns[1], "Label", Tools.GetLocalized("刷  新"))
        this.btns[0].on(Node.EventType.TOUCH_END, ()=>{
            this.data.fun1()
            this.close()
        })
        this.btns[1].on(Node.EventType.TOUCH_END, ()=>{
            this.data.fun2()
            this.close()
        })
        this.tips.string = Tools.GetLocalized("视讯加载超时")
    }
}