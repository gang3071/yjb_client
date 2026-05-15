import * as cc from 'cc';
const { ccclass } = cc._decorator;
import { BaseView } from './BaseView';

@ccclass("BaseScene")
export class BaseScene extends BaseView {
    
    onLoad(){
        super.onLoad();
    }

    public getSceneType(){
        return 0;
    }
}
