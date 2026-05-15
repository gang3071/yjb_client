import * as cc from 'cc';
import { BaseView } from '../../base/frame/BaseView';
const { ccclass, property } = cc._decorator;

@ccclass('PayPwd')
export class PayPwd extends BaseView {

    @property([cc.Sprite])
    labPwdArr:cc.Sprite[] = []

    private labPwd:string = ""

    private pwdNumLen:number = 6

    private inputPwdNums:number = 0

    start() {

    }

    setSixNum (target:cc.Button,customs:string) {
        if (6 == this.inputPwdNums) {return}
        this.labPwd += customs
        
        this.inputPwdNums += 1
        this.labPwdArr[this.inputPwdNums -1].node.active = true
    }

    btnDeleteCall () {
        if (0 == this.inputPwdNums) {return}
        this.labPwd = this.labPwd.slice(0,this.labPwd.length-1)
        
        this.inputPwdNums -= 1
        this.labPwdArr[this.inputPwdNums].node.active = false
    }

    btnCloseCall () {
        this.close()
    }

    btnSureCall () {
        console.log("=btnSureCall====",this.labPwd)
        if (this.m_uidata.callback) {
            this.m_uidata.callback(this.labPwd)
        }
    }
}


