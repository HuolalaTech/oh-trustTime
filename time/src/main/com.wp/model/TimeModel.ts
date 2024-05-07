export default class TimeModel {
    /**
     * NTP time
     */
    private ntpTime: number = 0;
    public getNtpTime() {
        return this.ntpTime;
    }
    public setNtpTime(ntpTime: number) {
        this.ntpTime = ntpTime;
    }

    /**
     * When the ntp is different, the device time passes
     */
    private ntpUptime: number = 0;
    public getNtpUptime() {
        return this.ntpUptime;
    }
    public setNtpUptime(ntpUptime: number) {
        this.ntpUptime = ntpUptime;
    }

    /**
     * NTP is trust
     */
    private isNtpTrust: boolean = false;
    public setIsNtpTrust(value: boolean) {
        this.isNtpTrust = value;
    }
    public getIsNtpTrust() {
        return this.isNtpTrust;
    }

    /**
     *
     */
    private diskTime: number = 0;
    public setDiskTime(value: number) {
        this.diskTime = value;
    }
    public getDiskTime() {
        return this.diskTime;
    }

    /**
     *
     */
    private diskUptime: number = 0;
    public setDiskUptime(value: number) {
        this.diskUptime = value;
    }
    public getDiskUptime() {
        return this.diskUptime;
    }

    /**
     * Disk time whether trust
     */
    private isDiskTrust: boolean = false;
    public setIsDiskTrust(value: boolean) {
        this.isDiskTrust = value;
    }
    public getIsDiskTrust() {
        return this.isDiskTrust;
    }

    /**
     * Last synchronized server time
     */
    private serverTime: number = 0;
    public setServerTime(value: number) {
        this.serverTime = value;
    }
    public getServerTime() {
        return this.serverTime;
    }

    /**
     * The device startup time when the server time was last synchronized
     */
    private serverUptime: number = 0;
    public setServerUptime(value: number) {
        this.serverUptime = value;
    }
    public getServerUptime() {
        return this.serverUptime;
    }

    /**
     * Server time whether trust
     */
    private isServerTrust: boolean = false;
    public setIsServerTrust(value: boolean) {
        this.isServerTrust = value;
    }
    public getIsServerTrust() {
        return this.isServerTrust;
    }
}