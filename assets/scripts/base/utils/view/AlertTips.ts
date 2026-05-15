import * as cc from 'cc';
import { BaseView } from '../../frame/BaseView';
const { ccclass, property } = cc._decorator;

@ccclass("AlertTips")
export class AlertTips extends BaseView{
    @property(cc.Label)
    private m_label : cc.Label | null = null;

    setText( text : string ){
        if(this.m_label)
            this.m_label.string = text;
    }

    public onUpdateData( params : any){
        this.setText(params.tips);
    }

    
    protected checkAddBlockNode(){} //置空添加屏蔽

    onLoad(){
        super.onLoad();
        cc.tween(this.node)
            // .delay(0.4)
            .to(0.6,{position : cc.v3(0,0,0)})
            .delay(1)
            .removeSelf()
            .start();
    }
}