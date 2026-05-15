import * as cc from 'cc';
import { Message } from '../../base/core/MessageMgr';
const { ccclass, property } = cc._decorator;

@ccclass('SelectMachineItem')
export class SelectMachineItem extends cc.Component {

    id:number = 0

    start() {

    }

    setMachineId (id:number) {
        this.id = id
    }

    protected onEnable(): void {
        Message.on("MachineKeepTime",this.machineKeepTimeCall,this)
    }

    protected onDisable(): void {
        Message.off("MachineKeepTime",this.machineKeepTimeCall,this)
    }

    machineKeepTimeCall (event:string,args:any) {
        
    }
}


