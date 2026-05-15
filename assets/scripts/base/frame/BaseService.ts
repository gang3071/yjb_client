import * as cc from 'cc';
import { EventDispatcher } from "./EventDispatcher"

const {ccclass} = cc._decorator;

@ccclass("BaseService")
export class BaseService extends EventDispatcher{
    public start () {

    }

    public stop(){

    }
}

BaseService.name
