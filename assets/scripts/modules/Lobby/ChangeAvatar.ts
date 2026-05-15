import * as cc from 'cc';
import { Message } from '../../base/core/MessageMgr';
import { BaseView } from '../../base/frame/BaseView';
import { UrlImageView } from '../../base/gui/urlImageView';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { UserInfo } from '../common/UserInfo';
import { Prefab } from 'cc';
import { EventTouch } from 'cc';
const { ccclass, property } = cc._decorator;

@ccclass('ChangeAvatar')
export class ChangeAvatar extends BaseView {

    @property(cc.ScrollView)
    scroll: cc.ScrollView = null
    @property(Prefab)
    item: cc.Prefab = null
    @property(Prefab)
    itemAdd: cc.Prefab = null

    private avatarIndex:number = 0

    private defaultAvatarNums:number = 10

    private avatarArr:any = null

    private base64Img:any = null

    start() {

        //@ts-ignore
        window.webBase64String = (param) => {
            // console.log("0--0",param)
            var fileList = param.files[0];
            var reader = new FileReader();
            reader.readAsDataURL(fileList);
            reader.onload = (event) => {
                let image = new Image() //新建一个img标签（还没嵌入DOM节点)
                var dataImg  = event.target.result;
                var num = 0;
                //@ts-ignore
                image.src = event.target.result
                image.onload = () => {
                    // console.log("1--1",fileList.size)
                    //由于不能将太多Base64字符给服务端发过于，咱们压缩一下
                    //如果想支持更大图片，请继续加判断，增加除数
                    if(fileList.size > 20000000){
                        console.log("文件大小不能大于20M！")
                        param.value = '';
                        return;
                    }else if(fileList.size > 20000000){
                        num = 100;
                    }else if(fileList.size > 19000000){
                        num = 95;
                    }else if(fileList.size > 18000000){
                        num = 90;
                    }else if(fileList.size > 17000000){
                        num = 85;
                    }else if(fileList.size > 16000000){
                        num = 80;
                    }else if(fileList.size > 15000000){
                        num = 75;
                    }else if(fileList.size > 14000000){
                        num = 70;
                    }else if(fileList.size > 13000000){
                        num = 65;
                    }else if(fileList.size > 12000000){
                        num = 60;
                    }else if(fileList.size > 11000000){
                        num = 55;
                    }else if(fileList.size > 10000000){
                        num = 50;
                    }else if(fileList.size > 9000000){
                        num = 45;
                    }else if(fileList.size > 8000000){
                        num = 40;
                    }else if(fileList.size > 7000000){
                        num = 35;
                    }else if(fileList.size > 6000000){
                        num = 30;
                    }else if(fileList.size > 5000000){
                        num = 25;
                    }else if(fileList.size > 4000000){
                        num = 20;
                    }else if(fileList.size > 3000000){
                        num = 15;
                    }else if(fileList.size > 2000000){
                        num = 10;
                    }else if(fileList.size > 1000000){
                        num = 5;
                    }else if(fileList.size > 500000){
                        num = 2.5;
                    }else if(fileList.size > 250000){
                        num = 1.5;
                    }else {
                        num = 1;
                    }
                    let canvas = document.createElement('canvas');
                    let context = canvas.getContext('2d');
                    let imageWidth = image.width / num;  //压缩后图片的大小
                    let imageHeight = image.height / num;
                    canvas.width = imageWidth;
                    canvas.height = imageHeight;
                    context.drawImage(image, 0, 0, imageWidth, imageHeight);
                    dataImg = canvas.toDataURL('image/png');
                    // console.log(dataImg);
                    this.base64Img = dataImg

                    
                    console.log("2----------2",dataImg)
                    httpRequest.post("api/v1/upload-avatar",{
                        avatar:this.base64Img
                    },(succ:any) => {
                        AlterTipsWrap.show("上传成功")
                        UserInfo.avatar = succ.avatar
                        Message.dispatchEvent("ChangeAvatarSucc")
                        this.close()
                    },(fail:any) => {
                        
                    })
                    
                    
                    param.value = '';
                }
            };
        };

        this.reqDefaultAvatar()
    }

    reqDefaultAvatar () {
        httpRequest.post("api/v1/get-avatar-list",{},(succ:any) => {
            this.avatarArr = succ.avatar_list
            this.initAvatarList(succ)
        },(fail:any) => {
            
        })
    }

    initAvatarList (data:any) {
        for (let i=0; i<data.avatar_list.length; i++) {
            let avatarData = data.avatar_list[i]
            let item = cc.instantiate(this.item)
            if (item.getComponent(UrlImageView)) {
                item.getComponent(UrlImageView).setUrl(avatarData.value)
            }
            item.getChildByName("img").getComponent(UrlImageView).setUrl(avatarData.value)
            item.getChildByName("select").active = false
            item.parent = this.scroll.content

            item.off(cc.Node.EventType.TOUCH_END)
            item.on(cc.Node.EventType.TOUCH_END,(target:EventTouch) => {
                let currTarget = target.getCurrentTarget()
                for (let j=0; j<this.scroll.content.children.length; j++) {
                    let obj = this.scroll.content.children[j]
                    if (obj.getChildByName("select")) {
                        obj.getChildByName("select").active = false
                    }
                }
                currTarget.getChildByName("select").active = true
                this.avatarIndex = i
            })
            if (i == data.avatar_list.length-1) {
                let itemAdd = cc.instantiate(this.itemAdd)
                itemAdd.parent = this.scroll.content
                itemAdd.off(cc.Node.EventType.TOUCH_END)
                itemAdd.on(cc.Node.EventType.TOUCH_END,(target:EventTouch) => {
                    document.getElementById("file").click();
                })
            }
        }
    }

    btnAvatarCall (target:cc.EventTouch,customs:string) {
        // if (customs == "10") {
        //     document.getElementById("file").click();
        //     return
        // }
        // if (this.imgAvatarArr[Number(customs)].spriteFrame != null) {
        //     let obj = target.currentTarget
        //     this.selectAvatar.active = true
        //     this.selectAvatar.setPosition(new cc.Vec3(obj.getPosition()))
        //     this.avatarIndex = Number(customs)
        // }
        
    }

    btnCancelCall () {
        this.close()
    }

    btnSureCall () {
        if (this.avatarIndex == UserInfo.avatar_index) {
            this.close()
            return
        }
        httpRequest.post("api/v1/change-player-avatar",{
            avatar_id:this.avatarArr[this.avatarIndex].id
        },(succ:any) => {
            AlterTipsWrap.show("修改成功")
            UserInfo.avatar = this.avatarArr[this.avatarIndex].value
            Message.dispatchEvent("ChangeAvatarSucc")
            this.close()
        },(fail:any) => {
            
        })
    }
}


