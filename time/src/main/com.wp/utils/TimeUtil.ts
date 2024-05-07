import systemDateTime from '@ohos.systemDateTime';

export default class TimeUtil {

    public static getUptime() {
        return systemDateTime.getUptime(systemDateTime.TimeType.STARTUP, false);
    }
}