# **L**inux.do **U**nofficial **M**obile **A**pp

![GitHub License](https://img.shields.io/github/license/yuhanawa/luma)
![GitHub Release](https://img.shields.io/github/v/release/yuhanawa/luma)

[English](README-en.md) | [中文](README.md)

又一个非官方的 [Linux.do](https://linux.do/) 移动端, 开发中, 只实现了部分功能

~~点击没反应的是还没写，点击崩溃的是刚刚新建文件~~

如遇到没反应/崩溃请提 issue，万分感谢！

## 🛠 技术栈

- **框架**: React Native + Expo
- **HTTP Client**: Axios (with tough-cookie)
- **UI**: React Native Reusables, NativeWind v4
- **状态管理**: Zustand
- **持久化储存**: AsyncStorage + SecureStore
- **i18n**: i18next + react-i18next
- **Format & Lint**: Biome
- **NOTE**: 未使用自定义原生模块，可在 Expo GO 中运行

## 项目结构

```md
luma
├─ app
│ └─ \_layout.tsx #入口点
├─ assets
├─ components
│ └─ ui     # React Native Reusables UI
├─ lib
│ ├─ api    # 程序生成的 Discourse API
│ ├─ docs   # 使用脚本提取的 Discourse 的所有 Ajax 函数，方便查阅
│ ├─ gen    # 程序生成的 Discourse type
│ ├─ i18n
│ │ └─ locales              # 本地化文件在这里
│ ├─ initialColorScheme.ts  # 内置主题在这里
│ ├─ cookieManager.ts
│ └─ linuxDoClient.ts
├─ patches
└─ store
```

## Deployment

欢迎并感谢任何 Issue 和 PR

### 环境

只需要

- Node.js
- pnpm
- 一台安装了 [Expo GO](https://expo.dev/go) 的手机或者 Emulator

### Install dependencies

```bash
pnpm i
```

### Start the app

```bash
pnpm start
```

### Format & Lint

```bash
pnpm check
```
