import * as cc from 'cc';
import { Message } from '../../base/core/MessageMgr';
import { BaseView } from '../../base/frame/BaseView';
const { ccclass, property } = cc._decorator;

@ccclass('LeaveMachine')
export class LeaveMachine extends BaseView {

    start() {

    }

    btnCancelCall () {
        this.close()
    }

    btnSureCall () {
        Message.dispatchEvent("LeaveMachineSure")
        this.close()
    }

    btnGiveupMachineCall () {
        Message.dispatchEvent("GiveupMachine")
        this.close()
    }

}


