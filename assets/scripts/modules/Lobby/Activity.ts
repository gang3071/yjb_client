import * as cc from 'cc';
import { UIMgr } from '../../base/core/UIMgr';
import { BaseView } from '../../base/frame/BaseView';
import { UrlImageView } from '../../base/gui/urlImageView';
import { LoadingViewWrap } from '../../base/utils/view/LoadingViewWrap';
import List from '../../common/scroll/List';
import { UIConfig } from '../../config/UIConfig';
import { httpRequest } from '../../NetMgr/HttpRequest';
const { ccclass, property } = cc._decorator;

@ccclass('Activity')
export class Activity extends BaseView {

    @property(List)
    activityList:List = null

    gameData:any = null

    start() {
        this.activityList.numItems = this.m_uidata.length
    }

    ListRender (item: cc.Node, idx: number) {
        item.getChildByName("img").getComponent(UrlImageView).setUrl(this.m_uidata[Math.abs(idx)].picture)
    }


    itemClick (item: cc.Node, selectedId: number, lastSelectedId: number, val: number) {
        this.requestListDetail(Math.abs(this.m_uidata[Math.abs(selectedId)].id))
    }

    requestListData () {
        
    }

    requestListDetail (select:number) {
        httpRequest.post("api/v1/activity-info",{
            activity_id:select
        },(succ:any) => {
            LoadingViewWrap.show()
            UIMgr.getInstance().openSingleView(UIConfig.ActivityDetail.path,succ)
        },(fail:any) => {
            
        })
    }
    

    btnCloseCall() {
        this.close()
    }

    update(deltaTime: number) {
        
    }
}


