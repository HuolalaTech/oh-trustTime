import Logger from '../log/Logger';
import TrustTime from '../TrustTime';

export default class ServerTime {
  public static parseServerTime(response: any, isTrustAllServerHost: boolean, hostWhiteList: string[], currentUrl?: string): number {
    let serverTime = 0
    try {
      const headers = response.headers;
      if (!headers || headers.length < 1) {
        return serverTime;
      }

      let url = currentUrl ? currentUrl : (response.config.baseURL ? response.config.baseURL + response.config.url : response.config.url)
      if (!url) {
        return serverTime;
      }

      if (isTrustAllServerHost || this.isWhitelist(hostWhiteList, url)) {
        let date: string = headers['date'];
        if (!date) {
          return serverTime;
        }
        serverTime = new Date(Date.parse(date)).getTime()
        Logger.d("parse serverTime from headers serverTime:" + TrustTime.format(serverTime));
      }
    } catch (err) {
      Logger.w("Description Failed to calibrate the server time", JSON.stringify(err));
    }
    return serverTime;
  }

  private static isWhitelist(hostWhiteList: string[], host: string): boolean {
    if (!host) {
      return false;
    }

    if (!hostWhiteList || hostWhiteList.length < 1) {
      return false;
    }

    for (const address of hostWhiteList) {
      if (host.indexOf(address) > -1) {
        return true;
      }
    }
    return false;
  }
}

