import * as cc from 'cc';
import { BaseView } from '../../base/frame/BaseView';
import { httpRequest } from '../../NetMgr/HttpRequest';
const { ccclass, property } = cc._decorator;

@ccclass('GameLvLi')
export class GameLvLi extends BaseView {

    @property(cc.Label)
    labZongShangFen:cc.Label = null

    @property(cc.Label)
    labZongYaZhu:cc.Label = null

    @property(cc.Label)
    labZongDeFen:cc.Label = null

    @property(cc.Label)
    labCurrFen:cc.Label = null

    @property(cc.Node)
    nodeZhuanShu:cc.Node = null

    @property(cc.Node)
    nodeYaZhu:cc.Node = null

    @property(cc.Node)
    nodeDefen:cc.Node = null

    @property(cc.Node)
    nodeZongZhuanShu:cc.Node = null

    @property(cc.Label)
    labZongXiaFen:cc.Label = null


    start() {
        // this.init()

        this.nodeZhuanShu.active = 2 == this.m_uidata.isGzOrSl
        this.nodeYaZhu.active = 1 == this.m_uidata.isGzOrSl

        this.nodeDefen.active = 2 == this.m_uidata.isGzOrSl
        this.nodeZongZhuanShu.active = 1 == this.m_uidata.isGzOrSl
       

        this.reqData()
    }

    reqData () {
        let url = ""
        let action = ""
        if (1 == this.m_uidata.isGzOrSl) {
            url = "api/v1/slot-action"
            action = "pressure_score"
        }else if (2 == this.m_uidata.isGzOrSl) {
            url = "api/v1/jackpot-action"
            action = "combine_status"
        }

        httpRequest.post(url,{
            machine_id:this.m_uidata.machine_id,
            action:action
        },(succ:any) => {
            this.m_uidata.data = succ
            this.init()
        },(fail:any) => {
            
        })
    }

    init () {
        // console.log("==init==",this.m_uidata)
        if (0 != this.m_uidata.data.length) {
            this.labZongShangFen.string = this.m_uidata.data.open_point
            
            if (1 == this.m_uidata.isGzOrSl) {
                this.labZongYaZhu.string = this.m_uidata.data.gaming_pressure
            }else if (2 == this.m_uidata.isGzOrSl) {
                this.labZongYaZhu.string = this.m_uidata.data.gaming_turn_point
            }


            if (1 == this.m_uidata.isGzOrSl) {
                this.labZongDeFen.string = this.m_uidata.data.gaming_score
            }else if (2 == this.m_uidata.isGzOrSl) {
                this.labZongDeFen.string = this.m_uidata.data.score_point
            }
            

            if (1 == this.m_uidata.isGzOrSl) {
                this.labCurrFen.string = this.m_uidata.data.seven_display
            }else if (2 == this.m_uidata.isGzOrSl) {
                this.labCurrFen.string = this.m_uidata.data.machine_point
            }

            this.labZongXiaFen.string = this.m_uidata.data.total_wash_point

        }
    }

    btnCloseCall () {
        this.close()
    }

    update(deltaTime: number) {
        
    }
}


