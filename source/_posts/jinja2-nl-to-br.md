---
title: jinja2 中如何优雅地实现换行
date: 2023-09-03 13:37:35
sticky:
execrpt:
tags:
- Linux
- Python
- jinja2
- CSS
---

在使用 python 的 jinja2 模板引擎生成 html 的时候，会遇到 `\n` 换行符无法被正常换行的问题。我本能的想法就是将 `\n` 替换成 html 标签 \<br />，但失败了，jinja2 有自动转义的功能，直接将标签原模原样地渲染了出来，并没有生效。而为这一段代码块关闭自动转义则会有被 js 注入的风险，因此这也不是上策。

在 jinja2 的官方文档中，提出了使用 filter 的方案。也就是说，filter 将 `\n` 识别出来，并自动替换成 \<br /> 标签，并且使用 Markup 函数将这一段 html 文本标记成安全且无需转义的。见: https://jinja.palletsprojects.com/en/3.1.x/api/#custom-filters

> ```python
> import re
> from jinja2 import pass_eval_context
> from markupsafe import Markup, escape
> 
> @pass_eval_context
> def nl2br(eval_ctx, value):
>     br = "<br>\n"
> 
>     if eval_ctx.autoescape:
>         value = escape(value)
>         br = Markup(br)
> 
>     result = "\n\n".join(
>         f"<p>{br.join(p.splitlines())}<\p>"
>         for p in re.split(r"(?:\r\n|\r(?!\n)|\n){2,}", value)
>     )
>     return Markup(result) if autoescape else result
> ```

使用这段代码后，我遇到了连续两个换行符被识别成一个换行符的问题，依然不满意。

在 [issue#2628](https://github.com/pallets/flask/issues/2628) 中，我找到了一个相对优雅的解决方案——使用 css 样式来完成这个任务。

通过设置 `white-space: pre-line;` 的 css 样式，html 在被渲染时将会不再忽略换行符，浏览器就能够在没有 br 标签标注的情况下实现自动换行。而如果设置为 `white-space: pre-wrap;` 则多个空格将不会再被合并成一个空格，直接治好了我在入门 html 时的各种不适。

此外，通过 `word-break: break-word;` 的 css 样式可以实现只有当一个单词一整行都显示不下时，才会拆分换行该单词的效果，可以避免 break-all 拆分所有单词或者 normal 时遇到长单词直接元素溢出的问题。
