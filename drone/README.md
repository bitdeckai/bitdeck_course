# Crazyflie Lab

Crazyflie 微型飞行器交互式教学网站，使用 React、TypeScript 与 Three.js 构建。

当前 3D 几何直接转换自 Bitcraze 官方 `cf2_model.skp`（Crazyflie 2.0 Rev B），不是手工近似模型。转换仅移除了两个远离整机的建模辅助平面，并将坐标系转换为 glTF 2.0；该资产采用 CC BY-NC-SA 3.0。Crazyflie 2.1 的课程参数来源于 [Bitcraze Crazyflie 2.1 hardware datasheet](https://github.com/bitcraze/hardware/tree/master/src/products/crazyflie-2_1)，两代产品的 PCB 元件布局差异应以各自硬件资料为准。

## 课程体系

课程内容来自 `doc/无人机系统工程三级课程体系_学校汇报版.xlsx`：

- L1 基础版：20 课，面向小学 3-6 年级及零基础学习者。
- L2 进阶版：20 课，面向初高中及成人技术入门者。
- L3 专业版：20 课，面向大学生、研究生和工程师。
- 硬件工程拓展：8 课，覆盖 ESP32、通信、焊接、IMU、电机、闭环与 PCB。
- 每课采用任务导入、学科知识、无人机原理、实验编程、数据分析、项目记录的 90 分钟闭环。

页面布局和视觉语言参考 `../参考/anatomy-main`，课程数据维护在 `src/courseData.ts`。

## 本地运行

```bash
npm install
npm run dev
```

生产构建输出到 `dist/`：

```bash
npm run build
```

## 对外发布

### Vercel（推荐）

1. 将代码提交并推送到 GitHub 仓库。
2. 登录 [Vercel](https://vercel.com)，选择 **Add New Project** 并导入仓库。
3. 如果 GitHub 仓库的根目录不是本目录，将 **Root Directory** 设置为 `drone`。
4. Framework Preset 选择 **Vite**，Build Command 填 `npm run build`，Output Directory 填 `dist`。
5. 点击 **Deploy**。部署完成后会得到公开的 HTTPS 地址。

以后向 GitHub 推送代码时，Vercel 会自动重新构建并发布。自定义域名可在 Vercel 项目的 **Settings > Domains** 中绑定。

### Cloudflare Pages

在 Cloudflare 控制台连接 GitHub 仓库，Root directory 填 `drone`，构建命令填 `npm run build`，输出目录填 `dist`。

### 自有服务器

执行 `npm run build`，将 `dist/` 内的文件上传到 Nginx、Apache 或对象存储，并把站点入口指向 `index.html`。
```
