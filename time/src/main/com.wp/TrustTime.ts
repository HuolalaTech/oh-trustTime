import NtpTime, { NTPResponse } from './core/NtpTime';
import Logger from './log/Logger';
import TimeModel from './model/TimeModel';
import DiskTime from './core/DiskTime';
import AppStatusHelper from './helper/AppStatusHelper';
import TimeUtil from './utils/TimeUtil';
import TimeConstant from './constants/TimeConstant';
import ServerTime from './core/ServerTime';
import { systemDateTime } from '@kit.BasicServicesKit';
import { common } from '@kit.AbilityKit';
import TimeError from './error/TimeError';

/**
 * trustServerHosts   : 配置信任的host名单
 * priorityServerTime : 配置时间信任优先级， true：优先信任服务器时间， false：优先信任ntp、disk时间
 * ntpHosts           : 配置ntp地址
 */
export interface IInitParams {
  trustServerHosts ?: string[];
  priorityServerTime ?: boolean
  ntpHosts ?: string[];
}


export default class TrustTime {
  private static hasInit: boolean = false;
  private static isTrustAllServerHost: boolean
  private static timeModel: TimeModel = new TimeModel();
  private static iInitParam: IInitParams

  private constructor() {
  }

  /**
   *
   * @param context                           : 上下文
   * @param isTrustAllServerHost              : 是否信任所有serverHost返回的服务器时间， 默认true。
   * @param IInitParams.trustServerHosts      : 配置信任的host名单
   * @param IInitParams.priorityServerTime    : 配置时间信任优先级， true：优先信任服务器时间， false：优先信任ntp、disk时间
   * @param IInitParams.ntpHosts              : 配置ntp地址
   *
   * @throws {Error} Will throw an error if isTrustAllServerHost = true And  isTrustAllServerHost not empty
   */
  public static init(context: common.Context, isTrustAllServerHost: boolean = true, params?: IInitParams) {
    if (TrustTime.hasInit) {
      return;
    }
    TrustTime.hasInit = true;
    TrustTime.isTrustAllServerHost = isTrustAllServerHost

    TrustTime.iInitParam = params;
    if (!TrustTime.iInitParam) {
      TrustTime.iInitParam = {
        ntpHosts: TimeConstant.DEFAULT_NTP_HOST, trustServerHosts: [], priorityServerTime: false
      }
    } else if (!TrustTime.iInitParam.ntpHosts || TrustTime.iInitParam.ntpHosts.length < 1) {
      TrustTime.iInitParam.ntpHosts = TimeConstant.DEFAULT_NTP_HOST
    }

    if (TrustTime.iInitParam.trustServerHosts && TrustTime.iInitParam.trustServerHosts.length > 0 && TrustTime.isTrustAllServerHost) {
      throw new Error("Parameter ambiguity, pls set isTrustAllServerHost = false or set isTrustAllServerHost empty")
    }

    // 1.get disk time
    DiskTime.init(context)
    TrustTime.TimeHandler.setDiskTime(DiskTime.getTimeFromPreferences(DiskTime.KEY_LOCAL_NTP_NTP), DiskTime.getTimeFromPreferences(DiskTime.KEY_LOCAL_NTP_NTP_UPTIME));

    // 2.get ntp time
    TrustTime.getNtpTime()

    // 3.register time refresh
    AppStatusHelper.appForegroundStatusListener(context, (isRefresh) => isRefresh && this.getNtpTime());
    AppStatusHelper.appNetworkAvailableListener((isRefresh) => isRefresh && this.getNtpTime());
  }

  public static now(): number {
    if (this.timeModel.getIsNtpTrust()) {
      return this.TimeHandler.ntpNow();
    }

    if (this.timeModel.getIsDiskTrust()) {
      return this.TimeHandler.diskNow();
    }

    if (this.timeModel.getIsServerTrust()) {
      return this.TimeHandler.serveNow();
    }

    return Date.now();
  }

  public static nowDate(): Date {
    return new Date(this.now());
  }

  public static setServerTime(serverResponse: any, currentUrl?: string): void {
    if (TrustTime.hasInit && serverResponse) {
      let serverTime = ServerTime.parseServerTime(serverResponse, TrustTime.isTrustAllServerHost, TrustTime.iInitParam.trustServerHosts, currentUrl)
      if (!serverTime || serverTime < 1) {
        return;
      }
      TrustTime.updateServerTime(serverTime, TrustTime.iInitParam.priorityServerTime)
    }
  }


  public static format(value: number, format?: string) {
    format = format ?? "yyyy-MM-dd HH:mm:ss.SSS";
    const date = new Date(value);
    let ret;
    const opt = {
      'y+': date.getFullYear().toString(),
      'M+': (date.getMonth() + 1).toString(),
      'd+': date.getDate().toString(),
      'H+': date.getHours().toString(),
      'm+': date.getMinutes().toString(),
      's+': date.getSeconds().toString(),
      'S+': date.getMilliseconds().toString()
    };
    for (const k in opt) {
      ret = new RegExp('(' + k + ')').exec(format);
      if (ret) {
        format = format.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, '0')));
      }
    }
    return format;
  }

  private static TimeHandler = class {
    public static ntpNow() {
      const time = TrustTime.timeModel.getNtpTime();
      const uptime = TrustTime.timeModel.getNtpUptime();
      return time + (TimeUtil.getUptime() - uptime);
    }

    public static serveNow() {
      const time = TrustTime.timeModel.getServerTime();
      const uptime = TrustTime.timeModel.getServerUptime();
      return time + (TimeUtil.getUptime() - uptime);
    }

    public static diskNow() {
      const time = TrustTime.timeModel.getDiskTime();
      const uptime = TrustTime.timeModel.getDiskUptime();
      return time + (TimeUtil.getUptime() - uptime);
    }

    public static setNtpTime(ntpTime: number, ntpUptime: number) {
      if (ntpTime > 0) {
        TrustTime.timeModel.setNtpTime(ntpTime);
        TrustTime.timeModel.setNtpUptime(ntpUptime);
        TrustTime.timeModel.setIsNtpTrust(true);
      }
    }

    public static setServerTime(serverTime: number, ntpUptime: number) {
      if (serverTime > 0) {
        TrustTime.timeModel.setServerTime(serverTime);
        TrustTime.timeModel.setServerUptime(ntpUptime);
        TrustTime.timeModel.setIsServerTrust(true);
      }
    }

    public static setDiskTime(diskTime: number, diskUptime: number) {
      if (diskTime > 0) {
        TrustTime.timeModel.setDiskTime(diskTime);
        TrustTime.timeModel.setDiskUptime(diskUptime);
        let trustDisk = Math.abs((diskTime - systemDateTime.getTime(false))) < TimeConstant.TIME_DIFF
        TrustTime.timeModel.setIsDiskTrust(trustDisk);
      }
    }
  }

  private static updateServerTime(serverTime: number, priorityServerTime: boolean) {
    if (TrustTime.timeModel.getIsNtpTrust()) {
      const diff = TrustTime.TimeHandler.ntpNow() - serverTime;
      if (Math.abs(diff) > TimeConstant.TIME_DIFF) {
        Logger.d(`Server time and ntp time diff too long. diff: ${diff}}`);
        if (priorityServerTime) {
          TrustTime.timeModel.setIsNtpTrust(false);
        }
      }
    }

    if (TrustTime.timeModel.getIsDiskTrust()) {
      const diff = TrustTime.TimeHandler.diskNow() - serverTime;
      if (diff > TimeConstant.TIME_DIFF) {
        TrustTime.timeModel.setIsDiskTrust(false);
      }
    }

    TrustTime.TimeHandler.setServerTime(serverTime, TimeUtil.getUptime());
  }

  private static getNtpTime() {
    return new Promise((resolve, reject) => {
      NtpTime.requestNtpTimeParallel(TrustTime.iInitParam.ntpHosts).then((res: NTPResponse) => {
        TrustTime.TimeHandler.setNtpTime(res.ntpTime, res.ntpUptime);
        DiskTime.setCacheTime(res);
        resolve(true);
      }).catch((err) => {
        Logger.e("Description Failed to set the ntp timestamp", JSON.stringify(err));
        reject(err);
      })
    });
  }
}