import * as cc from 'cc';
import { BaseView } from '../../frame/BaseView';
import { NOW_SERVER_EREA, SERVER_EREA } from '../../../config/ServerConfig';
const { ccclass, property } = cc._decorator;

@ccclass('Loading')
export class Loading extends BaseView {
    @property(cc.Node)
    eff_normal: cc.Node = null;
    @property(cc.Node)
    eff_qql: cc.Node = null;

    start() {
        //eff根据版本不同显示 显示
        let jug = NOW_SERVER_EREA == SERVER_EREA.TW_QQL || NOW_SERVER_EREA == SERVER_EREA.TW_BL || NOW_SERVER_EREA == SERVER_EREA.CN_VIP
        this.eff_normal.active = !jug
        this.eff_qql.active = jug
    }

    update(deltaTime: number) {
        // 防止被遮挡
        this.node.setSiblingIndex(this.node.parent.children.length)
    }
}


