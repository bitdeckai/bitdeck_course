import { useMemo, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  BrainCircuit,
  CheckCircle2,
  Compass,
  ExternalLink,
  FileText,
  Gauge,
  GraduationCap,
  LibraryBig,
  Menu,
  NotebookPen,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  Timer,
  X,
} from 'lucide-react'
import { OfficialCrazyflieViewer } from './OfficialCrazyflieViewer'
import { courses, hardwareLessons, lessonFlow, levelMeta, moduleMeta, type Lesson, type LevelId, type ModuleId } from './courseData'
import type { PartId } from './data'
import './CourseApp.css'

type Modal = 'overview' | 'lesson' | 'resources' | 'progress' | null

const flowIcons = [Compass, GraduationCap, BrainCircuit, Play, Gauge, NotebookPen]
const partModules: Record<PartId, ModuleId> = {
  frame: 'M0',
  motors: 'M1',
  propellers: 'M1',
  controller: 'M2',
  battery: 'M5',
  deck: 'M4',
}

function flowContent(lesson: Lesson, key: (typeof lessonFlow)[number]['key']) {
  if (key === 'task') return lesson.title
  if (key === 'subject') return lesson.subject
  if (key === 'principle') return lesson.principle
  if (key === 'practice') return lesson.practice
  if (key === 'data') return '记录关键参数与现象，用曲线或表格解释误差和变化趋势。'
  return lesson.output
}

function App() {
  const [level, setLevel] = useState<LevelId>('L1')
  const [lessonId, setLessonId] = useState(courses.L1[0].id)
  const [query, setQuery] = useState('')
  const [autoRotate, setAutoRotate] = useState(true)
  const [resetSignal, setResetSignal] = useState(0)
  const [mobileLibrary, setMobileLibrary] = useState(false)
  const [modal, setModal] = useState<Modal>(null)
  const [completed, setCompleted] = useState<Set<string>>(() => new Set())
  const lessons = courses[level]
  const lesson = lessons.find((item) => item.id === lessonId) ?? lessons[0]
  const filteredLessons = useMemo(
    () => lessons.filter((item) => `${item.title} ${item.moduleName} ${item.subject}`.toLowerCase().includes(query.trim().toLowerCase())),
    [lessons, query],
  )
  const completedCount = lessons.filter((item) => completed.has(item.id)).length

  const selectLevel = (nextLevel: LevelId) => {
    setLevel(nextLevel)
    setLessonId(courses[nextLevel][0].id)
    setQuery('')
  }

  const selectLesson = (id: string) => {
    setLessonId(id)
    setMobileLibrary(false)
  }

  const selectPart = (part: PartId) => {
    const match = lessons.find((item) => item.module === partModules[part])
    if (match) selectLesson(match.id)
  }

  const toggleComplete = () => {
    setCompleted((current) => {
      const next = new Set(current)
      if (next.has(lesson.id)) next.delete(lesson.id)
      else next.add(lesson.id)
      return next
    })
  }

  return (
    <main className="course-app">
      <header className="course-topbar">
        <button className="course-brand" type="button" onClick={() => selectLesson(lessons[0].id)} aria-label="返回本级第一课">
          <strong>Crazyflie Atelier<sup>✦</sup></strong>
          <em>从第一次起飞，到读懂飞控</em>
        </button>
        <nav className="main-nav" aria-label="主导航">
          <button className="active"><Compass size={17} />课程探索</button>
          <button onClick={() => setModal('overview')}><BookOpen size={17} />知识体系</button>
          <button onClick={() => document.getElementById('lesson-flow')?.scrollIntoView({ behavior: 'smooth' })}><Timer size={17} />课堂节奏</button>
          <button onClick={() => setModal('resources')}><LibraryBig size={17} />教学资料</button>
        </nav>
        <label className="search-box">
          <Search size={17} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索课程或知识点" />
        </label>
        <div className="level-switcher" aria-label="课程等级">
          {(['L1', 'L2', 'L3'] as LevelId[]).map((item) => <button key={item} className={level === item ? 'active' : ''} onClick={() => selectLevel(item)}>{item}</button>)}
        </div>
        <button className="profile" onClick={() => setModal('progress')} aria-label="查看学习进度"><span>CF</span></button>
        <button className="mobile-library-trigger" onClick={() => setMobileLibrary(true)} aria-label="打开课程列表"><Menu size={20} /></button>
      </header>

      <div className="course-workspace">
        <aside className={`course-library ${mobileLibrary ? 'open' : ''}`}>
          <div className="panel-heading">
            <span>{level} · 20 课时</span>
            <button aria-label="关闭课程列表" className="mobile-close" onClick={() => setMobileLibrary(false)}><X size={17} /></button>
            <button aria-label="查看学习进度" onClick={() => setModal('progress')}><Bookmark size={17} /></button>
          </div>
          <div className="course-list">
            {filteredLessons.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`course-item ${lesson.id === item.id ? 'active' : ''}`}
                onClick={() => selectLesson(item.id)}
                style={{ '--item-accent': item.accent } as React.CSSProperties}
              >
                <span className="course-glyph">{String(item.number).padStart(2, '0')}</span>
                <span><b>{item.title}</b><small>{item.module} · {item.moduleName}</small></span>
                {completed.has(item.id) && <CheckCircle2 className="completed-mark" size={15} />}
              </button>
            ))}
            {filteredLessons.length === 0 && <p className="empty-search">没有找到匹配课程</p>}
          </div>
          <button className="view-all" onClick={() => setQuery('')}>查看全部 20 课 <ArrowRight size={14} /></button>
          <div className="library-progress">
            <div><span>{levelMeta[level].name}进度</span><b>{completedCount} / 20</b></div>
            <i><span style={{ width: `${completedCount * 5}%` }} /></i>
          </div>
        </aside>

        <section className="viewer-shell" style={{ '--lesson-accent': lesson.accent } as React.CSSProperties}>
          <div className="viewer-glow" />
          <OfficialCrazyflieViewer selected={lesson.part} autoRotate={autoRotate} resetSignal={resetSignal} onSelect={selectPart} />
          <div className="viewer-tools">
            <button className="tool-button" onClick={() => setResetSignal((value) => value + 1)} title="重置视角"><RotateCcw size={19} /><span>重置</span></button>
            <button className="tool-button" onClick={() => setModal('overview')} title="查看模块"><BrainCircuit size={19} /><span>模块</span></button>
            <button className="tool-button" onClick={() => setModal('lesson')} title="打开课时"><Play size={19} /><span>课时</span></button>
          </div>
          <aside className="tip-note">
            <span><Sparkles size={13} />本课任务</span>
            <p>{lesson.practice}</p>
          </aside>
          <button className="auto-rotate" onClick={() => setAutoRotate((value) => !value)}>
            自动旋转 <span className={`switch ${autoRotate ? 'on' : ''}`}><i /></span>
          </button>
          <div className="view-caption"><span>{lesson.module} · BITCRAZE OFFICIAL CAD</span><strong>Crazyflie 2.0 Rev B</strong></div>
        </section>

        <aside className="lesson-info">
          <div className="info-kicker"><GraduationCap size={13} /> {level} · 第 {lesson.number} 课 · 90 分钟</div>
          <div className="info-title-row">
            <div><h1>{lesson.title}</h1><em>{levelMeta[level].description}</em></div>
            <span className="lesson-stamp" style={{ '--stamp-accent': lesson.accent } as React.CSSProperties}>{lesson.module}</span>
          </div>
          <p className="description">{moduleMeta[lesson.module].question}</p>
          <div className="rule" />
          <h2>本课学习地图</h2>
          <dl className="key-facts">
            <div><dt><span>◇</span>学科知识</dt><dd>{lesson.subject}</dd></div>
            <div><dt><span>⌁</span>无人机原理</dt><dd>{lesson.principle}</dd></div>
            <div><dt><span>⌖</span>实践任务</dt><dd>{lesson.practice}</dd></div>
            <div><dt><span>◈</span>阶段产出</dt><dd>{lesson.output}</dd></div>
          </dl>
          <div className="principle-note"><BrainCircuit size={16} /><p><b>模块主线</b>{moduleMeta[lesson.module].name}</p></div>
          <div className="output-note"><Sparkles size={15} /><p><b>学习证据</b>一句结论、一张图和一条下一步计划。</p></div>
          <button className="lesson-button" onClick={() => setModal('lesson')}>打开完整课时 <ArrowRight size={16} /></button>
          <div className="action-grid">
            <button onClick={toggleComplete} className={completed.has(lesson.id) ? 'active' : ''}><CheckCircle2 size={15} />{completed.has(lesson.id) ? '已完成' : '标记完成'}</button>
            <button onClick={() => setModal('resources')}><FileText size={15} />参考资料</button>
          </div>
          <a className="official-source" href="https://github.com/bitcraze/hardware/tree/master/src/products/crazyflie-2_1" target="_blank" rel="noreferrer">Bitcraze 官方硬件资料 <ExternalLink size={12} /></a>
        </aside>
      </div>

      <section className="learning-cards" id="lesson-flow" aria-label="90 分钟课堂流程">
        {lessonFlow.map((step, index) => {
          const Icon = flowIcons[index]
          return (
            <article key={step.key} className={index === 0 ? 'mission-card' : ''} style={{ '--flow-accent': lesson.accent } as React.CSSProperties}>
              <header><div><em>{step.english} · {step.minutes} MIN</em><h3>{step.label}</h3></div><Icon size={18} /></header>
              <p>{flowContent(lesson, step.key)}</p>
              <button onClick={() => setModal('lesson')}>查看环节 <ArrowRight size={14} /></button>
            </article>
          )
        })}
      </section>

      {modal && <CourseModal type={modal} lesson={lesson} level={level} completedCount={completedCount} onClose={() => setModal(null)} />}
      {mobileLibrary && <button className="drawer-backdrop" aria-label="关闭课程列表" onClick={() => setMobileLibrary(false)} />}
    </main>
  )
}

function CourseModal({ type, lesson, level, completedCount, onClose }: { type: Exclude<Modal, null>; lesson: Lesson; level: LevelId; completedCount: number; onClose: () => void }) {
  const title = type === 'overview' ? '六大知识模块' : type === 'resources' ? '硬件拓展与资料' : type === 'progress' ? `${level} 学习进度` : lesson.title
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className={`course-modal ${type === 'overview' ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="关闭"><X size={18} /></button>
        <span className="modal-icon">{type === 'overview' ? <BrainCircuit /> : type === 'resources' ? <LibraryBig /> : type === 'progress' ? <Gauge /> : <Play />}</span>
        <em>Crazyflie guided learning</em>
        <h2 id="modal-title">{title}</h2>
        {type === 'overview' ? (
          <div className="module-map">{(Object.entries(moduleMeta) as [ModuleId, (typeof moduleMeta)[ModuleId]][]).map(([id, module]) => <div key={id} style={{ '--module-accent': module.accent } as React.CSSProperties}><b>{id}</b><span><strong>{module.name}</strong><small>{module.question}</small></span></div>)}</div>
        ) : type === 'resources' ? (
          <>
            <div className="hardware-list">{hardwareLessons.map(([id, name, topic, levels]) => <div key={id}><b>{id}</b><span><strong>{name}</strong><small>{topic} · {levels}</small></span></div>)}</div>
            <div className="resource-list">
              <a href="https://github.com/bitcraze/hardware" target="_blank" rel="noreferrer"><FileText />Bitcraze 硬件资料<ExternalLink size={14} /></a>
              <a href="https://github.com/bitcraze/bitcraze-mechanics" target="_blank" rel="noreferrer"><Compass />Crazyflie 结构资料<ExternalLink size={14} /></a>
              <a href="https://www.bitcraze.io/documentation/" target="_blank" rel="noreferrer"><BookOpen />Bitcraze 官方文档<ExternalLink size={14} /></a>
            </div>
          </>
        ) : type === 'progress' ? (
          <div className="progress-detail"><strong>{completedCount}<small>/ 20 课</small></strong><i><span style={{ width: `${completedCount * 5}%` }} /></i><p>{levelMeta[level].audience}<br />{levelMeta[level].description}</p></div>
        ) : (
          <ol className="lesson-plan">{lessonFlow.map((step) => <li key={step.key}><span>{step.minutes}<small>min</small></span><div><b>{step.label}</b><p>{flowContent(lesson, step.key)}</p></div></li>)}</ol>
        )}
        <button className="modal-action" onClick={onClose}>继续探索 <ArrowRight size={16} /></button>
      </section>
    </div>
  )
}

export default App
