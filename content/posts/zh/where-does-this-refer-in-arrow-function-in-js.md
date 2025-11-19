---
title: 在 JavaScript 中，箭头函数中的 this 指针到底指向哪里？
date: 2024-01-14 02:50:03
sticky:
tags:
- JavaScript
---

这学期期末复习的时候，学校里负责上 JavaScript 的老师给我们提出了一个问题。下面这段代码中，`a.u2()` 在 ES Module 下执行会抛出 TypeError 的异常，在 CommonJS 下运行则会输出 undefined，而 B 这个类的 u2 函数则能够在对象实例化以后正常运行。

```javascript
const a = {
    x: 3,
    u1: function () {
        console.log(this.x)
    },
    u2: () => {
        console.log(this.x)
    }
}

class b {
    x = 3

    u1 = function () {
        console.log(this.x)
    }

    u2 = () => {
        console.log(this.x)
    }
}

a.u1()
// 3
a.u2()
// undefined

new b().u1()
// 3
new b().u2()
// 3
```

这个问题涉及到 JavaScript 中箭头函数的作用域以及 this 指向。

**在 JS 中使用 function 关键字定义的普通函数中，this 指针遵循一个规则：谁调用指向谁。**即 `obj.func()` 这种调用情况下，func 方法内部的this指向obj；如果没有调用者，则严格模式下 this 为 undefined，非严格模式下 this 指向window(浏览器)或者global(node环境)。

而箭头函数比较特殊，**箭头函数的 this 在定义时就被绑定，绑定的是定义时所在作用域中的 this。**

在老师给的示例代码中，第一行定义了 a 这个对象字面量，而**定义对象字面量不会创建新的作用域**，因此 a 中定义的 u2 的 this 指向的是全局对象。因此在 Es Module 默认启用 strict mode 的情况下，全局对象的 this 指向 undefined，进而导致 a 的 u2 内 this 也指向 undefined，this.x 就抛了 TypeError；而在 **CommonJS 未启用 strict mode 的情况下，全局对象的 this 指向全局对象**，因而 u2 内的 this 也指向全局对象，因此 this 存在，this.x 就不会抛 TypeError，只会报 undefined。

而 B 类在对象初始化阶段拥有一个新的作用域，因此箭头函数的 this 能够正确指向 B 被实例化出来的对象，因此也就能够正确读取到 this.x 的值。

理论上来说，我们可以给全局对象也赋一个不一样的 x 值，这样 a.u2() 就能够读取到全局对象中的 x 值，验证我们的结论。

在浏览器中，可以在代码的头部加一行 `var x = 10` 或者 `window.x = 10`，可以看到a.u2() 顺利的输出了 10，验证了我的结论。

![浏览器控制台调试](https://static.031130.xyz/uploads/2024/08/12/65a2e1d093b78.webp)

但在 Node.js 中，直接使用 `var x = 10` 或者 `global.x = 10` 并不能达到我们想要的效果。因为Node.js 中的每个 CommonJS 模块都有其自己的模块作用域，即模块的顶层作用域不是全局作用域。在模块内部，`this` 关键字不是指向 `global` 对象，而是指向模块的导出对象。这是为了确保模块内部的作用域隔离和模块的封装性。

那么我们可以通过为模块的导出对象添加一个 x 属性来验证我们的结论，我们可以使用 `exports.x = 10` 来为模块的顶层作用域添加一个值为 10 的 x 属性。

![nodejs 环境运行](https://static.031130.xyz/uploads/2024/08/12/65a2e379ba89e.webp)

## 参考文章

[箭头函数表达式 - JavaScript | MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/Arrow_functions)

[ES6箭头函数作用域的问题](https://segmentfault.com/q/1010000022948115)

[ES6箭头函数的this指向详解](https://www.zhihu.com/tardis/zm/art/57204184)
