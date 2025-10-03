---
title: 【翻译】使用 PHP 构建简单的 REST API
date: 2023-12-12 13:07:32
sticky:
tags:
- 翻译
- PHP
---

> 我这学期有一门偏向前端的 WEB 课程，期末大作业要求使用 PHP 作为后端语言实现一个简单的影评系统，应该是不允许使用框架，使用中文关键字在搜索引擎上搜了一阵子似乎没有可供参考的案例，后来就找到了这篇博客，当中的许多观点与我不谋而合，因此我将这篇博客翻译成中文，原文戳这里: https://amirkamizi.com/blog/php-simple-rest-api

## 介绍

上周 @rapid_api 发了一个非常好的关于[使用 nodejs 和 express 创建 REST API](https://twitter.com/Rapid_API/status/1486423046424563714) 的教程帖子。我想要帮助你使用 PHP 开发同样简单的 REST API。

首先，如果你不了解 REST API，请务必查看这个 [Twitter 帖子](https://twitter.com/Rapid_API/status/1452932706967461890)。

## 目标

在我们开始之前，我想提一句，当我写这篇帖子的时候，我想确保：

1. 我使用单纯的 PHP，不使用框架
2. 我使用最简单的函数和结构体以便所有人都可以理解并跟上
3. 我将主体部分分开

现在让我们开始吧

## 准备

在我本地的机器上，我创建了一个叫 api 的文件夹于 xampp > htdocs，在里面有一个叫 index.php 的文件

如果你没有 xampp 或者你不知道如何把 php 跑起来，请务必查看[这篇文章](https://amirkamizi.com/blog/introduction-to-php)

现在，如果你尝试访问 localhost/api，你将得到一个空的响应，因为 index.php 文件是空的

## 优雅的 URL

项目中，我们需要处理的第一件事是 url

REST API 的关键特性之一是每一个 url 负责一个资源和一个操作

### 问题

这时候如果我创建一个 users.php，我需要访问

```
localhost/api/users.php
```

我需要为每一个 user id 创建一个新的文件

```
localhost/api/users/1.php
localhost/api/users/2.php
```

以此类推。

这种方案有两个问题

1. 为每个用户创建一个新文件是非常无聊和耗时的
2. 路由不优雅，每个路径后面都带有 .php

### 解决方案

让我们解决这个问题。

正如我所提到的，我不想使用任何框架，并且我想使用最简单的、最让人能够理解的方案

让我们看看如何解决这个问题

在 api 文件夹下创建一个叫 .htaccess 的文件，并且将下面的文本复制进去

```htaccess
RewriteEngine On
RewriteBase /api
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^(.+)$ index.php [QSA,L]
```

我们告诉服务器，将所有指向 /api 的请求都转发到 index.php 文件

现在，所有的 url 都指向 index.php 了，比如下面的 url 都是指向 index.php 的

```
api/users
api/users/10
api/users/5
```

现在我们同时解决了这两个问题

1. 所有的 url 都被一个文件处理
2. url 都很优雅，结尾处没有 .php

## URI

但如何知道用户请求的是哪个 uri 呢？

很简单，使用 $_SERVER 超全局变量

让我们来看一些例子

```php
// url api/users
echo $_SERVER['REQUEST_URI'];
// /api/users

// url api/users/5
echo $_SERVER['REQUEST_URI'];
// /api/users/5

// url api
echo $_SERVER['REQUEST_URI'];
// /api
```

看见了吗？这就是我们所需要的

现在，使用一个简单的 if 或者 switch 语句，我们就可以处理不同的路径了

如果你从来没有用过这些语句，去读[这篇文章](https://amirkamizi.com/blog/php-conditionals)。

## 请求方法

接下来，我们需要从请求中获取请求的方法，以查看它是GET、POST、PUT、PATCH还是DELETE。

你可以从 $_SERVER 超全局数组中获取这个信息。

```php
$_SERVER['REQUEST_METHOD']
```

让我们将这两个值存储在变量中：

```php
$uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];
```

我们可以在一个简单的 switch 语句中使用这两个变量来处理不同的请求。

我们需要判断以下请求

- api/users 的 GET 请求
- api/users/{id} 的 GET 请求
- api/users 的 POST 请求
- api/users/{id} 的 PUT 请求
- api/users/{id} 的 DELETE 请求

让我们编写针对上述请求的 switch 语句

```php
switch ($method | $uri) {
   /*
   * Path: GET /api/users
   * Task: show all the users
   */
   case ($method == 'GET' && $uri == '/api/users'):
       break;
   /*
   * Path: GET /api/users/{id}
   * Task: get one user
   */
   case ($method == 'GET' && preg_match('/\/api\/users\/[1-9]/', $uri)):
       break;
   /*
   * Path: POST /api/users
   * Task: store one user
   */
   case ($method == 'POST' && $uri == '/api/users'):
       break;
   /*
   * Path: PUT /api/users/{id}
   * Task: update one user
   */
   case ($method == 'PUT' && preg_match('/\/api\/users\/[1-9]/', $uri)):
       break;
   /*
   * Path: DELETE /api/users/{id}
   * Task: delete one user
   */
   case ($method == 'DELETE' && preg_match('/\/api\/users\/[1-9]/', $uri)):
       break;
   /*
   * Path: ?
   * Task: this path doesn't match any of the defined paths
   *      throw an error
   */
   default:
       break;
}
```

当我们想要在 switch 语句中使用两个变量，我们可以使用 | 符号

如果你想知道 preg_match 是如何工作的，看[这篇文章](https://amirkamizi.com/blog/php-regular-expressions)。

## 数据库

现在是说说数据。储存数据的最好方法是将数据储存在数据库中。但在这篇教程中，我不想使用数据库。因此，我们使用一个 json 文件当作数据库来保证数据的持久性。

我的 json 文件看起来长成这个样子：

```json
{
   "1": "Pratham",
   "2": "Amir"
}
```

如果你想知道如何使用 json，看[这篇文章](https://amirkamizi.com/blog/php-xml-and-json)

我加载 json 数据并将其转换为数组，然后在 php 使用他们。如果我想要更改数据，我将数组转换回 json 并将其重新写入文件。

要将整个文件作为一个字符串读取并存储在变量中，我使用：

```php
file_get_contents($jsonFile);
```

而要将json写入文件，我使用：

```php
file_put_contents($jsonFile, $data);
```

好了，现在我们的数据库处理好了，让我们开始处理所有的路径。

我使用 Postman 发送请求并查看响应。

## 获取所有用户

```php
case ($method == 'GET' && $uri == '/api/users'):
   header('Content-Type: application/json');
   echo json_encode($users, JSON_PRETTY_PRINT);
   break;
```

![](https://static.031130.xyz/uploads/2024/08/12/6577fcdf64a96.webp)

## 获取单个用户

```php
case ($method == 'GET' && preg_match('/\/api\/users\/[1-9]/', $uri)):
   header('Content-Type: application/json');
   // get the id
   $id = basename($uri);
   if (!array_key_exists($id, $users)) {
       http_response_code(404);
       echo json_encode(['error' => 'user does not exist']);
       break;
   }
   $responseData = [$id => $users[$id]];
   echo json_encode($responseData, JSON_PRETTY_PRINT);
   break;
```

**basename**($uri) 会将 uri 的最后一部分给我。比如一个 api/users/10 这样的路径，它会返回 10.

然后我使用 **array_key_exists** 检查是否存在一个 id 为 10 的用户

![](https://static.031130.xyz/uploads/2024/08/12/6577fd77c3d06.webp)

## 添加一个新用户

```php
case ($method == 'POST' && $uri == '/api/users'):
   header('Content-Type: application/json');
   $requestBody = json_decode(file_get_contents('php://input'), true);
   $name = $requestBody['name'];
   if (empty($name)) {
       http_response_code(404);
       echo json_encode(['error' => 'Please add name of the user']);
   }
   $users[] = $name;
   $data = json_encode($users, JSON_PRETTY_PRINT);
   file_put_contents($jsonFile, $data);
   echo json_encode(['message' => 'user added successfully']);
   break;
```

我使用 **file_get_contents('php://input')** 以获取请求的 body 部分。由于在这个例子中我使用的是 json，我将会解码 json 以便我可以获取到名字。

![](https://static.031130.xyz/uploads/2024/08/12/6577fdca88f76.webp)

## 更新一个用户

```php
case ($method == 'PUT' && preg_match('/\/api\/users\/[1-9]/', $uri)):
   header('Content-Type: application/json');
   // get the id
   $id = basename($uri);
   if (!array_key_exists($id, $users)) {
       http_response_code(404);
       echo json_encode(['error' => 'user does not exist']);
       break;
   }
   $requestBody = json_decode(file_get_contents('php://input'), true);
   $name = $requestBody['name'];
   if (empty($name)) {
       http_response_code(404);
       echo json_encode(['error' => 'Please add name of the user']);
   }
   $users[$id] = $name;
   $data = json_encode($users, JSON_PRETTY_PRINT);
   file_put_contents($jsonFile, $data);
   echo json_encode(['message' => 'user updated successfully']);
   break;
```

![](https://static.031130.xyz/uploads/2024/08/12/6577fdf646402.webp)

## 删除一个用户

```php
case ($method == 'DELETE' && preg_match('/\/api\/users\/[1-9]/', $uri)):
   header('Content-Type: application/json');
   // get the id
   $id = basename($uri);
   if (empty($users[$id])) {
       http_response_code(404);
       echo json_encode(['error' => 'user does not exist']);
       break;
   }
   unset($users[$id]);
   $data = json_encode($users, JSON_PRETTY_PRINT);
   file_put_contents($jsonFile, $data);
   echo json_encode(['message' => 'user deleted successfully']);
   break;
```

![](https://static.031130.xyz/uploads/2024/08/12/6577fe0c3a95b.webp)

## 最终文件

现在我们的 index.php 文件看起来是这样的

在 70 行左右的代码中，我们使用 PHP 创建了一个 RESTful API，很神奇吧？

```php
<?php
$jsonFile = 'users.json';
$data = file_get_contents($jsonFile);
$users = json_decode($data, true);
$uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];
switch ($method | $uri) {
   case ($method == 'GET' && $uri == '/api/users'):
       header('Content-Type: application/json');
       echo json_encode($users, JSON_PRETTY_PRINT);
       break;
   case ($method == 'GET' && preg_match('/\/api\/users\/[1-9]/', $uri)):
       header('Content-Type: application/json');
       $id = basename($uri);
       if (!array_key_exists($id, $users)) {
           http_response_code(404);
           echo json_encode(['error' => 'user does not exist']);
           break;
       }
       $responseData = [$id => $users[$id]];
       echo json_encode($responseData, JSON_PRETTY_PRINT);
       break;
   case ($method == 'POST' && $uri == '/api/users'):
       header('Content-Type: application/json');
       $requestBody = json_decode(file_get_contents('php://input'), true);
       $name = $requestBody['name'];
       if (empty($name)) {
           http_response_code(404);
           echo json_encode(['error' => 'Please add name of the user']);
       }
       $users[] = $name;
       $data = json_encode($users, JSON_PRETTY_PRINT);
       file_put_contents($jsonFile, $data);
       echo json_encode(['message' => 'user added successfully']);
       break;
   case ($method == 'PUT' && preg_match('/\/api\/users\/[1-9]/', $uri)):
       header('Content-Type: application/json');
       $id = basename($uri);
       if (!array_key_exists($id, $users)) {
           http_response_code(404);
           echo json_encode(['error' => 'user does not exist']);
           break;
       }
       $requestBody = json_decode(file_get_contents('php://input'), true);
       $name = $requestBody['name'];
       if (empty($name)) {
           http_response_code(404);
           echo json_encode(['error' => 'Please add name of the user']);
       }
       $users[$id] = $name;
       $data = json_encode($users, JSON_PRETTY_PRINT);
       file_put_contents($jsonFile, $data);
       echo json_encode(['message' => 'user updated successfully']);
       break;
   case ($method == 'DELETE' && preg_match('/\/api\/users\/[1-9]/', $uri)):
       header('Content-Type: application/json');
       $id = basename($uri);
       if (empty($users[$id])) {
           http_response_code(404);
           echo json_encode(['error' => 'user does not exist']);
           break;
       }
       unset($users[$id]);
       $data = json_encode($users, JSON_PRETTY_PRINT);
       file_put_contents($jsonFile, $data);
       echo json_encode(['message' => 'user deleted successfully']);
       break;
   default:
       http_response_code(404);
       echo json_encode(['error' => "We cannot find what you're looking for."]);
       break;
}
```

## 额外内容

在这种情况下，我不希望删除我的所有用户，所以我加了一个新的语句，如果只剩下最后一个用户，它将不会被删除，像这样
```php
if (sizeof($users) == 1){
   http_response_code(404);
   echo json_encode(['error' => 'there is only one user left. you cannot delete it!']);
   break;
}
```

## 源码

你可以在[原作者的 github](https://github.com/amirkamizi/php-simple-restful-api) 上看到完整注释的源代码以及 post man 集合

## 总结

现在你知道如何在 PHP 中创建一个简单的 RESTful API。

我推荐你打开一个 PHP 文件并复习所有的这些我们进行的步骤，并且像本文一样添加一些额外的资源

如果你有任何的建议、问题或者观点，请联系文章原作者，他期待着听到你的声音。

## 要点

- 不使用框架，用 PHP 创建一个 RESTful API
- 在 PHP 中使用优雅的 URL
- 处理请求的 body
- 使用 Json 文件作为你的数据库
- 使用多个变量作为 switch 的关键词
