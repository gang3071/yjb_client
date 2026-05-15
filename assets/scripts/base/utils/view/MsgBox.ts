import * as cc from "cc"
import { BaseView } from "../../frame/BaseView";
import { utils } from "../utils";
import { Tools } from "../util/Tools";
import { Label } from "cc";

const { ccclass, property } = cc._decorator;

export type MSG_CONFIRM_CALLBACK = ()=>void;
export type MSG_CANCEL_CALLBACK = ()=>void;

@ccclass("MsgBox")
export class MsgBox extends BaseView{
    @property(cc.Node)
    private m_cancelBtn : cc.Node | null = null;
    @property(cc.Node)
    private m_confirm1 : cc.Node | null = null;
    @property(cc.Node)
    private m_confirm2 : cc.Node | null = null;
    @property(cc.Label)
    private m_content : cc.Label | null = null;

    private m_autoclose : boolean = true;
    private m_confrimCallback : MSG_CONFIRM_CALLBACK | null = null;
    private m_cancelCallback : MSG_CANCEL_CALLBACK | null = null;
    private m_btnSureName : string ;

    public onUpdateData( params : any){
        cc.assert(typeof(params.content) == "string", "please set param content")
        cc.assert(typeof(params.confirm) == "function", "please set param confirm")
        
        this.m_confrimCallback = params.confirm;
        this.m_cancelCallback = params.cancel;
        this.m_autoclose = params.autoclose
        this.m_btnSureName = params.btnSureName ? params.btnSureName : Tools.GetLocalized("确    定");

        this.setData(params.content, this.m_cancelCallback == null);
    }

    onLoad(){
        super.onLoad();
        // utils.addClickCallback(this.m_cancelBtn, ()=>{
        //     if(this.m_cancelCallback)
        //         this.m_cancelCallback();
        //     if(this.m_autoclose) this.close();
        // })

        // utils.addClickCallback(this.m_confirm1, ()=>{
        //     if(this.m_confrimCallback) this.m_confrimCallback();
        //     if(this.m_autoclose) this.close();
        // })

        this.m_cancelBtn.on(cc.Node.EventType.TOUCH_END,() => {
            if(this.m_cancelCallback)
                this.m_cancelCallback();
            if(this.m_autoclose) this.close();
        })

        this.m_confirm1.on(cc.Node.EventType.TOUCH_END,() => {
            if(this.m_confrimCallback) this.m_confrimCallback();
            if(this.m_autoclose) this.close();
        })

        this.m_confirm2.on(cc.Node.EventType.TOUCH_END,() => {
            if(this.m_confrimCallback) this.m_confrimCallback();
            if(this.m_autoclose) this.close();
        })

        // utils.addClickCallback(this.m_confirm2, ()=>{
        //     if(this.m_confrimCallback)
        //         this.m_confrimCallback();
        //    if(this.m_autoclose) this.close();
        // })
    }

    setData( content : string, onlyConfirm : boolean ){
        if(this.m_cancelBtn)
            this.m_cancelBtn.active = !onlyConfirm;

        if(this.m_confirm1)
            this.m_confirm1.active = !onlyConfirm;

        Tools.GetChildComp(this.m_confirm1, "name", Label).string = this.m_btnSureName

        if(this.m_confirm2)
            this.m_confirm2.active = onlyConfirm;

        Tools.GetChildComp(this.m_confirm2, "name", Label).string = this.m_btnSureName

        if(this.m_content)
            this.m_content.string = content;

    }

    btnCloseCall () {
        this.close()
    }
}