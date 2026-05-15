import * as cc from "cc"

import { ENV, getCurEnv } from "../../config/Env";

const { ccclass, property } = cc._decorator;


@ccclass('Analytics')
export class Analytics  extends  cc.Component {
    private static s_instance : Analytics | null = null;
    
    public static getInstance() : Analytics{
        if(this.s_instance == null){
            this.s_instance = new Analytics();
        }
        return this.s_instance;
    }

    onLoad(){
        let obj : any = this;
        if(Analytics.s_instance == null){
            Analytics.s_instance = this;
        }
        else{
            console.error("Analytics is repeat load!");
        }
    }

    start(){
        // 初始化 , 注意 在调用其他任何方法之前 必须先初始化一次。
        let cur_env = getCurEnv();
        // platform.getInstance().getASInterface().enableDebug(cur_env != ENV.RELEASE);
    }

    registerModule(){

    }
}