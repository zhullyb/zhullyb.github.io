---
title: 【翻译】请别再使用主题装饰我们的软件
date: 2021-11-05 20:35:58
sticky:
tags:
- 翻译
---

*标题中的「我们」当然不是我自己，这是一封来自GNOME开发者针对广大GNOME社区开发者的一封公开信。看着挺有意思的，其中也透露出了GNOME的设计理念，我在这里尽力将其不掺杂个人情感地翻译完。原文可以查看这里: [https://stopthemingmy.app/](https://stopthemingmy.app/)*

---

 请从头到尾阅读这封信。

 这份信针对的是那些在默认设置下使用第三方主题破坏软件体验的发行版，而不是那些试图使用第三方主题美化自己桌面的用户。（原文中出现的是tinkerers，意为修补匠）

我们是 GNOME 平台的应用开发者与设计者，我们为自己的成果感到自豪，并努力确保我们的应用能够为人们提供良好的体验。

然而不幸的是，在许多情况下，我们所有在软件的设计、开发、测试上所做出努力都因为第三方主题而变得徒劳无功。

![<font size="5"<bGTK样式</b可以使得软件外观看上去不协调、甚至使得软件无法使用</font](https://stopthemingmy.app/assets/stylesheets.png)

![<font size="5"<b图表包</b可以改变图标的含义，使得显示的图标无法准确的表达开发者的意思。</font](https://stopthemingmy.app/assets/iconthemes.png)



![<font size="5"<b应用图标</b是一个软件身份的象征。改变一个软件的图标剥夺了开发者控制其品牌的可能性</font](https://stopthemingmy.app/assets/appicons.png)

*注: 这些例子纯粹只是用于说明问题，并不针对个别主题。所以，主题开发者们别多想。❤️*

当然，还有些不那么直接的后果，包括: 

- 在GNOME软件中心或Flathub 中使用的截图( **Appstream Screenshots** )中的UI会和你实际安装以后的UI看上去完全不同，这使得这些截图失去了原有的意义。

- 如果系统的UI元素和用户帮助文档中出现的元素不同，用户帮助文档将会极大地丢失原有意义。

这些博客文章更详细地解释了主题化的一些问题：

- GTK Stylesheets — [Restyling apps at scale](https://blogs.gnome.org/tbernard/2018/10/15/restyling-apps-at-scale)

- App Icons — [Linux Themes & Third-Party Icons](https://samuelhewitt.com/blog/2017-11-26-linux-themes-third-party-icons)

**这就是为什么我们心平气和地要求我们的软件不要被主题化。** 它们是被上游所使用的（即默认的） GNOME 样式表、图标和字体 所构建和测试的，因此它们在用户的系统上应该是原汁原味的。

虽然我们可以直接在我们的应用程序中禁用主题，但我们不想这么做。 我们认为技术性的解决方案可能不会有效，因为这不是技术问题。

在技术上，我们希望软件可以在没有人工干预的情况下被自动地重新设计，但这到目前为止仍然是个幻想。在这种技术现状被改善之前，这种（应用被主题搞炸）的情况几乎不可能被解决。因此，我们正试图通过这封信向大家告知这种情况，并尽自己的一份力量。 

**如果你想要美化你自己的系统，我们没有意见**。然而，如果你改变了诸如图标、样式表等东西，你应当意识到你的行为不会得到支持（应该是指不会得到社区的帮助）。您遇到的任何问题都应直接报告给主题开发者，而不是软件开发者。

作为一个平台，**我们坚信GTK应当停止强制默认在所有软件使用同一个样式表**（也就是说应该可以为不同的软件指定不同的GTK样式）。应用程序不必通过把样式表写死来避免这种情况，而是应该使用平台样式表（系统提供的样式表），除非他们魔改了样式表以加入其他内容。 我们意识到这是一个复杂的问题，但假设每个应用程序都适用于每个样式表同样也是一个糟糕的默认设置。 

**如果你是更改了系统样式表和图标的发行版的开发人员，希望你重新考虑此决定**。 在没有任何 QA 的情况下更改第三方应用程序是鲁莽的，并且在任何其他平台上都是不可接受的。 您的行为对我们这些应用程序开发人员造成了很大的伤害，并且正在损害除了您的发行版以外的整个软件生态。

我们理解发行版需要脱颖而出来吸引用户。但是，我们敦促您想办法在不剥夺我们代理权的情况下做到这一点。 我们厌倦了当人们告诉我们「这个主题魔改得还不错」时，我们必须为我们从未打算支持的设置做额外的工作。你绝对不会对 Blender、Atom、Telegram 或其他第三方应用程序做出这样的魔改。我们的应用程序使用 GTK 并不意味着我们可以接受别人对它们的魔改。

由于你要使用 GNOME 平台开发，我们预设「你希望这个软件生态是健康的」。如果现实确实如此，我们要求您停止使用主题装饰我们的软件的这一行为。



署名,

- **Alexander Mikhaylenko** 
   Maintainer of [Games](https://gitlab.gnome.org/GNOME/gnome-games)
- **Avi Wadhwa** 
   Maintainer of [Organizer](https://gitlab.gnome.org/aviwad/organizer)
- **Bilal Elmoussaoui** 
   Maintainer of [Authenticator](https://gitlab.gnome.org/World/Authenticator), [Icon Library](https://gitlab.gnome.org/World/design/icon-library), [Contrast](https://gitlab.gnome.org/World/design/contrast) and [Obfuscate](https://gitlab.gnome.org/World/obfuscate)
- **Cédric Bellegarde** 
   Maintainer of [Lollypop](https://gitlab.gnome.org/World/lollypop), [Eolie](https://gitlab.gnome.org/World/eolie), and [Passbook](https://gitlab.gnome.org/gnumdk/passbook)
- **Christopher Davis** 
   Core contributor to [Fractal](https://gitlab.gnome.org/GNOME/Fractal)
- **Daniel García Moreno** 
   Maintainer of [Fractal](https://gitlab.gnome.org/GNOME/Fractal) and [Timetrack](https://gitlab.gnome.org/danigm/timetrack)
- **Falk Alexander Seidl** 
   Maintainer of [Password Safe](https://gitlab.gnome.org/World/PasswordSafe)
- **Felix Häcker**, 
   Maintainer of [Gradio/Shortwave](https://gitlab.gnome.org/World/Shortwave), [Fragments](https://gitlab.gnome.org/World/Fragments), and [Remotely](https://gitlab.gnome.org/World/Remotely)
- **Forever XML** 
   Maintainer of [Random](https://codeberg.org/foreverxml/random)
- **Jan Lukas Gernert** 
   Author of [FeedReader](https://jangernert.github.io/FeedReader/) and [NewsFlash](https://gitlab.com/news-flash)
- **Jordan Petridis** 
   Maintainer of [Podcasts](https://gitlab.gnome.org/World/podcasts)
- **Julian Sparber** 
   Core contributor to [Fractal](https://gitlab.gnome.org/GNOME/Fractal), maintainer of [Teleport](https://gitlab.gnome.org/jsparber/teleport)
- **Lains** 
   Maintainer of [Notejot](https://github.com/lainsce/notejot), [Khronos](https://github.com/lainsce/khronos), [Dot Matrix](https://github.com/lainsce/dot-matrix), [Quilter](https://github.com/lainsce/quilter), and [Emulsion](https://github.com/lainsce/emulsion)
- **Manuel Genovés** 
   Maintainer of [UberWriter](https://github.com/UberWriter/uberwriter)
- **Maximiliano Sandoval** 
   Maintainer of [Decoder](https://gitlab.gnome.org/World/decoder) and [Lorem](https://gitlab.gnome.org/World/design/lorem), core contributor to [Password Safe](https://gitlab.gnome.org/World/PasswordSafe)
- **Michael Gratton** 
   Maintainer of [Geary](https://gitlab.gnome.org/GNOME/Geary)
- **Rafael Mardojai C.M.** 
   Maintainer of [Blanket](https://github.com/rafaelmardojai/blanket), [Dialect](https://github.com/dialect-app/dialect), [Share Preview](https://github.com/rafaelmardojai/share-preview) and [Webfont Kit Generator](https://github.com/rafaelmardojai/webfont-kit-generator)
- **Sophie Herold** 
   Maintainer of [Pika Backup](https://apps.gnome.org/app/org.gnome.World.PikaBackup/)
- **Tobias Bernard** 
   Designer of [Fragments](https://gitlab.gnome.org/World/Fragments) and [Podcasts](https://gitlab.gnome.org/World/podcasts) (among others)
- **Zander Brown** 
   Maintainer of [Icon Preview](https://gitlab.gnome.org/World/design/icon-preview)
- **The [Bottles](https://usebottles.com) Developers**
- **The [Pitivi](https://pitivi.org) Developers**

*Note: Even though some of us are Foundation  members or work on GNOME, these are our personal views as individuals,  and not those of the GNOME Project, the GNOME Foundation, or our  employers.*

