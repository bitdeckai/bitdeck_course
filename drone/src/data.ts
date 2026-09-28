export type PartId = 'frame' | 'motors' | 'propellers' | 'controller' | 'battery' | 'deck'

export type DronePart = {
  id: PartId
  index: string
  name: string
  english: string
  summary: string
  principle: string
  specs: Array<[string, string]>
  checks: string[]
  accent: string
}

export const droneParts: DronePart[] = [
  {
    id: 'frame', index: '01', name: '机架与主板', english: 'FRAME & MAINBOARD',
    summary: 'Crazyflie 将承力结构与主电路板合二为一，在极轻重量下保持足够刚度。',
    principle: 'X 型布局让四个电机到质心的力臂近似相等。改变各电机推力，飞行器便可产生滚转、俯仰和偏航力矩。',
    specs: [['外形尺寸', '92 × 92 × 29 mm'], ['起飞重量', '29 g'], ['布局', 'X 型四旋翼']],
    checks: ['检查电机臂是否弯曲', '确认焊点无松动', '保持重心接近几何中心'], accent: '#e2492f',
  },
  {
    id: 'motors', index: '02', name: '空心杯电机', english: 'CORELESS MOTORS',
    summary: '四台微型电机分别产生升力，是姿态控制最直接的执行机构。',
    principle: '飞控以高频 PWM 调节电机转速。成对增减转速控制滚转和俯仰，对角电机的反扭矩差控制偏航。',
    specs: [['数量', '4'], ['驱动方式', 'PWM'], ['响应', '毫秒级']],
    checks: ['检查电机顺序 M1-M4', '听辨异常摩擦声', '确认插头极性正确'], accent: '#147d84',
  },
  {
    id: 'propellers', index: '03', name: '螺旋桨', english: 'PROPELLERS',
    summary: '两组正反桨抵消整体反扭矩，并把电机旋转转换为向上的推力。',
    principle: '相邻螺旋桨旋向相反。安装方向错误时，即使电机高速旋转，也无法形成稳定向下的气流。',
    specs: [['数量', '4'], ['旋向', 'CW / CCW'], ['直径', '45 mm']],
    checks: ['按标记匹配 CW 与 CCW', '检查桨叶裂纹和缺口', '确保桨叶可自由旋转'], accent: '#d99b24',
  },
  {
    id: 'controller', index: '04', name: '飞行控制器', english: 'FLIGHT CONTROLLER',
    summary: '飞控融合惯性传感器数据，估计姿态并闭环调节四个电机。',
    principle: '角速度与加速度经过姿态估计算法融合，控制器将目标姿态和实测姿态的误差转换为电机修正量。',
    specs: [['主控', 'STM32F405'], ['姿态传感', 'BMI088'], ['气压计', 'BMP388']],
    checks: ['上电时保持机体静止', '确认传感器校准完成', '起飞前检查估计姿态'], accent: '#644f9b',
  },
  {
    id: 'battery', index: '05', name: '锂聚合物电池', english: 'LIPO BATTERY',
    summary: '单节锂聚合物电池为飞控、电机和扩展板供电。',
    principle: '电池电压会随放电下降，电机可用推力和飞行时间也随之变化。低电压下继续飞行会损伤电芯。',
    specs: [['标称电压', '3.7 V'], ['容量', '250 mAh'], ['典型续航', '约 7 min']],
    checks: ['检查电池无鼓包破损', '固定电池避免重心偏移', '低电量提示后及时降落'], accent: '#315a9a',
  },
  {
    id: 'deck', index: '06', name: '扩展接口', english: 'EXPANSION DECK',
    summary: '上下扩展接口让 Crazyflie 能快速添加定位、测距、视觉与自定义硬件。',
    principle: 'Deck 通过标准化的供电和通信总线连接主控，驱动可自动识别部分扩展板并注册对应功能。',
    specs: [['接口', 'Deck connector'], ['通信', 'I²C / SPI / UART'], ['用途', '定位与感知']],
    checks: ['断电后再插拔扩展板', '检查针脚完全对齐', '确认固件包含对应驱动'], accent: '#3b7c4f',
  },
]