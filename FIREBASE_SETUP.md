# Firebase 配置指南

## 概述

本项目已集成Firebase，实现真正的多用户实时交流功能。所有数据（用户、留言、藏品、关注、私信）都存储在Firebase云端数据库中，不同用户之间可以实时同步数据。

## 配置步骤

### 1. 创建Firebase项目

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 点击"添加项目"
3. 输入项目名称（例如：收藏爱好者社区）
4. 选择或创建Google Analytics账号（可选）
5. 点击"创建项目"

### 2. 启用Authentication（身份验证）

1. 在Firebase Console中，点击左侧菜单的"Authentication"
2. 点击"开始使用"
3. 选择"电子邮件/密码"标签页
4. 点击"启用"
5. 点击"保存"

### 3. 创建Realtime Database（实时数据库）

1. 在Firebase Console中，点击左侧菜单的"Realtime Database"
2. 点击"创建数据库"
3. 选择数据库位置（推荐选择离您最近的区域）
4. 选择"以测试模式启动"（开发阶段）
5. 点击"启用"

### 6. 创建Storage（云存储）

1. 在Firebase Console中，点击左侧菜单的"Storage"
2. 点击"开始使用"
3. 遵循安全规则设置步骤（选择"测试模式"）
4. 点击"完成"

### 4. 获取Firebase配置信息

1. 在Firebase Console中，点击项目设置（齿轮图标）
2. 向下滚动到"您的应用"部分
3. 点击Web图标（</>）
4. 输入应用名称（例如：收藏爱好者社区）
5. 点击"注册应用"
6. 复制firebaseConfig对象的配置信息

### 5. 更新script.js中的配置

打开`script.js`文件，找到以下代码：

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

将Firebase Console中的配置信息替换到对应的位置。

### 6. 设置数据库安全规则（可选）

在Firebase Console中，点击"Realtime Database" > "规则"，设置以下规则：

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

**注意**：以上规则允许任何人读写数据库，仅用于开发测试。生产环境请设置更严格的规则。

## 功能说明

### 已实现的功能

1. **用户认证**
   - 用户注册和登录
   - 用户退出
   - 自动登录状态保持

2. **实时留言**
   - 多用户实时同步留言
   - 楼层显示
   - 表情包支持

3. **藏品分享**
   - 支持图片和视频上传
   - 文件存储在Firebase Storage
   - 实时同步所有藏品

4. **关注系统**
   - 关注/取消关注用户
   - 关注状态实时更新

5. **私信功能**
   - 实时聊天
   - 互关用户无限聊天
   - 非互关用户限制3条消息

## 部署到GitHub Pages

项目已经部署在GitHub Pages上：https://ilovewhlpromax.github.io/second/

### 部署步骤

1. 将项目文件推送到GitHub仓库
2. 在GitHub仓库设置中启用GitHub Pages
3. 选择main分支作为源
4. 等待部署完成

## 注意事项

1. **Firebase免费额度**
   - Realtime Database: 1GB存储，每月10GB下载
   - Storage: 5GB存储，每月1GB下载
   - Authentication: 免费使用

2. **文件大小限制**
   - 单个文件最大10MB
   - 建议上传压缩后的图片和视频

3. **浏览器兼容性**
   - 支持现代浏览器（Chrome、Firefox、Safari、Edge）
   - 需要启用JavaScript

## 故障排除

### 问题：无法注册/登录

**解决方案**：
- 检查Firebase配置是否正确
- 确认Authentication已启用
- 查看浏览器控制台错误信息

### 问题：留言不实时同步

**解决方案**：
- 检查Realtime Database是否启用
- 确认数据库规则允许读写
- 刷新页面重新连接

### 问题：无法上传文件

**解决方案**：
- 检查Storage是否启用
- 确认文件大小不超过10MB
- 查看浏览器控制台错误信息

## 技术支持

如有问题，请检查：
1. Firebase Console中的日志
2. 浏览器开发者工具的控制台
3. 网络连接是否正常

## 下一步

配置完成后，您可以：
1. 注册多个测试账号
2. 在不同浏览器中登录不同账号
3. 测试实时留言、私信等功能
4. 上传图片和视频分享藏品