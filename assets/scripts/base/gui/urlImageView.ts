import * as cc from 'cc';
const { ccclass, property } = cc._decorator;

@ccclass('UrlImageView')
export class UrlImageView extends cc.Component {

    @property(cc.Sprite)
    m_image:cc.Sprite = null

    @property({
        displayName : "url", 
    }) //可以在编辑器中写入地址,也可以使用setUrl
    private m_url: string = "";

    private m_istarted : boolean = false;
    private m_index : number = 0;     //当前尝试次数
    private m_retryNum : number = 0;  //最大重视次数

    public setUrl(url: string) {
        if(this.m_url == url) return;

        this.m_index = 0;
        this.m_url = url;

        if(this.m_istarted)
            this.load();
    }

    private load() {
        let loadUrl = this.m_url;

        if(this.m_url == "") return;
        let arr = this.m_url.split(".");
        let assetType = arr.pop()
        if (assetType == "png" || assetType == "jpg") {
            cc.assetManager.loadRemote<cc.ImageAsset>(loadUrl,(err, imgaeAsset)=>{
                if(loadUrl != this.m_url) return; //异步过程，可能重新设置过url，所以需要过滤久的设置回调
    
                if (err) {
                    console.log("loadRemote err:", loadUrl);
                    // cc.error(err.message || err);
                    // this.m_index++;
                    // if(this.m_index < this.m_retryNum){
                    //     this.load();
                    // }
                } else {
                    if(this.m_image) {
                        let sp = new cc.SpriteFrame()
                        let tex = new cc.Texture2D();
                        tex.image = imgaeAsset;
                        sp.texture = tex
                        // this.m_image.spriteFrame = sp
                        let orig = this.m_image.spriteFrame
                        try {
                            this.m_image.spriteFrame = sp
                        } catch (error) {
                            console.log("-----111111----------")
                            this.m_image.spriteFrame = orig
                        }
                    }
                }
            });
        }
        else {
            cc.assetManager.loadRemote<cc.ImageAsset>(loadUrl,{ext: ".png"},(err, imgaeAsset)=>{
                if(loadUrl != this.m_url) return; //异步过程，可能重新设置过url，所以需要过滤久的设置回调
    
                if (err) {
                    
                    // console.error(err.message || err);
                    // this.m_index++;
                    // if(this.m_index < this.m_retryNum){
                    //     this.load();
                    // }
                } else {
                    if(this.m_image) {
                        let sp = new cc.SpriteFrame()
                        let tex = new cc.Texture2D();
                        tex.image = imgaeAsset;
                        sp.texture = tex
                        let orig = this.m_image.spriteFrame
                        try {
                            this.m_image.spriteFrame = sp
                        } catch (error) {
                            console.log("-----222----------")
                            this.m_image.spriteFrame = orig
                        }
                    }
                }
            });
        }
        // if (this.m_url.indexOf(".png") == -1) {
            
        // }else {
        //     cc.assetManager.loadRemote<cc.ImageAsset>(loadUrl,(err, imgaeAsset)=>{
        //         if(loadUrl != this.m_url) return; //异步过程，可能重新设置过url，所以需要过滤久的设置回调
    
        //         if (err) {
        //             cc.error(err.message || err);
        //             this.m_index++;
        //             if(this.m_index < this.m_retryNum){
        //                 this.load();
        //             }
        //         } else {
        //             if(this.m_image) {
        //                 let sp = new cc.SpriteFrame()
        //                 let tex = new cc.Texture2D();
        //                 tex.image = imgaeAsset;
        //                 sp.texture = tex
        //                 this.m_image.spriteFrame = sp
        //             }
        //         }
        //     });
        // }
        
    }
    
    onLoad(){
        
    }

    start() {
        this.m_istarted = true;
        this.load();
    }
}
