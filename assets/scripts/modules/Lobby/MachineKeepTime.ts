import * as cc from 'cc';
import { utils } from '../../base/utils/utils';
import { Message } from '../../base/core/MessageMgr';
import { isValid } from 'cc';
const { ccclass, property } = cc._decorator;

@ccclass('MachineKeepTime')
export class MachineKeepTime extends cc.Component {

    time:number = 0
    detTime:number = 0

    show  = false

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
        if (args.machine_id == this.id) {
            if (1 == args.keeping) {
                this.node.getComponent(cc.Label).string = utils.secondsToHMS(Number(args.keep_seconds))
                if (0 == Number(args.keep_seconds)) {
                    this.node.parent.parent.parent.active = false
                }
            }else if (0 == args.keeping) {
                this.node.getComponent(cc.Label).string = "00:00:00"
                this.node.parent.parent.parent.active = false
            }
        }
        
    }

    setLeftTime (time:number) {
        // this.show = true
        // this.time = time
        this.node.getComponent(cc.Label).string = "00:00:00"
        this.node.getComponent(cc.Label).string = utils.secondsToHMS(Number(time))
    }

    // update(deltaTime: number) {
    //     if (!this.show) {return}
    //     if (this.time <= 0) {
    //         this.show = false
    //         if (isValid(this.node.parent) && this.node.parent.parent) {
    //             this.node.parent.active = false
    //             this.node.parent.parent.active = false
    //         }
    //         return
    //     }
        
    //     this.detTime += deltaTime
    //     if (1 < this.detTime) {
    //         this.detTime = 0
    //         this.time -= 1
    //         this.node.getComponent(cc.Label).string = utils.secondsToHMS(this.time)
    //     }
    // }
}


