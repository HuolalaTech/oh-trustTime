import DataPreferences from '@ohos.data.preferences';
import { NTPResponse } from './NtpTime';
import { common } from '@kit.AbilityKit';

export default class DiskTime {
  public static readonly KEY_LOCAL_NTP_NTP: string = "local_ntp_time";
  public static readonly KEY_LOCAL_NTP_NTP_UPTIME: string = "local_ntp_uptime";
  private static readonly sp_name = "sp_trust_time";
  private static preferences?: DataPreferences.Preferences;
t
  public static init(context: common.Context) {
    if (!this.preferences) {
      this.preferences = DataPreferences.getPreferencesSync(context, {
        name: this.sp_name
      })
    }
  }


  public static isExist(key: string): boolean {
    return this.preferences.hasSync(key);
  }

  public static clearAll(): void {
    this.preferences.clear();
  }

  public static setCacheTime(data: NTPResponse): void {
    this.preferences.putSync(DiskTime.KEY_LOCAL_NTP_NTP, data.ntpTime)
    this.preferences.putSync(DiskTime.KEY_LOCAL_NTP_NTP_UPTIME, data.ntpUptime)
    this.preferences.flush()
  }

  public static getTimeFromPreferences(key: string): number {
    return this.preferences.getSync(key, 0) as number;
  }
}
