if(!self.define){let e,i={};const d=(d,a)=>(d=new URL(d+".js",a).href,i[d]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=d,e.onload=i,document.head.appendChild(e)}else e=d,importScripts(d),i()})).then((()=>{let e=i[d];if(!e)throw new Error(`Module ${d} didn’t register its module`);return e})));self.define=(a,r)=>{const c=e||("document"in self?document.currentScript.src:"")||location.href;if(i[c])return;let n={};const l=e=>d(e,c),s={module:{uri:c},exports:n,require:l};i[c]=Promise.all(a.map((e=>s[e]||l(e)))).then((e=>(r(...e),n)))}}define(["./workbox-6da860f9"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"2020/03/03/set-proxy-for-cmd-under-windows/index.html",revision:"702940686289f6ff684c2556a0f76b07"},{url:"2020/07/11/china-mainland-mirrorlist/index.html",revision:"db85671bb34a01f255d73946c7c1c186"},{url:"2020/07/11/GitNotes/index.html",revision:"865bf1e73079283732edd237375f3275"},{url:"2020/07/11/RepoNotes/index.html",revision:"be0dff00c1c92ed1ac74e8ed414fdd0e"},{url:"2020/08/10/AndroidUnpack/index.html",revision:"3d1bbfe72ab42aa82df5e53dd1f8fc72"},{url:"2020/10/08/NoHello/index.html",revision:"8332247ccd72fff50c90dbb3ae34c20b"},{url:"2020/11/13/RomFlash_QA/index.html",revision:"e4bc925bec72deeea1c8c5ab1d2c09d0"},{url:"2020/12/19/Before-Report-A-Rom-Issue/index.html",revision:"74678551f057f27a73e026f5fc5b45ba"},{url:"2020/12/22/Did-UOS-have-Secure-Boot-Signature/index.html",revision:"81c0c1da65143f82772f754ab90de94c"},{url:"2021/01/01/Why-I-dont-recommend-Manjaro/index.html",revision:"8e132613a12064286a71c994693e8d02"},{url:"2021/01/20/python-virtualenv/index.html",revision:"d06ee319c044a0b9c650f03ae2ddbd7e"},{url:"2021/01/25/how-to-solve-the-adb-devices-unauthorized-problem/index.html",revision:"43d62fce9c672f24cb4639e469b2befa"},{url:"2021/02/07/extract-payload-dot-bin-on-archlinux/index.html",revision:"a9c00376cd24eb1b7dcabb436ddbee4d"},{url:"2021/02/27/change-your-firefox-icon-into-a-bluedoge/index.html",revision:"af2720c50cd97c4c5396c039e956d7f5"},{url:"2021/03/12/arch-source/index.html",revision:"dc34880e493f18eb40d5d3f36196b675"},{url:"2021/03/14/lets-fuck-dm-and-use-startx/index.html",revision:"695d396dfddb129b29bc46a85b43cb1e"},{url:"2021/04/04/yay-more/index.html",revision:"fbc6295589336d171c5b5429cfa9d21a"},{url:"2021/04/11/use-motrix-install-of-firefox-to-download/index.html",revision:"648411ad02611f9ce60f2a8cf3bf3031"},{url:"2021/04/13/where-will-appimage-put-its-file/index.html",revision:"69305661065c570c28700561ab867a2f"},{url:"2021/04/15/login-chromium-with-the-api-of-chrome/index.html",revision:"61898784f0025a320bafff352ea29356"},{url:"2021/04/16/fuck-jekyll-github-metadata-on-gitlab/index.html",revision:"49086dc006211c3513d9b91c13f63744"},{url:"2021/04/16/the-software-i-use-on-archlinux/index.html",revision:"a91539479cf2c68f5f07bb5017aa93f7"},{url:"2021/04/23/disable-firefox-nightmode-when-your-system-is-using-that/index.html",revision:"d59d7790fa3a7796c9e509188f783102"},{url:"2021/04/27/hide-simsun-from-deepin-wine-tim/index.html",revision:"02c39edaadfffff9ec1379c61c349109"},{url:"2021/05/21/create-a-random-picture-api-with-vercel/index.html",revision:"840b0ebb277d439f0e04d5c7833049e0"},{url:"2021/05/23/why-i-use-archlinux/index.html",revision:"9deee0bb5ade6a4f90c654629885dcd7"},{url:"2021/05/27/relieve-the-pressure-of-tuna-mirror-site-please/index.html",revision:"ee6c8c3629befe4faa1fe9898d2e805e"},{url:"2021/05/29/choose-the-last-archlinux-mirror-site-in-china/index.html",revision:"36b860bd78d36f2bf47f5ea912c9670b"},{url:"2021/05/30/share-xiaomi-bluetooth-mouse-on-both-windows-and-linux/index.html",revision:"a9e4b681b1355a0418e15ef2d2778701"},{url:"2021/06/06/download-openharmony-source-code/index.html",revision:"810d06b6b8b6ac8088ce7957239827ce"},{url:"2021/07/23/build-a-rpm-package-from-aur-with-archlinux/index.html",revision:"09535d4f9a7c717b36db2ec8b5e91562"},{url:"2021/09/05/wrong-fonts-color-fix-under-kde-with-a-dark-theme/index.html",revision:"b2556d7b4af934a95effca1e6eef4f9b"},{url:"2021/09/11/detailed-explanation-for-aur/index.html",revision:"218729132459503581dadc5d7d761d2c"},{url:"2021/09/21/csdn-copied-my-article/index.html",revision:"131c5ee7666f465b7995aef9577b65a4"},{url:"2021/10/01/bring-firefox-old-topbar-back/index.html",revision:"32474001da20c005431ae0c873984cec"},{url:"2021/10/02/nutstore-guide-on-archlinux-kde/index.html",revision:"61a0ac29bfbf24a40dc3a38fe1d3bd8d"},{url:"2021/10/21/picuploader-on-archlinux-with-caddy/index.html",revision:"5dce66f9ab25457c5b1589afe796d8ea"},{url:"2021/10/24/picuploader-with-kde-action/index.html",revision:"3ff48e9fcd4ae7a6bda231e9a1cd670c"},{url:"2021/10/31/waydroid-experience-on-kde/index.html",revision:"c5a9546c625b5e9a87fb5e02eddd4bc9"},{url:"2021/11/05/please-dont-theme-our-apps/index.html",revision:"0c4001136941714cd626e62cc1d08cb6"},{url:"2021/11/20/what-is-deepin-elf-verify/index.html",revision:"d49e643a574095bd781ee876e6c463bb"},{url:"2021/11/21/use-cloudflare-mirrors/index.html",revision:"dd7ed0e4b70f31b5fa0024f9491f8486"},{url:"2021/11/26/typora-and-me/index.html",revision:"f2e7f87868cd61a9539bc3a2b7deae4d"},{url:"2021/12/03/dev-app-update-in-wolai/index.html",revision:"ba798645cd9708ff5b6934d5ff2e3901"},{url:"2021/12/12/the-history-of-cutefish/index.html",revision:"2fef817c2dd31b63ece7562c6b03cdd9"},{url:"2022/01/01/pacman-gpgme-error-no-data/index.html",revision:"7167082c31aba33fc38c9c828e7d7b24"},{url:"2022/01/12/dnf-module-in-setting-up-the-jekyll/index.html",revision:"7b57d61c7c4b624a171b62960eafec50"},{url:"2022/01/19/the-common-software-hidden-in-mirrors/index.html",revision:"dfb15ee1f6c1ed0ca7bfef51e1fd4da1"},{url:"2022/02/07/how-to-package-a-git-rpm-package/index.html",revision:"1d6d30c529b649522310fdc1e7e90c0a"},{url:"2022/03/06/run-rpmbuild-with-github-action/index.html",revision:"417f7b25dd425306397022a0ea6e0604"},{url:"2022/03/31/upload-pic-to-lskypro-with-curl/index.html",revision:"3af3c30713579d1c9160bc98d061f264"},{url:"2022/04/14/fastocr-experience/index.html",revision:"148eac34c775f21a86054b6fca4cac87"},{url:"2022/05/11/setup-a-local-fedora-source/index.html",revision:"279e4fcc3bd4e9baa24f728cfc2a498d"},{url:"2022/05/30/use-caddy-to-proxy-wikipedia/index.html",revision:"027c278dda862d44f150dbaf7ba0c472"},{url:"2022/07/03/fcitx5-blinking-on-tg-under-wayland-kde/index.html",revision:"82c16423dd6d9a42fdcdf78bc447bb75"},{url:"2022/07/25/restore-the-sound-of-hollywood/index.html",revision:"9fc4bbbd37dc9887172d1c03e8132623"},{url:"2022/08/04/a-fucking-store-about-openssl3-and-nodejs16/index.html",revision:"9e8aa8977dfc12066a3543358612d433"},{url:"2022/08/10/add-sticker-support-for-element/index.html",revision:"de6f3a570e19b37b068ffcb9fd238baf"},{url:"404.html",revision:"42dec79dc83b0554d436d0bdf84a2dcc"},{url:"about/index.html",revision:"698c2a650106373a4f77f705f25e0e9d"},{url:"archives/2020/03/index.html",revision:"671936faae8e94336f67772d85488a1f"},{url:"archives/2020/07/index.html",revision:"5b327288723fdfdc30d8ee41f4281060"},{url:"archives/2020/08/index.html",revision:"c0d9d27a356a7d751d287ca2bf3377c4"},{url:"archives/2020/10/index.html",revision:"a4c2daa4bc693a1ebc25c9775b07a370"},{url:"archives/2020/11/index.html",revision:"842a8219237df5a8a3f37975653b0974"},{url:"archives/2020/12/index.html",revision:"a30f2be180f5b27c87f251928326d3f8"},{url:"archives/2020/index.html",revision:"7ba860a949822fad2ddb0053242512c6"},{url:"archives/2021/01/index.html",revision:"e90e9ce474b0c06f120e4d75a0251b91"},{url:"archives/2021/02/index.html",revision:"b06cc1f5e2b06edeacfa1efebf429438"},{url:"archives/2021/03/index.html",revision:"1e13c4a519870be07a8367c0bbeb8531"},{url:"archives/2021/04/index.html",revision:"bf0f8f9bbb5fa30e7623676b95ebc028"},{url:"archives/2021/05/index.html",revision:"94bb5134ba1cf59d7ca6eb81182ce864"},{url:"archives/2021/06/index.html",revision:"448fb8e10985fbe7582775b318e2a295"},{url:"archives/2021/07/index.html",revision:"da8c65b03618ac8e4d98b72363a1bb0d"},{url:"archives/2021/09/index.html",revision:"0a1a019098455136f21c92a49939ecf6"},{url:"archives/2021/10/index.html",revision:"826175866f172fb558670599bb07c5f9"},{url:"archives/2021/11/index.html",revision:"f5b9f6e98e0ac0e3872a36c502803167"},{url:"archives/2021/12/index.html",revision:"7785c2850bb0abbf48e48969c2a35e57"},{url:"archives/2021/index.html",revision:"59900e0423dacb225c7ae246ec79870e"},{url:"archives/2021/page/2/index.html",revision:"32565119a269862ba2a9019c8c3fa88d"},{url:"archives/2021/page/3/index.html",revision:"9e508805e070df633e3df1fb8ec99312"},{url:"archives/2021/page/4/index.html",revision:"a5fc9eb65fa7af6b3dce5cfd23730e2e"},{url:"archives/2022/01/index.html",revision:"1eba13fc72d921c02be1a9c22a9cbd99"},{url:"archives/2022/02/index.html",revision:"e218196384a7c729add752a38254ce85"},{url:"archives/2022/03/index.html",revision:"14d71e4cbbb20f627730fa1b0f27cabc"},{url:"archives/2022/04/index.html",revision:"8e35b183f4bbd2fa6ae4dc8414973f5c"},{url:"archives/2022/05/index.html",revision:"bd62a76c7122fe88d77d74d29d614276"},{url:"archives/2022/07/index.html",revision:"11f7627a2a461159c35df4dd989f8419"},{url:"archives/2022/08/index.html",revision:"5d62f781b23e8c299259c673222591d6"},{url:"archives/2022/index.html",revision:"6bc14c538e352a7b1b3da495a9e6087a"},{url:"archives/2022/page/2/index.html",revision:"b4f92d44278ba4e16e61c9b42724c974"},{url:"archives/index.html",revision:"fabd77edd0e3442984432db13f376a6c"},{url:"archives/page/2/index.html",revision:"5d0c989a222e212cf581af19ac0620a7"},{url:"archives/page/3/index.html",revision:"d7f5f9204d51baa93be149c4547a8d50"},{url:"archives/page/4/index.html",revision:"9f50c81c2bbecb60bb0a92c435bd40a0"},{url:"archives/page/5/index.html",revision:"1ccc5585fb2c19975aee8049746545fe"},{url:"archives/page/6/index.html",revision:"7f2d1f5d4b94cfd19e0488cdce0e49c7"},{url:"collections/index.html",revision:"049ce96848f95d88c289ac2be10abf63"},{url:"css/first.css",revision:"e2f7ec33a8049ad3908690225d20f146"},{url:"css/Readme.html",revision:"67a0194faa4ec902e15d51fea75556bd"},{url:"css/style.4c370c51.css",revision:"4c370c519f0a483c363ba465010e6324"},{url:"index.html",revision:"50e0449fc9dc3fe588679d22094bbd5a"},{url:"js/app.af2d54c8.js",revision:"af2d54c8bf1bde36cc35777647f0e7bd"},{url:"js/plugins/aplayer.js",revision:"dbe5eea968969672c52022ed895192a0"},{url:"js/plugins/parallax.js",revision:"8bf0ab10d50243ae87016af576642cdc"},{url:"js/plugins/rightMenu.js",revision:"d9437285263079b1158df42384235b71"},{url:"js/plugins/rightMenus.js",revision:"1aa99ff13016d89c3e759ebc7eda395e"},{url:"js/plugins/tags/contributors.js",revision:"aec8045335d2753a39a48c34fb019662"},{url:"js/plugins/tags/friends.js",revision:"f372da57b83083859f60ce19b736a695"},{url:"js/plugins/tags/sites.js",revision:"76bf19b80414fbce774acddabf6b1d3e"},{url:"js/search/hexo.js",revision:"0e52f22209d509c1fb48fc490396c1de"},{url:"links/index.html",revision:"47332264e14149db53a8f9f509293c82"},{url:"linux-source/index.html",revision:"5dac730094be7213aa31165fd775d6a2"},{url:"page/2/index.html",revision:"2f219ca3f2d51b05178e785d64cc10a1"},{url:"page/3/index.html",revision:"d8f72dadff0812b6abd47c72662ebb92"},{url:"page/4/index.html",revision:"b76b7d7488f0d2da5235eaa34096fcac"},{url:"page/5/index.html",revision:"882753cc1138e55caf8d06d1e622ae14"},{url:"page/6/index.html",revision:"79bee186df29e1a1b992ee6db9032468"},{url:"tags/Android/index.html",revision:"5f7249445f93d303e9406bb7c7c65b88"},{url:"tags/Archlinux/index.html",revision:"cf5dc941dc965d2338cd0b35336bbfbf"},{url:"tags/Archlinux/page/2/index.html",revision:"46dacfdabffb1a7c1044b861cde3b137"},{url:"tags/Bwrap/index.html",revision:"32017462186a21a97be1a2d008950f73"},{url:"tags/Caddy/index.html",revision:"10047ed5d128a5e41731e2568ecc55ac"},{url:"tags/Casual-Talk/index.html",revision:"8ed043f86ae218a46075cd613bcb2c68"},{url:"tags/deepin/index.html",revision:"fc0dd2a4594cf509b9c4f60b24f386ed"},{url:"tags/electron/index.html",revision:"60b1cfdf63fc915d84cd3340771fc7fe"},{url:"tags/Experience/index.html",revision:"49f77dac3c1fe6ebf2ec35310be6f8af"},{url:"tags/Fedora/index.html",revision:"de5d1ddb38bd5f04260f8c7f1a7303f8"},{url:"tags/Firefox/index.html",revision:"69bd3b9a2656871b4dcf310a166fb15b"},{url:"tags/Fun/index.html",revision:"f253fe6272d79640c4cbcda5a5a5e133"},{url:"tags/index.html",revision:"23e67b919ae410f0cd897afd7d448c00"},{url:"tags/KDE/index.html",revision:"f7a8f323e2187cc0b48acee75366b1cb"},{url:"tags/Linux/index.html",revision:"3ac15482e76b0c9d7fc5e65473e5c58f"},{url:"tags/Linux/page/2/index.html",revision:"49ebe940abb825a80f4db000c39455df"},{url:"tags/Lsky-Pro/index.html",revision:"dd583d9aa644d08346cfac9073873c89"},{url:"tags/nodejs/index.html",revision:"7dab0509655ab894e0c002f98d7c1ae6"},{url:"tags/OpenSource-Project/index.html",revision:"c084d5f97024b96e6a8e13f7fb5198b5"},{url:"tags/openssl/index.html",revision:"9d0687601563ec3c1b32fee171fead04"},{url:"tags/PicUploader/index.html",revision:"4dbb71cd7dfee7f1527cbadb8c7ced04"},{url:"tags/Python/index.html",revision:"e246bf22aae7764a53a76d60a7676a13"},{url:"tags/Rom/index.html",revision:"dfd42a3023bee66f206f512de5a8f477"},{url:"tags/Rom编译/index.html",revision:"9578a4ba440ea6d976705966d355a7b1"},{url:"tags/RPM-Package/index.html",revision:"bfffd623a82f4ba8f0b096f6f58439bd"},{url:"tags/Shell-Script/index.html",revision:"ed27691d3d61124e9388b0e3fd71ce9c"},{url:"tags/Waydroid/index.html",revision:"6da690ef49639cbf933185c923629b45"},{url:"tags/Windows/index.html",revision:"7d9a44bc5dab72a3f5727b4189d5e9c2"},{url:"tags/图床/index.html",revision:"8a228b9d2423b1cab76105510109c583"},{url:"tags/大佬对话笔记/index.html",revision:"0e086e66419e643ce55943d374e18270"},{url:"tags/笔记/index.html",revision:"94efd20d437d5f3ddeb142f410a0d798"},{url:"tags/网络/index.html",revision:"2035381d34df4a8fd69e135b36d85180"},{url:"tags/翻译/index.html",revision:"f8a1017b51d643648955a319b95d917e"},{url:"tags/镜像站/index.html",revision:"80694aeab3503efa358adbe0968d3781"}],{})}));
//# sourceMappingURL=service-worker.js.map