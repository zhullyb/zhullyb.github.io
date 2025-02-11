// ==UserScript==
// @name         正方教务导出 ICS
// @namespace    https://github.com/zhullyb/zf2ics
// @version      0.1
// @description  通过 Tampermonkey 借用浏览器现有登录状态，向正方教务系统后端发起请求，获取课表信息并导出 ICS 格式文件，方便导入日历应用中查看课程安排。
// @author       zhullyb
// @match        *://www.gdjw.zjut.edu.cn/jwglxt/kbcx/*
// @compatible   chrome
// @compatible   firefox
// @license      MIT
// @downloadURL  https://zhul.in/s/zf2ics.user.js
// ==/UserScript==

// ====== 节次对应的上课时间 ======
const sectionsInfo = [
    { section: 1, startTime: '08:00', endTime: '08:45' },
    { section: 2, startTime: '08:55', endTime: '09:40' },
    { section: 3, startTime: '09:55', endTime: '10:40' },
    { section: 4, startTime: '10:50', endTime: '11:35' },
    { section: 5, startTime: '11:45', endTime: '12:30' },
    { section: 6, startTime: '13:40', endTime: '14:15' },
    { section: 7, startTime: '14:25', endTime: '15:10' },
    { section: 8, startTime: '15:25', endTime: '16:10' },
    { section: 9, startTime: '16:20', endTime: '17:05' },
    { section: 10, startTime: '18:30', endTime: '19:15' },
    { section: 11, startTime: '19:25', endTime: '20:10' },
    { section: 12, startTime: '20:20', endTime: '21:05' }
];

(function () {
    'use strict';
    addButton();
})();


function addButton() {
    const btn = document.createElement('button');
    btn.textContent = '导出 ICS 格式课表';
    btn.style.position = 'fixed';
    btn.style.top = '10px';
    btn.style.right = '10px';
    btn.style.zIndex = 9999;
    btn.style.padding = '10px 20px';
    btn.style.backgroundColor = '#4CAF50';
    btn.style.color = '#fff';
    btn.style.border = 'none';
    btn.style.borderRadius = '5px';
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', main);
    document.body.appendChild(btn);
}

async function main() {
    let year = prompt("请输入本学年开始的年份（如2024/2025学年则输入2024）：");
    let term = prompt("请输入本学期的学期(1,2,3 分别表示上、下、短学期)");
    let firstWeekMonday = prompt("请输入本学年第一周星期一的日期（格式：2024-09-16）：");

    try {
        year = parseInt(year);
        term = parseInt(term);
        const checkDate = new Date(firstWeekMonday);
        if (isNaN(year) || year < 2000 || year > 2100 || term < 1 || term > 3 || firstWeekMonday.length !== 10 || checkDate.getDay() !== 1) {
            throw new Error('输入格式有误');
        }
    } catch (e) {
        alert('输入格式有误，请重试');
        return;
    }

    const courses_json = await provider({ year, term });
    const courses = parser(courses_json);
    const icsContent = generateICS({ courses, firstWeekMonday });
    downloadICS(icsContent);
}

async function provider({ year, term }) {
    const xqm = {
        '1': '3',
        '2': '12',
        '3': '16',
    }[term];

    const res = await fetch("http://www.gdjw.zjut.edu.cn/jwglxt/kbcx/xskbcx_cxXsgrkb.html?gnmkdm=N2151", {
        "headers": {
            "accept": "*/*",
            "accept-language": "zh-CN,zh;q=0.9",
            "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
            "x-requested-with": "XMLHttpRequest"
        },
        "referrer": "http://www.gdjw.zjut.edu.cn/jwglxt/kbcx/xskbcx_cxXskbcxIndex.html?gnmkdm=N2151&layout=default",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": `xnm=${year}&xqm=${xqm}&kzlx=ck&xsdm=`,
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    })

    const ret = await res.json()
    return JSON.stringify(ret.kbList)
}

function parser(json_str) {
    courses_json = JSON.parse(json_str)
    const courseInfos = []

    for (course of courses_json) {
        const name = course.kcmc
        const position = course.cdmc
        const teacher = course.xm
        const weeksTemp = course.zcd.replace('周', '').split(',')
        const weeks = []
        weeksTemp.forEach(w => {
            w = w.split('-')
            if (w.length === 1) {
                weeks.push(parseInt(w))
            } else {
                for (let i = parseInt(w[0]); i <= parseInt(w[1]); i += 1) {
                    weeks.push(i)
                }
            }
        })
        const day = parseInt(course.xqj)
        const sectionsTemp = course.jcor.split('-')
        const sections = []
        if (sectionsTemp.length == 1) {
            sections.push(parseInt(sectionsTemp[0]))
        } else {
            for (let i = parseInt(sectionsTemp[0]); i <= parseInt(sectionsTemp[1]); i += 1) {
                sections.push(i)
            }
        }

        courseInfos.push({
            name,
            teacher,
            position,
            weeks,
            day,
            sections,
        })
    }

    return courseInfos
}


// ====== 辅助函数 ======

// 根据日期和时间字符串生成一个 Date 对象（时间为当天的指定时刻）
function combineDateTime(date, timeStr) {
    const [hour, minute] = timeStr.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hour, minute, 0, 0);
    return newDate;
}

// 日期格式化为 ICS 格式：YYYYMMDDTHHmmss（不含分隔符）
function formatDateTimeICS(date) {
    const pad = n => n < 10 ? '0' + n : n;
    return date.getFullYear().toString() +
        pad(date.getMonth() + 1) +
        pad(date.getDate()) + 'T' +
        pad(date.getHours()) +
        pad(date.getMinutes()) +
        pad(date.getSeconds());
}

// 给定一个日期，增加指定的天数
function addDays(date, days) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
}

// 生成一个简单的唯一 ID
function generateUID() {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    arr[6] = (arr[6] & 0x0f) | 0x40; // UUID version 4
    arr[8] = (arr[8] & 0x3f) | 0x80; // Variant
    return [...arr].map((b, i) =>
        [4, 6, 8, 10].includes(i) ? `-${b.toString(16).padStart(2, "0")}` : b.toString(16).padStart(2, "0")
    ).join('');
}

// ====== ICS 文件生成 ======

function generateICS({ courses, firstWeekMonday }) {
    let icsContent = 'BEGIN:VCALENDAR\r\n' +
        'VERSION:2.0\r\n' +
        'CALSCALE:GREGORIAN\r\n' +
        'METHOD:PUBLISH\r\n';

    // 遍历每个课程
    courses.forEach(course => {
        // 找到该课程最早和最晚的节次对应的时间信息
        const sortedSections = course.sections.sort((a, b) => a - b);
        const startSection = sortedSections[0];
        const endSection = sortedSections[sortedSections.length - 1];
        const startSectionInfo = sectionsInfo.find(s => s.section === startSection);
        const endSectionInfo = sectionsInfo.find(s => s.section === endSection);
        if (!startSectionInfo || !endSectionInfo) {
            console.warn('未找到节次信息', course);
            return;
        }

        // 遍历该课程所在的每一周
        course.weeks.forEach(weekNum => {
            // 根据第一周的周一计算当前课的日期
            // 注意：course.day 为 1 表示周一，所以偏移 (course.day - 1)
            const weekStartDate = addDays(new Date(firstWeekMonday), (weekNum - 1) * 7);
            const classDate = addDays(weekStartDate, course.day - 1);

            // 拼接上课的开始和结束时间
            const classStart = combineDateTime(classDate, startSectionInfo.startTime);
            const classEnd = combineDateTime(classDate, endSectionInfo.endTime);

            // 生成 ICS 的 VEVENT 块
            icsContent += 'BEGIN:VEVENT\r\n';
            icsContent += 'DTSTART:' + formatDateTimeICS(classStart) + '\r\n';
            icsContent += 'DTEND:' + formatDateTimeICS(classEnd) + '\r\n';
            // 使用当前时间作为 DTSTAMP
            icsContent += 'DTSTAMP:' + formatDateTimeICS(new Date()) + 'Z\r\n';
            icsContent += 'UID:' + generateUID() + '\r\n';
            // 课程名称
            icsContent += 'SUMMARY:' + course.name + '\r\n';
            // 描述中也可加入其他信息
            icsContent += 'DESCRIPTION:' + '课程：' + course.name + '\\n教师：' + course.teacher + '\\n周次：' + weekNum + '\\n节次：' + course.sections.join(', ') + '\r\n';
            icsContent += 'LOCATION:' + course.position + '\r\n';
            icsContent += 'END:VEVENT\r\n';
        });
    });

    icsContent += 'END:VCALENDAR';
    return icsContent;
}

// ====== 下载 ICS 文件 ======
function downloadICS(icsContent) {
    function getFileName() {
        const now = new Date();
        const month = `0${now.getMonth() + 1}`.slice(-2);
        const date = `0${now.getDate()}`.slice(-2);
        return `正方课表导出-${now.getFullYear()}${month}${date}.ics`;
    }
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getFileName();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}