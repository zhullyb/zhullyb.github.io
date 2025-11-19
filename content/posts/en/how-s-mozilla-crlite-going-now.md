---
title: 'Post-OCSP Era: How Browsers Address New Certificate Revocation Challenges'
date: 2025-10-16 15:38:50
tags:
- SSL
- Firefox
- Web PKI
- OCSP
- CRLSets
- CRLite
---

In August 2023, the CA/Browser Forum passed a vote eliminating the requirement for publicly trusted CAs like Let's Encrypt to maintain OCSP servers.

In July 2024, Let's Encrypt published a [blog post](https://letsencrypt.org/2024/07/23/replacing-ocsp-with-crls) disclosing its plans to shut down its OCSP server.

In December of the same year, Let's Encrypt released [a timeline for shutting down its OCSP server](https://letsencrypt.org/2024/12/05/ending-ocsp), with the following key dates:

- January 30, 2025 - Let's Encrypt will no longer accept new certificate issuance requests containing the OCSP Must-Staple extension, unless your account has previously requested such certificates
- May 7, 2025 - Newly issued certificates from Let's Encrypt will include CRL URLs but will no longer contain OCSP URLs, and all new certificate issuance requests with the OCSP Must-Staple extension will be rejected
- August 6, 2025 - Let's Encrypt will shut down its OCSP servers

**Let's Encrypt is the world's largest free SSL certificate authority, and this move marks our gradual transition into the post-OCSP era.**

## OCSP's Dilemma: The Trade-off Between Performance and Privacy

Behind Let's Encrypt's decision lies long-accumulated dissatisfaction with OCSP (Online Certificate Status Protocol). OCSP, as a method for real-time certificate validity queries, had a beautiful initial vision: when a browser accesses a website, it can send a brief request to the **CA's (Certificate Authority's)** OCSP server, asking whether the certificate is still valid. This seemed much more efficient than downloading a massive **CRL (Certificate Revocation List)**.

However, OCSP has exposed numerous flaws in practical application:

First is the **performance issue**. Although individual requests are small, when millions of users simultaneously access websites, OCSP servers must handle massive amounts of real-time queries. This not only creates enormous server pressure for CAs but also increases latency for users accessing websites. If OCSP servers respond slowly or even crash, browsers may interrupt connections due to inability to confirm certificate status, or have to "turn a blind eye" for the sake of user experience, both of which undermine OCSP's security.

More seriously is the **privacy issue**. Each OCSP query essentially reports the user's browsing behavior to the CA. This means the CA can know when a user accessed which website. While OCSP queries themselves don't contain personally identifiable information, by combining this information with data like IP addresses, CAs can completely build profiles of users' browsing habits. For privacy-conscious users and developers, this "silent surveillance" is unacceptable. **Even if CAs intentionally don't retain this information, regional laws may force CAs to collect it.**

Furthermore, OCSP has **security flaws** in its design. Due to concerns about connection timeouts affecting user experience, browsers typically default to a soft-fail mechanism: if they cannot connect to the OCSP server, they choose to allow rather than block the connection. Attackers can exploit this by blocking communication between the client and OCSP server, causing queries to always timeout, thus easily bypassing certificate status verification.

### OCSP Stapling

Based on these flaws, we have the OCSP stapling solution, which [I covered in last year's blog post, feel free to review](/2024/11/19/firefox-is-the-only-mainstream-brower-doing-online-certificate-revocation-checks/#OCSP-装订-OCSP-stapling).

### OCSP Must-Staple

OCSP Must-Staple is an extension option when applying for SSL certificates. This extension tells the browser: if it recognizes this extension in the certificate, it must not send query requests to the certificate authority, but should obtain the stapled copy during the handshake phase. If a valid copy cannot be obtained, the browser should refuse the connection.

This feature gave browser developers the courage for hard-fail, but before OCSP faded from history, Let's Encrypt seemed to be the only mainstream CA supporting this extension, and this feature was not widely used.

~~I originally didn't want to introduce this feature (because literally no one used it), but considering this thing is about to be buried, let's erect a monument for it on the Chinese internet,~~ for more information, refer to [Let's Encrypt's blog](https://letsencrypt.org/2024/12/05/ending-ocsp#must-staple).

## Chromium's Solution: Taking Only a Ladle from Three Thousand Waters

OCSP's privacy and performance issues are no secret, and browser vendors have long begun their own explorations. In 2012, Chrome disabled CRLs and OCSP checks by default, turning to its own self-designed certificate verification mechanism.

It's well known that revocation lists can be extremely large. If browsers needed to download and parse a complete global revocation list, it would be a performance disaster (Mozilla's team mentioned in [this year's blog](https://hacks.mozilla.org/2025/08/crlite-fast-private-and-comprehensive-certificate-revocation-checking-in-firefox/) that file sizes from downloading 3000 active CRLs would reach 300MB). Through analyzing historical data, the Chromium team discovered that most revoked certificates belong to a few high-risk categories, such as the certificate authority (CA) itself being compromised, or certificates from certain large websites being revoked. Based on this insight, CRLSets adopts the following strategy:

1. **Tiered Revocation**: Chromium doesn't download all revoked certificate information, but rather the Google team maintains a streamlined list containing the "most important" revocation information. This list is regularly updated and pushed to users through Chrome browser updates.
2. **Streamlined Efficiency**: This list is very small in size, currently about 600KB. It contains certificates that would cause large-scale security incidents if abused, such as CA intermediate certificates, or certificates from some well-known websites (like Google, Facebook).
3. **Sacrificing Partial Security**: The disadvantage of this approach is also obvious—it cannot cover all certificate revocation situations. For an ordinary website's revoked certificate, CRLSets likely cannot detect it. According to Mozilla's blog this year, CRLSets only contains 1%-2% of unexpired revoked certificate information.

While CRLSets is an "imperfect" solution, it has found a balance between performance and usability. It ensures basic security for users accessing mainstream websites while avoiding the performance and privacy overhead brought by OCSP. For Chromium, rather than pursuing an OCSP solution that's difficult to implement perfectly in reality, it's better to concentrate efforts on solving the most urgent security threats.

## Firefox's Solution: From CRLs to CRLite

Unlike Chromium's "taking only a ladle" strategy, Firefox developers have been searching for a solution that can guarantee comprehensiveness while solving performance issues.

To solve this problem, Mozilla proposed an innovative solution: **CRLite**. CRLite's design philosophy is to use data structures like **hash functions and Bloom filters** to compress massive certificate revocation lists into a **compact, downloadable, and easily locally verifiable format**.

CRLite's working principle can be simply summarized as:

1. **Data Compression**: CAs periodically generate lists of all their revoked certificates.
2. **Server Processing**: Mozilla's servers collect these lists and use techniques like cryptographic hash functions and Bloom filters to **encode** all revoked certificate information into a very compact data structure.
3. **Client Verification**: The browser downloads this compressed file, and when accessing a website, it only needs to perform hash calculations on the certificate locally, then query this local file to quickly determine whether the certificate has been revoked.

Compared to CRLSets, CRLite's advantage is that it can achieve **comprehensive coverage of all revoked certificates** while maintaining an **extremely small size**. More importantly, it **completes verification entirely locally**, which means the browser **doesn't need to send requests to any third-party servers**, thus completely solving OCSP's privacy problem.

Firefox's current strategy performs incremental updates to CRLite data every 12 hours, with daily downloads of approximately 300KB; it performs a full snapshot sync every 45 days, with downloads of approximately 4MB.

Mozilla has opened their data dashboard, where you can find recent CRLite data sizes: https://yardstick.mozilla.org/dashboard/snapshot/c1WZrxGkNxdm9oZp7xVvGUEFJCELfApN

Starting with Firefox Desktop version 137 released on April 1, 2025, Firefox began gradually replacing OCSP validation with CRLite; on August 19 of the same year, Firefox Desktop 142 officially deprecated OCSP verification for DV certificates.

CRLite has become the core solution for Firefox's future certificate revocation verification, representing a comprehensive pursuit of performance, privacy, and security.

## Outlook for the Post-OCSP Era

With major CAs like Let's Encrypt shutting down OCSP services, the OCSP era is rapidly drawing to a close. We can see that browser vendors have already begun exploring more efficient and secure alternative solutions.

- **Chromium**, with its CRLSets solution, has achieved a pragmatic balance between **performance and critical security guarantees**.
- **Firefox**, through the technological innovation of **CRLite**, attempts to find the optimal solution among **comprehensiveness, privacy, and performance**.

What these solutions have in common is: **transforming certificate revocation verification from real-time online queries (OCSP) to localized verification**, thereby avoiding OCSP's inherent performance bottlenecks and privacy risks.

In the future, the certificate revocation ecosystem will no longer rely on a single, centralized OCSP server. Instead, a more diverse, distributed, and intelligent new era is arriving. **OCSP as a technology may gradually be phased out, but the core security problem of "certificate revocation" that it attempted to solve will forever remain a focus of browsers and the network security community.**

## See Also

- [CRLite: Fast, private, and comprehensive certificate revocation checking in Firefox - Mozilla Hacks - the Web developer blog](https://hacks.mozilla.org/2025/08/crlite-fast-private-and-comprehensive-certificate-revocation-checking-in-firefox/)
- [The Slow Death of OCSP | Feisty Duck](https://www.feistyduck.com/newsletter/issue_121_the_slow_death_of_ocsp)
- [mozilla/crlite: Compact certificate revocation lists for the WebPKI](https://github.com/mozilla/crlite)
- [OCSP Service Has Reached End of Life - Let's Encrypt](https://letsencrypt.org/2025/08/06/ocsp-service-has-reached-end-of-life)
- [Ending OCSP Support in 2025 - Let's Encrypt](https://letsencrypt.org/2024/12/05/ending-ocsp)
- [Intent to End OCSP Service - Let's Encrypt](https://letsencrypt.org/2024/07/23/replacing-ocsp-with-crls)
- [CRLSets - The Chromium Projects](https://www.chromium.org/Home/chromium-security/crlsets/)
- [Google Chrome Will No Longer Check for Revoked SSL Certificates Online | PCWorld](https://www.pcworld.com/article/474296/google_chrome_will_no_longer_check_for_revoked_ssl_certificates_online-2.html)
- [Chrome does certificate revocation better | ZDNET](https://www.zdnet.com/article/chrome-does-certificate-revocation-better/)
- [主流客户端/浏览器证书吊销验证机制技术对与分析 | 帽之岛, Hat's Land](https://www.hats-land.com/WIP/2025-technical-and-analysis-of-mainstream-clientbrowser-certificate-revocation-verification-mechanism.html)
- [OCSP 的淡出… – Gea-Suan Lin's BLOG](https://blog.gslin.org/archives/2025/02/02/12239/ocsp-%E7%9A%84%E6%B7%A1%E5%87%BA/)
