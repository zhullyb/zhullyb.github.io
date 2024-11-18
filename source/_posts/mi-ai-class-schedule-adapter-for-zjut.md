---
title: 小爱同学课程表适配不完全指北——以 ZJUT 本科正方教务系统为例
date: 2024-11-18 21:13:56
sticky:
tags:
- JavaScript
- MiAI
---



## 写在前面

一个月前，我发现小爱课程表中针对我学校的教务系统导入系统年久失修，因此我便决定自己另立门户、独立维护一版针对 ZJUT 教务系统课表信息导入的适配项目。

整个流程不难，如果你对于 js 代码和爬虫技术有简单的了解，那么很快就可以上手，我大概只花了 2 小时就完成了 阅读文档-编写代码-自测通过-提交审核 的过程，并在一周内正式上架，得到了身边同学的认可。

在适配过程中，一定要仔细阅读官方文档，所有技术性问题几乎都能通过官方文档解决。这篇博客我尽量详细记录了使用 fetch 打请求获取 json 的正方教务系统适配方案，仅供参考。

官方文档地址: [小爱课程表开发者工具使用教程](https://open-schedule-prod.ai.xiaomi.com/docs/#/help/)

我的代码: [Github](https://github.com/zhullyb/ZJUT-Mi-Schedule-Adapter/)

## 运行原理

小爱课表获取课表信息的大致流程如下

1. 在你的手机上调用系统 webview 进入你指定的教务系统，让你手动输入账号密码并完成登陆流程
2. 获取含有课表信息的字符串（可以是直接获取页面展示的 html 代码，也可以是利用登陆时获取的 cookie/session 信息直接向后端发送请求拿响应）
3. 解析获取到的字符串，按照小米预先定义好的 json 格式输出

作为适配者，我们需要提供三个代码文件，分别是 `Provider`、`Parser` 和 `Timer`

`Provider` 和 `Timer` 都在本地登陆好教务系统后的 webview 环境中执行，前者需要返回步骤 2 中描述的带有课表信息的字符串，Timer 则返回课程时间、学期周数等信息。

`Provider` 获取到的字符串将会成为 `Parser` 的函数参数，这个函数将会上传到小米的服务器中运行，根据文档所说是为了满足部分开发者保护自己的代码防止被抓包而刻意设计的（虽然我不理解这种东西有什么好闭源的）。

## 适配实战

### 安装浏览器插件

首先下载小米提供给我们的资源包，目前我拿到的最新的版本是 v0.3.8，[下载链接](https://open-schedule-prod.ai.xiaomi.com/docs/#/help/?id=%e4%b8%8b%e8%bd%bd)。注意不要被后缀骗了，这不是个 rar 包，我这里后缀改成 tar 后可以被 ark 正确解压，后缀名是 rar 可能是开发者希望 Windows 用户能用 winrar 进行解压？

这里需要一个 Chromium-based 的浏览器安装小米提供的浏览器插件。

然后使用 Chrome 的「加载已解压的扩展程序」安装整个被解压的目录。Chrome 安装后提示 Manifest version 2 将会在 2024 年被弃用，不知道小米能不能在 Chrome 弃用前支持 Manifest version 3，趁着能用我先不管它。

![](https://static.031130.xyz/uploads/2024/11/18/f2a063c982a42.webp)

随后打开自己学校的教务网站，F12 打开开发者工具，可以看到多了一栏叫「AISchedule」的选项

![](https://static.031130.xyz/uploads/2024/11/18/800054d7f4ff8.webp)

随后正常登陆自己的小米账号，放一旁备用。

### 抓流量包

随后，登陆自己的教务网站，打开课表页面，查看 F12 开发者工具的网络一览，刷新页面加载自己的课表，查看开发者页面中显示的数据流，找到含有课表信息的那一个。

这个流程我个人用惯了 Firefox 浏览器，因此数据分析这一块的截图都是 Firefox 的截图。

![](https://static.031130.xyz/uploads/2024/11/18/7ea6e1e0bbfcf.webp)

在我的例子中，第一个请求的响应是一个 html 页面，勾勒出了这个页面的大致轮廓，不过没有样式。这是一个好的迹象，说明这大概率是一个前后端分离的站点，授课数据很可能是通过 json 的数据单独传递给前端的，我们就不需要从 html 中解析我们的课表。

如果能确定是前后端分离的站点，我们可以尝试勾选这里的「XHR」选项，XHR 的全名是 XMLHttpRequest，是一种前端向后端发起请求的方式，前后端的数据一般都会在这里展示。

![](https://static.031130.xyz/uploads/2024/11/18/36880519d2109.webp)

我在第三个请求中发现了我的课表信息，在已经登陆的情况下，小米的课程表允许我通过 fetch 函数打一个相同的请求给后端，获取这个响应结果作为 `Provider` 部分的输出字符串。

### 调试 fetch 参数

这个请求的 fetch 函数如何构建？可以直接右键这个请求，在菜单中选择「复制为 Fetch 语句」

![](https://static.031130.xyz/uploads/2024/11/18/ff498f0a0957e.webp)

复制下来的语句长下面这个样子

```javascript
await fetch("http://www.gdjw.zjut.edu.cn/jwglxt/kbcx/xskbcx_cxXsgrkb.html?gnmkdm=N2151", {
    "credentials": "include",
    "headers": {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0",
        "Accept": "*/*",
        "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        "X-Requested-With": "XMLHttpRequest"
    },
    "referrer": "http://www.gdjw.zjut.edu.cn/jwglxt/kbcx/xskbcx_cxXskbcxIndex.html?gnmkdm=N2151&layout=default",
    "body": "xnm=2024&xqm=3&kzlx=ck&xsdm=",
    "method": "POST",
    "mode": "cors"
});
```

先看 body 部分

- xnm=2024 很明显是年份的意思

- xqm 表示月份，这个通过多次尝试获取不同学期的课表可以得出结果，3 表示第一学期，12 表示第二学期，16 表示第三学期（短学期）
- 其余的参数我不关心，一模一样带上就行

这个函数是可以直接放在 F12 开发者工具的控制台中运行的，通过在 fetch 函数的尾部（分号前）添加一个回调函数就可以打印出函数获取的结果。

```javascript
await fetch(...).then(response => response.json())
```

这就允许我们去尝试是否可以删减一些 fetch 函数的参数，获得相同的结果。

如删除 headers 中的 User-Agent、删除 referer 等等，我最后精简了一些参数，fetch 函数长这个样子。

```javascript
await fetch("http://www.gdjw.zjut.edu.cn/jwglxt/kbcx/xskbcx_cxXsgrkb.html?gnmkdm=N2151", {
    "credentials": "include",
    "headers": {
        "Accept": "*/*",
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        "X-Requested-With": "XMLHttpRequest"
    },
    "body": "xnm=2024&xqm=3&kzlx=ck&xsdm=",
    "method": "POST",
    "mode": "cors"
});
```

现在，将 fetch 函数自身和其执行后获取的结果复制下来保存到本地备用，我们就可以开始写代码了。

### 安装依赖

在刚刚的压缩包解压出来的目录中，有一个叫 localTools 的文件夹，我们可以把它复制到自己的工作目录下，我们的代码工作主要就是在那里进行。

打开 VSCode，命令行运行 `pnpm i` 安装其运行时的依赖，顺便截图给你们看一眼目录结构。

![](https://static.031130.xyz/uploads/2024/11/18/d8316deee7e50.webp)

### 编写 provider

首先编写 `code/provider.js`

在这个文件中，我们需要执行 fetch 函数，return 其获取到的 json 数据。

按照官方文档，先 `loadTool`

```javascript
await loadTool('AIScheduleTools')
```

随后，我选择使用 `AISchedulePrompt` 这个小米封装的工具让用户手动输入需要导入课表的学年和学期信息，并对输入数据进行简单校验。

```javascript
const year = await AISchedulePrompt({
  titleText: '学年',
  tipText: '请输入本学年开始的年份',
  defaultText: '2024',
  validator: value => {
    try {
      const v = parseInt(value)
      if (v < 2000 || v > 2100) {
        return '请输入正确的学年'
      }
      return false
    } catch (error) {
      return '请输入正确的学年'
    }
  }
})

const term = await AISchedulePrompt({
  titleText: '学期',
  tipText: '请输入本学期的学期(1,2,3 分别表示上、下、短学期)',
  defaultText: '1',
  validator: value => {
    if (value === '1' || value === '2' || value === '3') {
      return false
    }
    return '请输入正确的学期'
  }
})

switch (term) {
  case 1:
    term = '3'
    break
  case 2:
    term = '12'
    break
  case 3:
    term = '16'
    break
}
```

随后将学年和学期信息拼入 fetch 函数，打出请求，并将返回的 json 数据转为 string 作为函数的返回值

```javascript
const res = await fetch("http://www.gdjw.zjut.edu.cn/jwglxt/kbcx/xskbcx_cxXsgrkb.html?gnmkdm=N2151", {
  "headers": {
    "accept": "*/*",
    "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
    "x-requested-with": "XMLHttpRequest"
  },
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": `xnm=${year}&xqm=${term}&kzlx=ck&xsdm=`,
  "method": "POST",
  "mode": "cors",
  "credentials": "include"
})

const ret = await res.json()
return JSON.stringify(ret.kbList)
```

最外层使用 try-catch 做简单的异常处理，如果出错就让用户确认是否正确登陆了教务系统

```javascript
async function scheduleHtmlProvider() {
  await loadTool('AIScheduleTools')
  try {
    //...
  } catch (error) {
    await AIScheduleAlert('请确定你已经登陆了教务系统')
    return 'do not continue'
  }
}
```

### 编写 parser

官方文档对 parser 函数做了明确的规范，格式如下

```json
[
  {
    name: "数学", // 课程名称
    position: "教学楼1", // 上课地点
    teacher: "张三", // 教师名称
    weeks: [1, 2, 3, 4], // 周数
    day: 3, // 星期
    sections: [1, 2, 3], // 节次
  },{
    name: "数学",
    position: "教学楼1",
    teacher: "张三",
    weeks: [1, 2, 3, 4],
    day: 1,
    sections: [1, 2, 3],
  },
]
```

最外层是一个 array，里面包含若干个 object，每个 object 表示一节课

> 课程名称：`String` 长度50字节（一汉字两字节）
>
> 上课地点：`String` 长度50字节（一汉字两字节）
>
> 教师名称：`String` 长度50字节（一汉字两字节）
>
> 周数：`Number[]` [1，30] 之间的整数 超出会被裁掉
>
> 星期：`Number` [1，7] 之间的整数
>
> 节次：`Number` [1，30] 之间的整数 (默认[1，12]) 根据后续时间设置自动裁剪

（只有这节课的星期几、上课地点、上课时间都一致才算一节课。比如我一周上两节算法课，周一 34 节和周三 56，那么这应该分成两个 object 来写）

这部分代码没什么好说的，就是对 `provider` 传过来的 string 用 js 做字符串解析，最后把整个 array 作为返回值返回就行，需要注意处理数组越界、空数组等等的低级错误。

第一步是将刚才的字符串转成 json 格式（如果你采用的是解析 html 的方式，请参考官方文档）

```javascript
function scheduleHtmlParser(json_str) {
  courses_json = JSON.parse(json_str)
  const courseInfos = []

  //...
  
  return courseInfos
}
```

如果需要一个临时的测试方案，可以用以下的测试结构

```javascript
function scheduleHtmlParser(json_str) {
  courses_json = JSON.parse(json_str)
  const courseInfos = []

  //...
  
  return courseInfos
}

input_text = `
// 这里是我在上文中复制的 fetch 函数输出的 json 结果
`

console.log(scheduleHtmlParser(input_text))
```

执行 `node code/parser.js` ，观察输出结果是否和官方要求的结构严格一致。

### 编写 timer

`timer` 函数的运行环境和 `provider` 一致，都允许你使用 fetch 向教务系统打请求，或者解析页面的 html 函数，但我们学校的教务系统一不写第一周的周一是几号，二不写每节课具体的上下课时间，所以我把我校的相关数据都进行了硬编码，这里直接放个官方文档的示例文件。

```javascript
/**
 * 时间配置函数，此为入口函数，不要改动函数名
 */
async function scheduleTimer({
  providerRes,
  parserRes
} = {}) {
  // 支持异步操作 推荐await写法

  // 这是一个示例函数，用于演示，正常用不到可以删掉
  const someAsyncFunc = () => new Promise(resolve => {
    setTimeout(() => resolve(), 1)
  })
  await someAsyncFunc()

  // 这个函数中也支持使用 AIScheduleTools 譬如给出多条时间配置让用户选择之类的

  // 返回时间配置JSON，所有项都为可选项，如果不进行时间配置，请返回空对象
  return {
    totalWeek: 20, // 总周数：[1, 30]之间的整数
    startSemester: '', // 开学时间：时间戳，13位长度字符串，推荐用代码生成
    startWithSunday: false, // 是否是周日为起始日，该选项为true时，会开启显示周末选项
    showWeekend: false, // 是否显示周末
    forenoon: 1, // 上午课程节数：[1, 10]之间的整数
    afternoon: 0, // 下午课程节数：[0, 10]之间的整数
    night: 0, // 晚间课程节数：[0, 10]之间的整数
    sections: [{
      section: 1, // 节次：[1, 30]之间的整数
      startTime: '08:00', // 开始时间：参照这个标准格式5位长度字符串
      endTime: '08:50', // 结束时间：同上
    }], // 课程时间表，注意：总长度要和上边配置的节数加和对齐
  }
  // PS: 夏令时什么的还是让用户在夏令时的时候重新导入一遍吧，在这个函数里边适配吧！奥里给！————不愿意透露姓名的嘤某人
}
```

### 调试阶段

运行 `pnpm main` 能调起一个临时的服务器和浏览器插件进行互动，将编辑器的代码实时同步到浏览器插件。

在浏览器插件中，先创建一个新项目

![](https://static.031130.xyz/uploads/2024/11/18/d1ebba67ddc83.webp)

保存后再次打开，选择「编写代码」按钮

![](https://static.031130.xyz/uploads/2024/11/18/e697bcf2a7a1f.webp)

检查自己的代码是不是被实时同步到了浏览器插件中，然后可以点击右上角的「本地测试」按钮

![](https://static.031130.xyz/uploads/2024/11/18/eb563904a64a1.webp)

如果本机测试出现了问题，可以使用 console.log 语句进行 debug ，问题可能会出现在 F12 开发者工具的控制台，也可能会出现在 vscode 的终端中。确认本机测试无问题后，点击右上角蓝色的「上传」按钮，就可以在上传到云端，在登陆了自己小米账号的手机中找到自己适配的教务导入测试项目，顺利完成导入后给自己的满意度打满分，就可以在浏览器插件中点击上传审核，审核通过后你的适配工作就会公开啦。

