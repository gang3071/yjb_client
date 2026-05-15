import * as cc from 'cc';
import { Message } from '../../base/core/MessageMgr';
import { UIMgr } from '../../base/core/UIMgr';
import { BaseView } from '../../base/frame/BaseView';
import { UrlImageView } from '../../base/gui/urlImageView';
import { utils } from '../../base/utils/utils';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { UIConfig } from '../../config/UIConfig';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { UserInfo } from '../common/UserInfo';
import { MediaVideo } from './mediaVideo';
const { ccclass, property } = cc._decorator;

@ccclass('GameNode')
export class GameNode extends BaseView {

}


