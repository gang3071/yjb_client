import * as cc from 'cc';
import { Label } from 'cc';
import { UserInfo } from '../common/UserInfo';
const { ccclass, property } = cc._decorator;

@ccclass('AreaCode')
export class AreaCode extends cc.Component {
    start() {
        
    }

    onEnable(): void {
        this.node.getComponent(Label).string = UserInfo.AreaNum
    }
}


