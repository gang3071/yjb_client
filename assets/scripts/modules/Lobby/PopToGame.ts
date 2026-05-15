import { _decorator, Node, Sprite, Label } from "cc";
import { BaseView } from "../../base/frame/BaseView";
const {ccclass, property} = _decorator;

@ccclass('PopToGame')
export class PopToGame extends BaseView {
    @property(Node)
    pic_yes : Node = null;
    @property(Node)
    pic_no : Node = null;

    start() {}

    btnSure(){
        this.m_uidata.callback()
        this.close()
    }

    btnCancel(){
        this.pic_yes.active = false
        this.pic_no.active = true
        this.scheduleOnce(()=>{ this.close() }, 0.3)
    }
}