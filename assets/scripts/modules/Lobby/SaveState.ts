import * as cc from 'cc';
import { UIMgr } from '../../base/core/UIMgr';
import { BaseView } from '../../base/frame/BaseView';
import { UIConfig } from '../../config/UIConfig';
const { ccclass, property } = cc._decorator;

@ccclass('SaveState')
export class SaveState extends BaseView {

    @property(cc.Label)
    labState:cc.Label = null

    start() {
        this.labState.string = this.m_uidata.str
    }

    public onUpdateData( params : any){
        console.log("==onUpdateData===没有走码====",params)
        this.labState.string = this.m_uidata.str
    }

    setStateDesc (str:string) {
        this.labState.string = str
    }

    btnSureCall () {
        this.close()
        UIMgr.getInstance().closeView(UIConfig.SaveMoney.path)
    }

    update(deltaTime: number) {
        
    }
}


