---
title: "Mainland China Xiaomi FCM Screen-Off Disconnection: Attempts and Possible Solutions in a Rootless Environment"
date: 2026-02-20
sticky:
tags:
- Android
- Network
- Hardware
---

In November last year, I got a new mainland China version Xiaomi 15 as my daily driver. Actually, my previous Redmi K70 Ultra was released in the same year as this Xiaomi 15, and performance-wise they're comparable. However, during my Gap Year while traveling across the country, I realized it was a shame not being able to capture the night scenes I encountered, so I wanted to switch to a phone with better camera capabilities. The newly released Xiaomi 17 was at a premium price point, and didn't offer significant improvements over the 15, so I went directly for the Xiaomi 15.

After getting it, I followed my usual habits and enabled "Google Base Services" in settings, installed "Google Play" and started using it normally. But over these past few months, I discovered that my FCM push notifications—whether Outlook email notifications or a certain instant messaging app that looks like a paper airplane—never seemed to work properly from the start. Their notifications would occasionally pop up suddenly after I unlocked my phone, but more often they just disappeared. I would only receive the backlogged notifications when I manually opened the corresponding apps.

Recently I received an offer from an overseas university and will be going abroad in September to pursue a master's degree, so I wanted to resolve this issue before leaving the country. After all, when living in China, most apps can push messages to me through MiPush, and these FCM-dependent apps weren't my most frequently used ones. I could just open them manually when I woke up each day to receive notifications. Even if my message response time wasn't great, it wasn't a big deal—if there was something urgent, my family and friends knew other ways to reach me faster. But once abroad, FCM push notifications become critically important, so I need to fix this issue quickly, or I'll have to consider switching phones.

## Test Environment

- Xiaomi 15 mainland China version, 16GB + 512GB, HyperOS 3.0.7.0.WOCCNXM, the latest version as of this writing
- "Google Base Services" enabled, "Google Play" installed
- Connected to WiFi, with WiFi-routed data exit IP in 🇺🇸 Los Angeles
- MIUI optimization not disabled

## Getting FCM Running First

I needed to first resolve the issue of FCM not receiving messages even when the screen is on. In the "Phone" app's dialer, entering `*#*#426#*#*` opens the FCM Diagnostics interface, which contains logs about FCM connection status.

![Dialer Input](https://static.031130.xyz/uploads/2026/02/20/6202d116db231.webp)
![FCM Diagnostics Interface](https://static.031130.xyz/uploads/2026/02/20/432922f339849.webp)

In this interface, I found that FCM's connection status was actually normal, with no obvious error messages in the logs. So I started suspecting that some of HyperOS's power-saving mechanisms were interfering with FCM's normal operation in the background. Through some searching on Xiaohongshu (Little Red Book), I discovered that enabling "Autostart" permission for apps requiring FCM push in the settings interface, and setting battery optimization to "Don't optimize," seemed to solve this problem.

![App Settings Interface](https://static.031130.xyz/uploads/2026/02/20/8c20be931764b.webp)

Testing with an IM app (sending messages from one account to another), I found that with the screen on, FCM could now receive messages normally even when the app was closed in the background.

## The Problem of FCM Disconnecting One Minute After Screen-Off

However, after turning off the screen and leaving it idle for a minute, FCM stopped working completely. Whether email notifications or IM messages, none could be pushed to the phone via FCM. Only when I lit up the screen would the backlogged notifications suddenly appear. Checking the FCM Diagnostics interface again, FCM's connection status was either disconnected or had just connected for a few seconds. This indicates that in the lock screen state, FCM's connection gets terminated by the system, preventing message reception.

PS: I discovered that when charging, even with the phone locked, FCM maintains its connection and receives messages normally. This further confirms that HyperOS's power-saving mechanisms are interfering with FCM's normal operation.

## Possible Solutions

After searching on Xiaohongshu and Xiaolüshu (CoolApk), I found some attempts and solutions from others:

### 1. Disable MIUI Optimization

This is my least favorite solution, because MIUI optimization is actually an important reason why I like HyperOS (MIUI). After disabling MIUI optimization, I found that the remaining battery percentage information can't be displayed inside the status bar battery icon—it must appear to the right of the battery icon. This is a huge waste of status bar space after HyperOS introduced the Super Island (Dynamic Island). Of course, there are other features that would be affected, but this is what I care about most.

Additionally, in HyperOS 3's developer mode, the "Disable MIUI optimization" option can no longer be found, though some users report you can make this option reappear through methods like resetting settings status, but I don't think this is a good solution.

### 2. Freeze "Battery & Performance" App or Replace with International Version

On HyperOS 2, some users reported that tampering with the "Battery & Performance" system app could solve the FCM screen-off disconnection problem. I tried using adb shell to freeze it, but after testing, this wasn't a useful solution, and it might cause some system scheduling anomalies. **Also, don't enter ultra power saving mode, because that mode's UI is provided by the "Battery & Performance" app!!**

The adb command is as follows:

```bash
adb shell pm uninstall --user 0 com.miui.powerkeeper
```

If you want to restore it, you can reinstall this app with the following command:

```bash
adb shell cmd package install-existing com.miui.powerkeeper
```

Some people also reported that replacing it with the international version of the "Battery & Performance" app could solve this problem, but I couldn't find the installation package for the HyperOS 3 international version's "Battery & Performance" app. After downloading and unpacking the complete ROM for the Xiaomi 15 overseas version, that app's apk couldn't be directly updated or installed via adb either.

![Update Failed](https://static.031130.xyz/uploads/2026/02/20/58ba6ce88ef49.webp)

### 3. Use [fcmfix](https://github.com/kooritea/fcmfix) and Other Xposed Modules After Unlocking Bootloader

This solution is... forget it. Although I have a level 5 account on the Xiaomi community, I don't have the energy to participate in the "Xiaomi entrance exam" (I heard it's been suspended anyway). Moreover, after unlocking the bootloader, I might face a series of problems like payment apps not working. If I wanted to cover up related traces, I'd have to go through more hassle—it feels like more trouble than it's worth.

### 4. Use [HeartbeatFixerForGCM](https://github.com/shaobin0604/HeartbeatFixerForGCM)

This software has been removed from Google Play and hasn't been updated in a long time. Testing shows it cannot prevent FCM from being disconnected by the system in lock screen state on HyperOS 3.

### 5. Use Gboard to Keep FCM Alive

Although I don't know the principle, some users reported that installing Gboard keyboard allows FCM to maintain its connection and receive messages normally in lock screen state. I tried it too, and indeed after installing Gboard and setting it as the default input method, FCM could maintain its connection in lock screen state.

However, this solution isn't perfect either. After all, I don't like Gboard's input experience, so I can't really accept this solution.

## Some Personal Experiments

Although I don't have much experience with Android development—only touching it during a sophomore year course project—the AI era has given me the ability to do vibe coding.

![Attempting to use vibe coding to modify source code and compile](https://static.031130.xyz/uploads/2026/02/20/51db4ed4ef15b.webp)

So I also had AI modify some logic for keeping FCM alive based on HeartbeatFixerForGCM's open-source code, roughly following these approaches:

- Input Method Keep-Alive: Continuing Gboard's approach, using the persistent nature of input method services to maintain FCM connection. It could keep FCM alive, but lost the input capability of the input method—pass.
- Notification Listening: NotificationListener as a system listening role to increase persistence probability—no success, pass.
- Foreground Service: Persistent notification + FGS to elevate process survival priority—no success, pass.
- Accessibility Keep-Alive: Accessibility service also as a system listening role to increase persistence probability—no success, pass.
- VPN Keep-Alive: Using VPN service's persistent nature to maintain FCM connection. Don't know if it has any effect, ~~but it did manage to disconnect my phone's network~~—pass.

In short, none of these attempts succeeded. FCM still gets disconnected by the system in lock screen state.

## Seems Like I Found a Viable Solution?

Just when I was at my wit's end and ready to shop for another phone, I saw a Xiaohongshu post mentioning that you could first uninstall updates to "Google Play Services," then update it again to the latest version. The poster's explanation was to first uninstall the mainland-optimized Play Services, then install an un-optimized version from the Play Store, which could solve this problem.

Although you can't directly find the "Google Play Services" app on the Play Store, you can search for "Google Play Services" using your phone's browser, click the link from google.com, and it will automatically jump to the "Google Play Services" app page on the Play Store. You can also click [here](https://play.google.com/store/apps/details?id=com.google.android.gms) directly.

I tried it too, and indeed after uninstalling updates to "Google Play Services," FCM could maintain its connection in lock screen state. Although this solution sounds a bit mystical and I can't see the actual principle at work, since it was effective, I didn't dwell on it.

But just when I thought the problem was solved, while writing this article, I tried restarting my phone and found the problem had returned. And after restarting, repeating the above steps of uninstalling updates to "Google Play Services" still didn't solve the problem. This troubled me greatly, so I started recalling the previous operation steps, but I could never reproduce the previous state...

## Wait, There Seems to Be a Fallback

While discussing this issue with a [seasoned Android enthusiast](https://github.com/Rurikobaka/), he pointed out that mainland OS indeed disconnects FCM's long connection after screen-off to save power, but still maintains a periodic check mechanism. This seems to match some isolated cases I encountered during testing. This periodic check interval is quite long—according to his estimate, around 10-20 minutes. I also conducted a round of testing myself. The process was:

1. Screen off for one minute, use secondary account to send message to main account, wait 6 minutes until main account receives the message, notified by my Xiaomi band's vibration that the message arrived.
2. Immediately use secondary account to send another message to main account, wait for main account to receive the second message, record the time difference between the two messages.

Because the time interval is quite long, I only tested one and a half rounds. The first round's time difference was 28 minutes, and the second round's time difference reached 38 minutes.

Conclusion: **In screen-off state, although FCM's connection gets disconnected by the system, the system will automatically wake up FCM approximately every 30 minutes (inaccurate data) to check for new messages. If there are any, you'll receive notifications.**

## Conclusion

Currently, to receive FCM push notifications on mainland China version Xiaomi phones, you can only choose between using Gboard + real-time push / periodic check mechanism fallback.

The former uses Gboard input method's persistent nature to maintain FCM connection, enabling real-time message reception in screen-off state, but requires sacrificing input experience; the latter uses system periodic FCM wake-ups to check for new messages. While not requiring sacrifice of input experience, there may be delays exceeding half an hour.

## References

- [【HyperOS】修復小米陸版通知推送 - Mobile01](https://www.mobile01.com/topicdetail.php?f=634&t=6892724)
- [如何解决原生 Android 续航问题？ - V2EX](https://www.v2ex.com/t/993090)
- [小米 15/hyperOS 2.0 打开 FCM 通知 - V2EX](https://staging.v2ex.com/t/1089681)
- [海外不建議購買內地版小米手機 因為一鎖屏就斷連 FCM， 導致海外 App 收不到消息推送。 亮屏後 FCM，會嘗試重連。 重連成功，才能收到通知。 已開自啟動，電池無限制。 有什麼解決辦法？ 香港澳門| salmon0105](https://www.threads.com/@silicon.salmon/post/DDR_SD8y3Gp)
- [shaobin0604/HeartbeatFixerForGCM: Tiny application to fix GCM push notification delay issue](https://github.com/shaobin0604/HeartbeatFixerForGCM)
- [kooritea/fcmfix: [xposed]让fcm唤醒已完全停止的应用](https://github.com/kooritea/fcmfix)
- Various discussions and feedback on social platforms like Xiaohongshu and CoolApk. Since the content is rather scattered and unsystematic, I won't list them all here. Interested readers can search for relevant keywords to view them.
