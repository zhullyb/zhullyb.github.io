---
title: 手动指定 python-selenium 的 driver path 以解决在中国大陆网络环境下启动卡住的问题
date: 2023-09-02 01:59:18
sticky:
execrpt:
tags:
- Python
- selenium
- Linux 
---

之前因为学校社团迎新的需求，就临时写了一个 QQ Bot，最近又给 bot 加上了 [/q 的功能](https://github.com/zhullyb/qq-quote-generator)，原理是通过 python 的 selenium 去启动一个 headless Firefox 去截由 jinja2 模板引擎生成的 html 的图。

每次这个 bot 重启的时候都因为 selenium 而需要花费好几秒的时间，甚至经常概率性启动失败。我就寻思者应该把这个图片生成的 generator 从 bot 中抽出来，这样就不至于每次重启 bot 都要遭此一劫。但就在我将 generator 打包成 docker 部署上云服务器的时候，发现居然无法启动。于是手动进 docker 的 shell 开 python 的交互式终端，发现在创建 firefox 的 webdriver 对象的时候异常缓慢，等了半分钟以后蹲到一个报错如下:

```pyth
Traceback (most recent call last):
  File "/usr/local/lib/python3.11/site-packages/selenium/webdriver/common/driver_finder.py", line 38, in get_path
    path = SeleniumManager().driver_location(options) if path is None else path
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/usr/local/lib/python3.11/site-packages/selenium/webdriver/common/selenium_manager.py", line 95, in driver_location
    output = self.run(args)
             ^^^^^^^^^^^^^^
  File "/usr/local/lib/python3.11/site-packages/selenium/webdriver/common/selenium_manager.py", line 141, in run
    raise WebDriverException(f"Unsuccessful command executed: {command}.\n{result}{stderr}")
selenium.common.exceptions.WebDriverException: Message: Unsuccessful command executed: /usr/local/lib/python3.11/site-packages/selenium/webdriver/common/linux/selenium-manager --browser firefox --output json.
{'code': 65, 'message': 'error sending request for url (https://github.com/mozilla/geckodriver/releases/latest): connection error: unexpected end of file', 'driver_path': '', 'browser_path': ''}


The above exception was the direct cause of the following exception:

Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
  File "/usr/local/lib/python3.11/site-packages/selenium/webdriver/firefox/webdriver.py", line 59, in __init__
    self.service.path = DriverFinder.get_path(self.service, options)
                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/usr/local/lib/python3.11/site-packages/selenium/webdriver/common/driver_finder.py", line 41, in get_path
    raise NoSuchDriverException(msg) from err
selenium.common.exceptions.NoSuchDriverException: Message: Unable to obtain driver for firefox using Selenium Manager.; For documentation on this error, please visit: https://www.selenium.dev/documentation/webdriver/troubleshooting/errors/driver_location
```

我才发现 selenium 试图访问 https://github.com/mozilla/geckodriver/releases/latest 且访问失败了。仔细阅读了 selenium 项目的文档发现新版本的 selenium 会尝试自动下载 webdriver:

> As of Selenium 4.6, Selenium downloads the correct driver for you. You shouldn’t need to do anything.

表面上看上去我不需要做任何事情，但项目组忽略了中国大陆的网络环境。

服务是要在境内的云服务器上跑的，我也不敢开代理，现在比较靠谱的方案是我去手动指定 Firefox 的 geckodriver，避免 selenium 去帮我自动下载一份。在 [python-selenium 的官方文档](https://selenium-python.readthedocs.io/api.html#module-selenium.webdriver.firefox.webdriver)中是让我们创建 Firefox 的 webdriver 时去传入一个 `executable_path='geckodriver'` 的关键词参数，可惜这是过时的用法，应该是维护者还没来得及更新文档。

随后便在 stackoverflow 上找到了新版 selenium [手动指定 Chrome 的 chromedriver 的方法](https://stackoverflow.com/questions/76550506/typeerror-webdriver-init-got-an-unexpected-keyword-argument-executable-p)

>```python
>from selenium import webdriver
>from selenium.webdriver.chrome.service import Service
>
>service = Service(executable_path='chromedriver.exe') 
>options = webdriver.ChromeOptions()
>driver = webdriver.Chrome(service=service, options=options)
># ...
>driver.quit()
>```

原文给的是 chrome 的方案，但 Firefox 的方案基本也是一致的，应该也是去创建一个 service 对象，猜一猜就能猜到。

```python
from selenium import webdriver
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.firefox.options import Options

service = Service(executable_path='/root/geckodriver') # 我这里是 docker 打包，懒得创建一个普通用户了，就直接用了 root 用户的 home 目录
options = Options("--headless")
driver = webdriver.Firefox(service=service, options=options)
# ...
driver.quit()
```

手动指定 geckodriver 后，在我 1 核 1 G 的小主机上创建 webdriver 对象，基本都可以秒完成。
