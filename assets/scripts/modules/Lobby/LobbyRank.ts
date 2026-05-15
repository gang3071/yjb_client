import * as cc from 'cc';
import { BaseView } from '../../base/frame/BaseView';
const { ccclass, property } = cc._decorator;

@ccclass('LobbyRank')
export class LobbyRank extends BaseView {
    start() {

    }

    btncloseCall () {
        this.close()
    }
}


