import TrustTime from '@huolala/trust-time';
import axios, { AxiosError, AxiosResponse } from '@ohos/axios'
import { myServerHost } from '../entryability/EntryAbility';

const logTag = "trust_time"

@Entry
@Component
struct Home {
  @State message: string = 'TrustTime Demo';

  build() {
    Row() {
      Column() {
        Text(this.message)
          .fontSize(50)
          .fontWeight(FontWeight.Bold);

        Button("获取当前校准时间").backgroundColor(Color.Black).onClick(() => {
          console.warn(`${logTag} -> Date.now     : ${TrustTime.format(Date.now())}`)
          console.warn(`${logTag} -> TrustTime.now: ${TrustTime.format(TrustTime.now())}`)
        }).margin({ top: 20 });

        Button("演示网络时间设置").backgroundColor(Color.Black).onClick(() => {
          // // 1.如果配置了多个serverHost， 建议添加response拦截器 统一处理
          // axios.interceptors.response.use((response: AxiosResponse) => {
          //   console.warn(`${logTag} ->interceptors() rsp.headers: ${JSON.stringify(response.headers)}`);
          //   // 3.同步服务器时间
          //   TrustTime.setServerTime(response)
          //   return response;
          // }, (error: AxiosError) => {
          //   return Promise.reject(error);
          // });

          // 2.模拟初始化配置serverHost的请求，如果配置了多个 建议统一在拦截器中处理
          axios.get<string, AxiosResponse<string>, null>(myServerHost, {
            timeout: 20000,
            headers: { 'X-Custom-Header': 'foobar' }
          })
            .then((response: AxiosResponse) => {
              console.warn(`${logTag} -> rsp.headers: ${JSON.stringify(response.headers)}`);
              // 3.同步服务器时间
              TrustTime.setServerTime(response)
            })
            .catch((error: AxiosError) => {
              console.error("result:" + error.message);
            });

        }).margin({ top: 20 });
      }
      .width('100%')
    }
    .height('100%')
  }
}