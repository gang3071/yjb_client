import * as cc from "cc"

import { BaseView } from "../frame/BaseView";
import { LoadingViewWrap } from "../utils/view/LoadingViewWrap";
import { SceneMgr } from "./SceneMgr";
import { UIConfig } from "../../config/UIConfig";
const {ccclass, property} = cc._decorator;

type OpenViewDoneCallback = ( error : Error | null, view : BaseView | null)=>void;

export enum UIEVENT{
    OPEN_VIEW = "open_view",
    CLOSE_VIEW = "close_view",
}

@ccclass("UIMgr")
export class UIMgr {
    public static s_instance : UIMgr | null = null;
    public static getInstance(){
        if(this.s_instance == null){
            this.s_instance = new UIMgr();
            this.s_instance.init()
        }
        return this.s_instance;
    }

    private m_openingViews : Map<number, any> = new Map();
    private m_path2id      : Map<string, number[]> = new Map();
    private m_openedViews   : Map<number, BaseView> = new Map();

    /** 是否正在关闭UI */
    private isClosing = false;
    /** 是否正在打开UI */
    private isOpening = false;

    /** UI待打开列表 */
    private UIOpenQueue: string[] = [];
    /** UI待关闭列表 */
    private UICloseQueue: string[] = [];

    private m_viewIdCount = 0;

    private init()
    {
        this.m_viewIdCount = 0;
    }

    public getOpenViewSize(){
        return this.m_openedViews.size;
    }

    public getOpening(path:string){
        return this.getCachePathIds(path);;
    }

    /** 自动执行下一个待关闭或待打开的界面 */
    private autoExecNextUI() {
        // 逻辑上是先关后开
        if (this.UIOpenQueue.length > 0) {
            let uiQueueInfo = this.UIOpenQueue[0];
            this.UIOpenQueue.splice(0, 1);
            this.openSingleView(uiQueueInfo);
        }else if (this.UICloseQueue.length > 0) {
            let uiQueueInfo = this.UICloseQueue[0];
            this.UICloseQueue.splice(0, 1);
            this.closeView(uiQueueInfo);
        }
    }

    public getViewById (id:number) {
        let view = this.m_openedViews.get(id);
        if(view){
            return view
        }
        return null
    }

    public getViewByPath (path:string) {
        let Ids = this.getCachePathIds(path);
        if(Ids.length <= 0){
            return null
        }else{
            return this.getViewById(Ids[0])
        }
    }

    public closeAll () {
        // for (let i=0; i<this.m_openedViews.size; i++) {
        //     // this.m_openedViews.
        // }
        // this.m_openedViews.keys()

        for (let i of this.m_openedViews.keys()) {
            this.closeView(i)
        }
    }

    //使用 number 传递 viewId 能精准关闭界面
    //使用 string 传递 viewPath 将关闭此path打开的最后一个打开的界面
    // 请根据具体情况使用
    public closeView( path : string | number){
        let viewId = 0;
        if(typeof(path) == "number"){
            viewId = path;
        }else{
            let viewIds : number[]= this.getCachePathIds(path);
            let tempid = viewIds.pop();
            if(tempid == undefined) return;
            viewId = tempid;
        }
        let view = this.m_openedViews.get(viewId);
        if(view){
            let viewPath = view.getViewPath();
            this.m_openedViews.delete(viewId);
            this.uncachePath2Id(viewPath, viewId);
            this.DoCloseView(view);
        }else{
            let viewData = this.m_openingViews.get(viewId);
            if(viewData == undefined) return;
            this.m_openingViews.delete(viewId);
            this.uncachePath2Id(viewData.path, viewId);
        }

        // this.dispatch(UIEVENT.CLOSE_VIEW, this.getOpenViewSize());
    }

    public clearView( viewId : number){
        let view = this.m_openedViews.get(viewId);
        if(view){
            let viewPath = view.getViewPath();
            this.m_openedViews.delete(viewId);
            this.uncachePath2Id(viewPath, viewId);
        }else{
            let viewData = this.m_openingViews.get(viewId);
            if(viewData == undefined) return;
            this.m_openingViews.delete(viewId);
            this.uncachePath2Id(viewData.path, viewId);
        }
    }

    public openSingleView( path : string,  params : any = null, zorder : number = 0, parent : cc.Node | null = null, donecallback : OpenViewDoneCallback | null = null) : number{
        let Ids = this.getCachePathIds(path);
        console.log("==openSingleView===",Ids,path)
        if(Ids.length <= 0){
            return this.openView(path, params, zorder, parent, donecallback)
        }else{
            let viewId = Ids[0];
            let view = this.m_openedViews.get(viewId);
            if(view){
                view.setUIData(params)
            }else{
                let viewData = this.m_openingViews.get(viewId)
                if(viewData){
                    viewData.params = params;
                }
            }
            return viewId;
        }
    }

    public openView( path : string,  params : any = null, zorder : number = 0, parent : cc.Node | null = null, donecallback : OpenViewDoneCallback | null = null) : number
    {
        let curId = this.m_viewIdCount;
        this.m_viewIdCount++;
        this.m_openingViews.set(curId, { path : path, params : params});
        this.cachePath2Id(path, curId);
        SceneMgr.getInstance().getSceneResLoader().loadPrefab(path, (err : Error | null, prefab : cc.Asset) =>{
            let viewData = this.m_openingViews.get(curId);
            //代表界面已经主动关闭了
            if(viewData == null){
                console.log("the view is closed")
                return;
            }
            this.m_openingViews.delete(curId);
            if(err == null)
            {
                var node = cc.instantiate(prefab as cc.Prefab);
                let baseNode = node.getComponent(BaseView) as BaseView;

                if(baseNode != null)
                {
                    baseNode.setUIData(viewData.params);
                    this.DoShow(path, curId, baseNode, zorder, parent);
                    if(donecallback)
                        donecallback(null, baseNode);

                }
                else
                {
                    let errorStr = "can't find BaseView component in node: "+path;
                    console.error(errorStr)
                    if(donecallback)
                        donecallback(Error(errorStr), null);
                }
            }
            else
            {
                console.error("open view failed", err);
                if(donecallback)
                    donecallback(err, null);
            }
        });

        return curId;
    }

    private cachePath2Id( path : string, id : number){
        let ids : number[] | undefined = this.m_path2id.get(path)
        if(ids == undefined){
            ids = [];
            this.m_path2id.set(path, ids);
        }
        ids.push(id);
    }

    private getCachePathIds(path : string) : number[]{
        let ret : number[] | undefined= this.m_path2id.get(path);
        if(ret == undefined){
            ret =  [];
        }
        return ret;
    }

    private uncachePath2Id( path : string, id : number){
        let ids : number[] | undefined= this.m_path2id.get(path);
        if( ids == undefined) return;

        let index = ids.indexOf(id);
        if(index != -1){
            ids.splice(index, 1);
        }
    }
    
    private DoShow(path : string, viewId : number, view : BaseView, zorder : number = 0, parent : cc.Node | null = null)
    {
        console.log("DoShow", path,zorder)
        if (path != "common/loading") {
            LoadingViewWrap.close()
        }
        
        let parentNode : cc.BaseNode | null = parent;
        if(parentNode == null){
            let curScene = cc.director.getScene();
            if(curScene)
                parentNode = curScene.getChildByName('Canvas');
        }

        if ((parentNode && cc.isValid(parentNode, true))){           
            if(parentNode){
                
                this.m_openedViews.set(viewId, view);
                view.setViewInfo(viewId, path);
                view.setLocalZOrder(zorder);
                parentNode.addChild(view.node);
                view.showAnim(()=>{
                    
                })
                // this.dispatch(UIEVENT.OPEN_VIEW, this.getOpenViewSize());
            }
            else{
                console.error("UIMgr:Open()  scene data not found root!!!!!!!")
            }
        }
    }

    private DoCloseView( view : BaseView){
        console.log("DoCloseView")
        view.closeAnim(()=>{
            console.log("DoCloseView closeAnim")
            let viewPath = view.getViewPath();
            // if (viewPath == UIConfig.GameView.path) {
            //     view.node.destroy();
            //     SceneMgr.getInstance().getSceneResLoader().releaseAsset(viewPath)
            // }
            view.node.destroy();
            view.node.removeFromParent();
            //SceneMgr.getInstance().getSceneResLoader().releaseAsset(viewPath);
        })
    }
}
