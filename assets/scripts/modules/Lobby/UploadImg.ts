import * as cc from 'cc';
import { BaseView } from '../../base/frame/BaseView';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { Tools } from '../../base/utils/util/Tools';
const { ccclass, property } = cc._decorator;

@ccclass('UploadImg')
export class UploadImg extends BaseView {

    private formDataImg:any = null

    @property(cc.Sprite)
    img:cc.Sprite = null

    @property(cc.Button)
    btnUpload:cc.Button = null

    start() {
        //@ts-ignore
        window.webBase64String = (param: any) => {
                if (param.files[0].size > 1024 * 1024 * 2){
                    AlterTipsWrap.show("图片大小不能超过2M,请重新上传")
                    return
                }

                Tools.CompressImageToBase64(param, (p: string) => {
                    //此时的dataImg就是你要上传给服务器的字符
                    this.setHeadPic(p, this.img.node)
                    //param.value = '';
                })
 
                this.formDataImg = new FormData();
                if (param.files && param.files[0]) {
                    this.formDataImg.append('certificate', param.files[0]);
                    // 可以添加其他字段
                    this.formDataImg.append('id', this.m_uidata.id);
                }
            }
    }

    setHeadPic(src, node: cc.Node): void {
        let image = new Image()
        image.src = src // base 64是string，看后端返回是二进制，是否带头data:image/png;base64, 不带要手动添加
        image.onload = () => {
            let texture = new cc.Texture2D()
            texture.image = new cc.ImageAsset(image)
            let _frame = new cc.SpriteFrame()
            _frame.texture = texture
            // 获取节点的容器
            let _sf = node.getComponent(cc.Sprite)
            _sf.spriteFrame = _frame

            this.btnUpload.node.active = false
        }    
    }


    btnUploadImgCall () {
        document.getElementById("file").click();
    }

    btnSureCall() {
        httpRequest.post("api/v1/complete-recharge", this.formDataImg, (succ:any) => {
            AlterTipsWrap.show("上传成功")
            this.close()
        })
    }

    btnCloseCall () {
        this.close()
    }
}


