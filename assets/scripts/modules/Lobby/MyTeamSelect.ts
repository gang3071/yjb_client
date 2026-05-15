import * as cc from 'cc';
import { Message } from '../../base/core/MessageMgr';
import { BaseView } from '../../base/frame/BaseView';
const { ccclass, property } = cc._decorator;

@ccclass('MyTeamSelect')
export class MyTeamSelect extends BaseView {

    start() {

    }

    btnIDCall () {
        Message.dispatchEvent("SetSeach",1)
        this.close()
    }

    btnNameCall () {
        Message.dispatchEvent("SetSeach",2)
        this.close()
    }

}


