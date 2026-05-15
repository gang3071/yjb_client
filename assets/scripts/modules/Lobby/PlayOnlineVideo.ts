import { _decorator, SpriteFrame, Sprite, ImageAsset, Texture2D, UITransform } from "cc";
import { BaseView } from "../../base/frame/BaseView";

const { ccclass, property } = _decorator;
import TCPlayer from 'tcplayer.js';
import { audioMgr } from "../common/AudioMgr";
import { UserInfo } from "../common/UserInfo";
//import 'tcplayer.js/dist/tcplayer.min.css';

@ccclass('PlayOnlineVideo')
export class PlayOnlineVideo extends BaseView {
    /** 视频承载节点 */
    @property(Sprite)
    videoSprite: Sprite = null;

    private _video:HTMLVideoElement = null
    private _canvas:HTMLCanvasElement = null
    private _ctx:CanvasRenderingContext2D = null

    private _vplayer:any = null

    // 在类中新增变量用于缓存旧资源
    private _currentSpriteFrame: SpriteFrame | null = null;
    private _currentImageBit: ImageBitmap | null = null;

    private _isUpdating = false;

    static playing = false
    private _vid

    start(){
        this._canvas = document.createElement('canvas');
        this._canvas.width = this.videoSprite.getComponent(UITransform).width;
        this._canvas.height = this.videoSprite.getComponent(UITransform).height;
        this._canvas.style.display = 'none';
        this._ctx = this._canvas.getContext('2d');
    }

    /** 视频初始化 */
    init(d, id){ 
        this.startPlay(d, id) 
        this._vid = id
    }

    update(){
        if (this._video) {
            this.updateTexture();
        }
    }

    private async updateTexture() {
        if (this._isUpdating) return;
        this._isUpdating = true;

        try {
            this._ctx.save(); // 保存当前状态
            this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

            // 逆时针旋转 90 度（-π/2 弧度）
            this._ctx.translate(0, this._canvas.width); // 平移到左下角
            this._ctx.rotate(-Math.PI / 2); // 逆时针旋转 90 度

            // 绘制视频帧，注意宽高互换
            this._ctx.drawImage(this._video, this._canvas.width - this._canvas.height, 0, this._canvas.height, this._canvas.width);

            this._ctx.restore(); // 恢复原始状态

            // 如果 createImageBitmap 不可用，直接从 Canvas 获取图像数据
            const canvasData = this._canvas;
    
            // 销毁旧纹理
            if (this._currentSpriteFrame) {
                const oldTexture = this._currentSpriteFrame.texture;
                oldTexture?.destroy();
                this._currentSpriteFrame.destroy();
            }
    
            const texture = new Texture2D();
            texture.image = new ImageAsset(canvasData);
    
            const spriteFrame = new SpriteFrame();
            spriteFrame.texture = texture;
            this.videoSprite.spriteFrame = spriteFrame;
            this._currentSpriteFrame = spriteFrame;
        } finally {
            this._isUpdating = false;
        }
    }

    onDestroy(){
        this.desPlayer()
        
        if (this._currentImageBit) {
            this._currentImageBit.close();
            this._currentImageBit = null;
        }
        if (this._currentSpriteFrame) {
            this._currentSpriteFrame.destroy();
            const oldTexture = this._currentSpriteFrame.texture;
            if (oldTexture) oldTexture.destroy();
            this._currentSpriteFrame = null;
        }
        this.videoSprite.spriteFrame = null; // 清除引用
        // 移除video元素
        const elm = document.getElementById('player-container-' + this._vid);
        elm?.remove();
        this._canvas?.remove();

        // 恢复背景音乐
        if(UserInfo.isOpenBgAudio){
            audioMgr.replayMusic()
        }
    }

    desPlayer(){
        if (this._vplayer) {
            this._vplayer.dispose();
            this._vplayer = null;
        }
        this.videoSprite.spriteFrame = null
    }

    /** 播放视频 */
    startPlay(d, id) {
        // 暂停背景音乐
        audioMgr.pauseMusic()
        this.desPlayer()
        // 特殊原因，暂时特殊处理
        document.getElementById("videoPosition_2").appendChild(document.getElementById("videoParent"))
        let elm = document.getElementById('player-container-' + id)
        if (!elm){
            let Video = document.createElement('video'); // 创建 video 标签
            Video.id = 'player-container-' + id;
            Video.setAttribute('preload', 'auto');
            Video.setAttribute('playsinline', 'true');
            Video.setAttribute('webkit-playsinline', 'true');
            Video.setAttribute('x5-video-player-type', 'h5');
            Video.setAttribute('x5-video-orientation', 'portraint');
            Video.setAttribute('crossOrigin', 'anonymous');
            Video.setAttribute('controls', 'true');
            Video.setAttribute('hidden', 'true');
            Video.style.width = '414px';
            Video.style.height = '270px';
            
            document.getElementById("videoParent").appendChild(Video)
        }


        this._vplayer = TCPlayer('player-container-' + id, {
            sources: [{
                src: d.play_url, // 播放地址
                //src: "http://1500009007.vod2.myqcloud.com/6c9c6038vodcq1500009007/2fb02795387702305297108918/w3C7ZwlsPNYA.mp4", // 播放地址
            }],
            licenseUrl: d.license, // license 地址，必传。参考准备工作部分，在视立方控制台申请 license 后可获得 licenseUrl
            licenseKey: d.license_key,
            controls: true,
            playsinline: true,  // iOS必须设置
            autoplay: true,
            muted:true,
        });

        this._vplayer.on('loadedmetadata', (e) => {
            this._video = e.target.firstChild
        });

        this._vplayer.on('webrtcevent', function(event) {
            // 从回调参数 event 中获取事件状态码及相关数据
            if (event.data.code == 1003) {
                PlayOnlineVideo.playing = true
            }
        });
    }

    /** 是否正在播放 */
    isPlaying(){
        return PlayOnlineVideo.playing
    }

    /** 静音设置 */
    voiceChange(t){
        if (this._vplayer) {
            this._vplayer.muted(t)
        }
    }
}