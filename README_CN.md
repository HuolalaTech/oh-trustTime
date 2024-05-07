# <center>TrustTime</center>

-------------------------------------------------------------------------------
**[中文文档](README_CN.md)** ｜ **[Introduction](README.md)**

## 简介
`TrustTime`是一个轻量级的校准时间库，通过ntp时间、Disk缓存时间、网络时间 来提高当前时间的准确性，进而减少本机时间不准导致的异常。
* **1.极简的api**
* **2.支持ntp服务器时间校准**
* **3.支持服务时间校准**
* **4.支持缓存时间校准**
-------------------------------------------------------------------------------

## 下载安装
```shell
ohpm i @huolala/trust-time 
```
OpenHarmony ohpm 环境配置等更多内容，请参考[如何安装 OpenHarmony ohpm 包](https://gitee.com/openharmony-tpc/docs/blob/master/OpenHarmony_har_usage.md)
## 使用说明
**1. 引入依赖**
 ```
   import TrustTime from '@huolala/trusst-time';
 ```

**2. 快速使用**

* **初始化方式一**

```
    /**
    * 此方式使用NTP时间和DISK时间
    * 内置NTP服务地址为:["ntp.aliyun.com", "time-a-wwv.nist.gov", "time1.aliyun.com", "time-c-wwv.nist.gov", "ntp1.aliyun.com"]
    * 更多NTP服务地址 : (https://support.ntp.org/Servers/NTPPoolServers)
    */
    TrustTime.init(this.context);
```

* **初始化方式二**
```
 /**
   * @param context                           : 上下文
   * @param isTrustAllServerHost              : 是否信任所有serverHost返回的服务器时间， 默认true。
   * @param IInitParams.trustServerHosts      : 配置信任的host名单
   * @param IInitParams.priorityServerTime    : 配置时间信任优先级， true：优先信任服务器时间， false：优先信任ntp、disk时间
   * @param IInitParams.ntpHosts              : 配置ntp地址
   *
   * 备注:(参数isTrustAllServerHost设置为ture时即信任所有服务器时间，再配置trustServerHosts 白名单是无效的。)
   */
    
    TrustTime.init(
            this.context,
            false,
            {
                trustServerHosts: [myServerHost],
                priorityServerTime: false,
                ntpHosts: []
            });
```

* **设置网络时间方式一**
  (建议设置:避免部分地区Ntp服务不稳定或不可用)
```
    /**
    * 单个请求中设置
    * 举例：假设网络库使用的axios
    */
    axios.get<string, AxiosResponse<string>, null>("https:www.baidu.com", {
            timeout: 20000,
            headers: { 'X-Custom-Header': 'foobar' }
          })
            .then((response: AxiosResponse) => {
              console.warn(`${logTag} -> rsp.headers: ${JSON.stringify(response.headers)}`);
              // 同步服务器时间
              TrustTime.setServerTime(response)
            })
            .catch((error: AxiosError) => {
              console.error("result:" + error.message);
            });
    
```

* **设置网络时间方式二**
  (建议设置:避免部分地区Ntp服务不稳定或不可用)
```
    /**
    * 拦截器中统一设置
    */
    axios.interceptors.response.use((response: AxiosResponse) => {
            console.warn(`${logTag} ->interceptors() rsp.headers: ${JSON.stringify(response.headers)}`);
            // 同步服务器时间
            TrustTime.setServerTime(response)
            return response;
          }, (error: AxiosError) => {
            return Promise.reject(error);
          });
    
```

* **获取时间**

```
    /**
    * 1.优先取ntp时间
    * 2.ntp时间不可用时:        尝试取disk时间。(仅当disk时间与本地时间差小于60s)
    * 3.ntp&disk时间均不可用时:  尝试取网络时间。
    */
    TrustTime.now()
```

* **格式化时间**

```
    TrustTime.format(TrustTime.now())
```

* **手动设置Ntp时间**
  (按需设置:初始化时会立即从配置的多个ntp服务获取时间，
  如业务在初始化前需要使用其他校准时间，即可手动设置)
```
    TrustTime.setNtpTime(ntpTime: number, ntpUptime: number)
```

