import { DEBUG } from "cc/env";

export enum ENV {
    DEBUG,
    INNER_TEST,
    OUT_TEST,
    RELEASE,
}

let cur_env = ENV.RELEASE;

export function setCurEnv( env : ENV){
    cur_env = env;
}

export function getCurEnv(): ENV{
    if (cur_env == ENV.DEBUG) {
        return 0;
    }else {
        return 1
    }
    // return cur_env;
}

