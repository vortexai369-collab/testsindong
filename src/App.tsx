/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import FeedbackPhraseEditor from './components/FeedbackPhraseEditor';

type Subject = '국어' | '수학' | '영어' | '사회' | '과학';
type SubjectKey = 'k' | 'm' | 'e' | 's' | 'sc';
type Grade = 'A' | 'B' | 'C' | 'D';

const SUBS: Subject[] = ['국어', '수학', '영어', '사회', '과학'];
const K: Record<Subject, SubjectKey> = { 국어: 'k', 수학: 'm', 영어: 'e', 사회: 's', 과학: 'sc' };

const LV: Record<Grade, [string, string]> = {
  A: ['매우우수', '학업 성취도가 매우 높음.'],
  B: ['우수', '기본학력이 높음.'],
  C: ['보통', '기본학력이 성취됨.'],
  D: ['미흡', '기본학력 향상을 위한 노력이 필요함.'],
};

const DF: Record<Subject, Record<Grade, string>> = {
  국어: {
    A: '국어과 학업 성취 수준이 매우 우수하며, 대화의 원리와 기행문의 구조, 배려하는 대화법, 생략된 정보를 정확히 추론하는 방법, 여정과 견문 등의 요소를 잘 이해하고 있습니다. 앞으로 더욱 깊이 있는 글을 읽고 자신의 생각을 논리적으로 표현하는 능력을 키워나갈 것으로 기대됩니다.',
    B: '국어과 학업 성취 수준이 우수하며, 대화의 배려와 생략된 내용 짐작하기, 기행문의 필수 요소, 설명하는 글의 구조 등을 이해하고 있습니다. 다양한 유형의 문제를 풀어보며 개념을 정확하게 적용하는 연습을 꾸준히 한다면 더욱 성장할 것입니다.',
    C: '국어과 학업 성취 수준이 보통 수준이며, 대화의 기본 예절과 생략된 내용을 짐작하는 활동, 기행문의 요소인 여정, 견문, 감상의 개념을 어느 정도는 알고 있으며, 설명하는 글의 구조를 파악하기 위해 노력합니다. 기초적인 개념을 익히는 연습을 꾸준히 한다면 성장할 것입니다.',
    D: '국어과 학업 성취 수준 향상을 위해 전반적으로 노력이 요망되며, 기초부터 차근차근 다지는 과정이 필요합니다. 대화의 기본 원리와 글의 구조를 파악하는 기초 학습이 필요합니다. 또한 여정, 견문, 감상이 드러나는 글쓰기와 자료 선별의 단계를 구체적인 예시와 함께 반복하여 익힐 수 있도록 가정의 지도가 필요합니다.',
  },
  수학: {
    A: '수학과 학업 성취 수준이 매우 우수하며, 수와 연산 영역의 핵심 원리를 완벽히 이해하고 있습니다. 대응관계 찾기부터 분수 연산까지 전 영역에서 정확한 계산력을 바탕으로 높은 성취를 보이고 있습니다. 앞으로 심화 문제에 도전하며 수학적 사고력을 더욱 확장해 나갈 수 있을 것으로 기대됩니다.',
    B: '수학과 학업 성취 수준이 우수하며, 사칙연산 혼합계산과 최소공배수 구하기 등 핵심 개념을 잘 이해하고 있습니다. 분수와 소수의 크기를 비교하고 진분수와 대분수의 덧셈 및 뺄셈 등의 원리를 이해하고 있습니다. 계산 실수를 줄이고 문제의 조건을 꼼꼼히 분석하는 연습을 꾸준히 한다면 더욱 발전할 것입니다.',
    C: '수학과 학업 성취 수준이 보통 수준이며, 사칙연산의 혼합계산 순서와 기초적인 약수, 배수의 개념을 어느정도 파악하고 있습니다. 분수의 덧셈과 뺄셈의 기본 원리에 대한 이해와 두 양 사이의 대응관계를 찾기 위해 노력하는 모습을 보입니다. 다만 기본 문제나 문장제 문제에서 가끔 실수가 있으니 차분히 푸는 연습이 요구됩니다.',
    D: '수학과 학업 성취 수준 향상을 위해 노력이 요망되며, 사칙연산의 혼합계산 순서와 약수, 배수의 기초 개념을 다시 확인해야 합니다. 분수의 덧셈과 뺄셈 연산 원리를 보완하고 기본 문제를 반복 연습할 수 있도록 가정에서 격려해주시기 바랍니다. 문제 풀이 시 서술 과정을 순서대로 또박또박 쓰는 훈련이 도움을 줍니다.',
  },
  영어: {
    A: '영어과 학업 성취 수준이 매우 우수하며, 국가와 국기, 과목, 일과, 소유 등을 묻고 답하는 핵심 표현을 자유롭게 활용합니다. 허락을 구하거나 분실물의 주인을 찾는 대화 상황에서 알맞은 문장을 정확하게 구사하고, 게시판이나 안내문 내용을 완벽하게 파악합니다.',
    B: '영어과 학업 성취 수준이 우수하며, 출신 국가, 좋아하는 과목, 일과와 관련된 주요 표현을 문맥에 맞게 잘 활용합니다. 분실물 주인 찾기나 허락을 구하는 대화에서 상대의 말을 정확히 이해하고 상황에 맞는 적절한 응답을 선택하여 표현할 수 있습니다.',
    C: '영어과 학업 성취 수준이 보통 수준이며, 교과서의 핵심 표현을 바탕으로 출신 국가, 과목, 일과 등을 묻고 답하는 기본적인 의사소통 활동에 대해 이해하고 있습니다. 또한 허락을 구하는 말이나 소유를 묻는 질문의 의미를 파악하여 기초적인 문장 구성이 가능합니다. 다만 알파벳 소리와 낱말 인지, 단어 쓰기의 지속적인 복습이 보완되면 좋겠습니다.',
    D: '영어과 학업 성취 수준 향상을 위해 전반적으로 노력이 요망되며, 출신 국가와 일과 등을 표현하는 핵심 어휘와 문장 구조를 기초부터 다시 살펴볼 필요가 있습니다. 가정에서 교과서의 주요 대화문을 큰 소리로 따라 읽으며 표현을 익힐 수 있도록 지도를 부탁드립니다. 쉬운 영어 표현이나 짧은 영어 문장을 소리 내어 따라 읽는 훈련이 필요하며, 철자와 소리의 관계를 익히는 파닉스 학습을 제안합니다.',
  },
  사회: {
    A: '사회과 학업 성취 수준이 매우 우수하며, 지리, 역사, 사회 현상과 환경의 변화를 폭넓게 이해하고 사회적 현상을 구체적 사례와 연결하여 탐구하는 능력이 탁월합니다. 민주 시민으로서의 자질과 사회 문제 해결에 적극 참여하는 자세가 기대됩니다.',
    B: '사회과 학업 성취 수준이 우수하며, 주요 사회 개념과 지리적 요소, 역사적 흐름을 잘 파악하고 있습니다. 사회 현상을 다각도로 관찰하고 탐구 활동에 적극적으로 참여하여 지식을 심화해 나가고 있습니다.',
    C: '사회과 학업 성취 수준이 보통 수준이며, 교과서의 주요 지리 및 역사 관련 핵심 개념을 이해하고 기초적인 탐구 활동에 성실히 참여합니다. 탐구 자료의 분석과 개념 적용 연습을 지속하면 더욱 발전할 것입니다.',
    D: '사회과 학업 성취 수준 향상을 위해 노력이 요망되며, 기초적인 사회 용어와 지리·역사 분야의 핵심 개념에 대한 이해를 다질 필요가 있습니다. 주변의 사회적 현상과 뉴스 자료 등을 관심 있게 관찰하도록 가정의 격려를 부탁드립니다.',
  },
  과학: {
    A: '과학과 학업 성취 수준이 매우 우수하며, 자연 현상에 대한 높은 호기심과 탐구 능력을 바탕으로 과학적 원리를 명확하게 이해하고 있습니다. 실험 과정에서 변인을 통제하고 탐구 결과를 정확히 분석하여 결론을 도출하는 능력이 뛰어납니다.',
    B: '과학과 학업 성취 수준이 우수하며, 주요 과학 개념과 탐구 과정을 잘 이해하고 있습니다. 실험 활동 시 정해진 절차를 준수하고 모둠원들과 협력하여 결론을 이끌어내는 적극성을 보입니다.',
    C: '과학과 학업 성취 수준이 보통 수준이며, 기본적인 과학 현상과 단원별 핵심 개념을 인지하고 있습니다. 실험 활동 및 과학적 탐구에 관심을 갖고 참여하며 기초적인 과학적 사고를 키워가고 있습니다.',
    D: '과학과 학업 성취 수준 향상을 위해 전반적으로 노력이 요망되며, 기본 원리 학습과 용어 이해에 집중적인 보완이 필요합니다. 실생활의 과학적 현상과 쉬운 실험 활동을 통해 과학에 대한 흥미와 호기심을 키울 수 있도록 지도가 요구됩니다.',
  },
};

interface Student {
  id: string;
  number: number;
  name: string;
  k: number;
  m: number;
  e: number;
  s: number;
  sc: number;
  ov: Partial<Record<Subject, string>>;
}

interface SemesterData {
  students: Student[];
  fb: Record<Subject, Record<Grade, string>>;
  cut: { A: number; B: number; C: number };
}

interface AppSettings {
  school: string;
  grade: string;
  cls: string;
  teacher: string;
  sem: '1' | '2';
  subs: Subject[];
}

interface ReportOptions {
  per: 1 | 2;
  fs: number;
  ofs: number;
  who: string;
}

interface DialogConfig {
  title: string;
  desc: string;
  text: string;
  apply?: (text: string) => boolean | void;
}

interface PrintPayload {
  settings: AppSettings;
  cut: { A: number; B: number; C: number };
  fb: Record<Subject, Record<Grade, string>>;
  students: Student[];
  rep: ReportOptions;
}

function getInitialPrintPayload(): PrintPayload | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  if (params.get('print') !== '1') return null;
  try {
    const hash = window.location.hash;
    if (hash.startsWith('#printdata=')) {
      const decoded = decodeURIComponent(hash.slice('#printdata='.length));
      return JSON.parse(decoded) as PrintPayload;
    }
  } catch {
    // fallback to localStorage below
  }
  const s = loadInitialSettings();
  const d = loadD(s.sem);
  return {
    settings: s,
    cut: d.cut,
    fb: d.fb,
    students: [...d.students].sort((a, b) => a.number - b.number),
    rep: { per: 1, fs: 12, ofs: 12, who: 'all' },
  };
}

const mem: Record<string, string> = {};
const ls = {
  get(k: string): string | null {
    try {
      return localStorage.getItem(k);
    } catch {
      return mem[k] ?? null;
    }
  },
  set(k: string, v: string): void {
    try {
      localStorage.setItem(k, v);
    } catch {
      mem[k] = v;
    }
  },
};

const uid = () => Math.random().toString(36).slice(2, 9);
const mk = (
  n: number,
  name: string,
  k = 80,
  m = 80,
  e = 80,
  s = 80,
  sc = 80
): Student => ({
  id: uid(),
  number: n,
  name,
  k,
  m,
  e,
  s,
  sc,
  ov: {},
});

const sample = (): Student[] => [
  mk(1, '김지한', 90, 80, 90, 85, 95),
  mk(2, '이서연', 80, 90, 80, 90, 85),
  mk(3, '박준영', 65, 65, 80, 75, 70),
  mk(4, '최다은', 90, 50, 65, 80, 85),
  mk(5, '정민우', 80, 80, 50, 70, 75),
];

const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o));
const clamp = (v: string | number): number => Math.min(100, Math.max(0, parseInt(String(v), 10) || 0));

function loadInitialSettings(): AppSettings {
  let parsed: Partial<AppSettings> | null = null;
  try {
    const raw = ls.get('am_set');
    if (raw) parsed = JSON.parse(raw);
  } catch {
    // ignore
  }
  return {
    school: parsed?.school ?? '전주신동초등학교',
    grade: String(parsed?.grade ?? '5'),
    cls: parsed?.cls ?? '1',
    teacher: parsed?.teacher ?? '홍길동',
    sem: parsed?.sem === '2' ? '2' : '1',
    subs:
      Array.isArray(parsed?.subs) && parsed.subs.length > 0
        ? parsed.subs
        : ['국어', '수학', '영어'],
  };
}

function loadD(sem: string): SemesterData {
  let d: SemesterData | null = null;
  try {
    const raw = ls.get('am_d_' + sem);
    if (raw) d = JSON.parse(raw);
  } catch {
    // ignore
  }
  if (!d || !Array.isArray(d.students)) {
    d = { students: sample(), fb: clone(DF), cut: { A: 85, B: 70, C: 60 } };
  }
  d.fb = d.fb || clone(DF);
  d.cut = d.cut || { A: 85, B: 70, C: 60 };
  d.students.forEach((s) => {
    s.ov = s.ov || {};
  });
  return d;
}

const csvRows = (t: string): string[][] =>
  t
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((x) => x.trim())
    .map((l) => l.split(',').map((c) => c.trim().replace(/^"|"$/g, '')));

export default function App() {
  const [standalonePrint] = useState<PrintPayload | null>(() => getInitialPrintPayload());
  const [settings, setSettings] = useState<AppSettings>(() =>
    standalonePrint ? standalonePrint.settings : loadInitialSettings()
  );
  const [data, setData] = useState<SemesterData>(() =>
    standalonePrint
      ? {
          students: standalonePrint.students,
          fb: standalonePrint.fb,
          cut: standalonePrint.cut,
        }
      : loadD(loadInitialSettings().sem)
  );
  const [tab, setTab] = useState<number>(0);
  const [sel, setSel] = useState<string | null>(() => {
    const initD = loadD(loadInitialSettings().sem);
    return initD.students[0]?.id ?? null;
  });
  const [fbSub, setFbSub] = useState<Subject>('국어');
  const [fbStu, setFbStu] = useState<string | null>(null);
  const [rep, setRep] = useState<ReportOptions>(() =>
    standalonePrint ? standalonePrint.rep : { per: 1, fs: 12, ofs: 12, who: 'all' }
  );

  // Confirmation armed states
  const [clearArmed, setClearArmed] = useState(false);
  const [fbResetAllArmed, setFbResetAllArmed] = useState(false);

  // Dialog state
  const [dialogConfig, setDialogConfig] = useState<DialogConfig | null>(null);
  const [dialogText, setDialogText] = useState('');
  const [dialogDesc, setDialogDesc] = useState('');
  const [copied, setCopied] = useState(false);

  // Print Modal state
  const [printModalList, setPrintModalList] = useState<Student[] | null>(null);

  // Bulk score modal state
  const [bulkScoreSub, setBulkScoreSub] = useState<Subject | null>(null);
  const [bulkScoreMode, setBulkScoreMode] = useState<'single' | 'list'>('single');
  const [bulkSingleScore, setBulkSingleScore] = useState<number>(80);
  const [bulkScoreText, setBulkScoreText] = useState<string>('');

  // Refs
  const dialogRef = useRef<HTMLDialogElement>(null);
  const printDialogRef = useRef<HTMLDialogElement>(null);
  const bulkScoreDialogRef = useRef<HTMLDialogElement>(null);
  const printPreviewBoxRef = useRef<HTMLDivElement>(null);
  const standaloneBodyRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingFocusIdRef = useRef<string | null>(null);

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  // Auto-save whenever settings or data changes (skip in standalone print view)
  useEffect(() => {
    if (standalonePrint) return;
    ls.set('am_set', JSON.stringify(settings));
    ls.set('am_d_' + settings.sem, JSON.stringify(data));
  }, [settings, data, standalonePrint]);

  // Auto-trigger window.print() when opened in standalone print mode (?print=1)
  useEffect(() => {
    if (!standalonePrint) return;
    const timer = setTimeout(() => {
      window.focus();
      window.print();
    }, 350);
    return () => clearTimeout(timer);
  }, [standalonePrint]);

  // Focus newly added student's name input
  useEffect(() => {
    if (pendingFocusIdRef.current) {
      const idToFocus = pendingFocusIdRef.current;
      pendingFocusIdRef.current = null;
      const inputEl = document.querySelector<HTMLInputElement>(
        `#rows tr[data-id="${idToFocus}"] input.nm`
      );
      inputEl?.focus();
    }
  }, [data.students]);

  // Ensure valid active subject for feedback tab
  const activeFbSub: Subject = settings.subs.includes(fbSub) ? fbSub : settings.subs[0];

  const sortedStudents = [...data.students].sort((a, b) => a.number - b.number);

  const findStu = (id: string | null | undefined): Student | undefined =>
    data.students.find((s) => s.id === id);

  const activeFbStuId = findStu(fbStu)?.id ?? sortedStudents[0]?.id ?? null;
  const activeFbStudent = findStu(activeFbStuId);

  const gradeOf = (v: number): Grade =>
    v >= data.cut.A ? 'A' : v >= data.cut.B ? 'B' : v >= data.cut.C ? 'C' : 'D';

  const eff = (st: Student, sub: Subject): string =>
    st.ov[sub] || data.fb[sub]?.[gradeOf(st[K[sub]])] || '';

  const repList = (): Student[] =>
    rep.who === 'all' ? sortedStudents : sortedStudents.filter((s) => s.id === rep.who);

  const openDialog = (cfg: DialogConfig) => {
    setDialogConfig(cfg);
    setDialogText(cfg.text || '');
    setDialogDesc(cfg.desc);
    setCopied(false);
    setTimeout(() => {
      if (dialogRef.current && !dialogRef.current.open) {
        dialogRef.current.showModal();
      }
    }, 0);
  };

  const closeDialog = () => {
    dialogRef.current?.close();
    setDialogConfig(null);
  };

  const handleSemesterSwitch = (newSem: '1' | '2') => {
    ls.set('am_set', JSON.stringify(settings));
    ls.set('am_d_' + settings.sem, JSON.stringify(data));
    const nextData = loadD(newSem);
    setSettings((prev) => ({ ...prev, sem: newSem }));
    setData(nextData);
    setSel(nextData.students[0]?.id ?? null);
    setFbStu(null);
  };

  const handleSubjectToggle = (sub: Subject, checked: boolean) => {
    const nextSubs = SUBS.filter((s) =>
      s === sub ? checked : settings.subs.includes(s)
    );
    if (nextSubs.length === 0) return;
    setSettings((prev) => ({ ...prev, subs: nextSubs }));
  };

  const handleAddStudent = () => {
    const nextNo = Math.max(0, ...data.students.map((x) => x.number)) + 1;
    const newStu = mk(nextNo, '', 0, 0, 0, 0, 0);
    pendingFocusIdRef.current = newStu.id;
    setData((prev) => ({
      ...prev,
      students: [...prev.students, newStu],
    }));
    setSel(newStu.id);
  };

  const handleDeleteStudent = (id: string) => {
    setData((prev) => {
      const nextList = prev.students.filter((s) => s.id !== id);
      if (sel === id) {
        setSel(nextList[0]?.id ?? null);
      }
      return { ...prev, students: nextList };
    });
  };

  const handleSortStudents = () => {
    setData((prev) => ({
      ...prev,
      students: [...prev.students].sort((a, b) => a.number - b.number),
    }));
  };

  const handleSampleData = () => {
    const smp = sample();
    setData((prev) => ({ ...prev, students: smp }));
    setSel(smp[0].id);
  };

  const handleClearStudents = () => {
    if (clearArmed) {
      setData((prev) => ({ ...prev, students: [] }));
      setSel(null);
      setClearArmed(false);
      return;
    }
    setClearArmed(true);
    setTimeout(() => setClearArmed(false), 3000);
  };

  const handleStepPreview = (delta: number) => {
    if (sortedStudents.length < 2) return;
    const idx = sortedStudents.findIndex((s) => s.id === sel);
    const currentIdx = idx === -1 ? 0 : idx;
    const nextIdx = (currentIdx + delta + sortedStudents.length) % sortedStudents.length;
    setSel(sortedStudents[nextIdx].id);
  };

  const handleImportCSV = (text: string): boolean => {
    const r = csvRows(text);
    if (r.length && isNaN(parseInt(r[0][0], 10))) {
      r.shift();
    }
    let count = 0;
    const nextStudents = clone(data.students);
    r.forEach((c) => {
      const num = parseInt(c[0], 10);
      const name = c[1] || '';
      let s =
        nextStudents.find((x) => x.number === num) ||
        nextStudents.find((x) => Boolean(name) && x.name === name);
      if (!s) {
        const nextNum = isNaN(num)
          ? Math.max(0, ...nextStudents.map((x) => x.number)) + 1
          : num;
        s = mk(nextNum, name, 0, 0, 0, 0, 0);
        nextStudents.push(s);
      }
      if (name) s.name = name;
      (['k', 'm', 'e', 's', 'sc'] as SubjectKey[]).forEach((key, i) => {
        if (c[2 + i] !== undefined && c[2 + i] !== '') {
          s![key] = clamp(c[2 + i]);
        }
      });
      count++;
    });
    if (count > 0) {
      nextStudents.sort((a, b) => a.number - b.number);
      setData((prev) => ({ ...prev, students: nextStudents }));
      if (!sel && nextStudents[0]) {
        setSel(nextStudents[0].id);
      }
      return true;
    }
    return false;
  };

  const handleOpenBulk = () => {
    openDialog({
      title: '이름 일괄 등록',
      desc: '이름을 쉼표(,)나 줄바꿈으로 구분해 붙여넣으세요. 예: 김민우, 박서연, 이지현',
      text: '',
      apply(t: string) {
        const names = t
          .split(/[,\n]/)
          .map((x) => x.trim())
          .filter(Boolean);
        if (!names.length) return false;
        let no = Math.max(0, ...data.students.map((x) => x.number));
        const added = names.map((x) => mk(++no, x, 0, 0, 0, 0, 0));
        const combined = [...data.students, ...added];
        setData((prev) => ({ ...prev, students: combined }));
        if (!sel && combined[0]) setSel(combined[0].id);
        return true;
      },
    });
  };

  const handleOpenTemplate = () => {
    openDialog({
      title: 'CSV 양식',
      desc: '아래 내용을 복사해 엑셀이나 메모장에 붙여넣고, CSV(UTF-8)로 저장해 점수를 채운 뒤 ‘CSV 가져오기’로 올리세요.',
      text:
        '번호,이름,국어,수학,영어,사회,과학\n' +
        sortedStudents
          .map((s) => [s.number, s.name, s.k, s.m, s.e, s.s, s.sc].join(','))
          .join('\n'),
    });
  };

  const handleOpenCSVImport = () => {
    openDialog({
      title: 'CSV 가져오기',
      desc: 'CSV 내용을 붙여넣거나 파일을 선택하세요. 번호나 이름이 같은 학생은 점수를 갱신하고, 없는 학생은 추가합니다.',
      text: '',
      apply: handleImportCSV,
    });
  };

  const handleOpenExportCSV = () => {
    const header =
      '번호,이름,' + settings.subs.map((s) => `${s}점수,${s}등급`).join(',');
    const lines = sortedStudents.map((s) =>
      [
        s.number,
        s.name,
        ...settings.subs.flatMap((b) => [s[K[b]], gradeOf(s[K[b]])]),
      ].join(',')
    );
    openDialog({
      title: '성적 일람 CSV',
      desc: '복사해서 엑셀에 붙여넣거나 메모장에 CSV로 저장하세요.',
      text: [header, ...lines].join('\n'),
    });
  };

  const handleOpenBackup = () => {
    ls.set('am_set', JSON.stringify(settings));
    ls.set('am_d_' + settings.sem, JSON.stringify(data));
    const all = {
      app: 'assessment-manager',
      settings,
      semesters: {
        1: settings.sem === '1' ? data : loadD('1'),
        2: settings.sem === '2' ? data : loadD('2'),
      },
    };
    openDialog({
      title: '데이터 백업',
      desc: '아래 내용을 모두 복사해 메모장 등에 저장해 두세요. 학급 설정, 1·2학기 성적과 피드백이 모두 들어 있습니다.',
      text: JSON.stringify(all),
    });
  };

  const handleOpenRestore = () => {
    openDialog({
      title: '데이터 복원',
      desc: '백업해 둔 내용을 붙여넣거나 파일을 선택하세요. 복원하면 현재 입력한 내용이 모두 바뀝니다.',
      text: '',
      apply(t: string) {
        try {
          const o = JSON.parse(t);
          if (o.app !== 'assessment-manager') throw new Error('Invalid backup');
          const nextSettings: AppSettings = {
            ...settings,
            ...o.settings,
          };
          (['1', '2'] as const).forEach((k) => {
            if (o.semesters?.[k]) {
              ls.set('am_d_' + k, JSON.stringify(o.semesters[k]));
            }
          });
          const loadedData = loadD(nextSettings.sem);
          setSettings(nextSettings);
          setData(loadedData);
          setSel(loadedData.students[0]?.id ?? null);
          setFbStu(null);
          return true;
        } catch {
          setDialogDesc(
            '올바른 백업 내용이 아닙니다. 복사한 내용 전체를 다시 붙여넣어 주세요.'
          );
          return false;
        }
      },
    });
  };

  const handleOpenBulkScores = (initialSub?: Subject) => {
    const subToOpen = initialSub || settings.subs[0] || '국어';
    setBulkScoreSub(subToOpen);
    setBulkScoreMode('single');
    setBulkSingleScore(80);
    setBulkScoreText('');
    setTimeout(() => {
      if (bulkScoreDialogRef.current && !bulkScoreDialogRef.current.open) {
        bulkScoreDialogRef.current.showModal();
      }
    }, 0);
  };

  const closeBulkScoreModal = () => {
    bulkScoreDialogRef.current?.close();
    setBulkScoreSub(null);
  };

  const handleApplyBulkScores = () => {
    if (!bulkScoreSub) return;
    const sub = bulkScoreSub;
    const key = K[sub];

    if (bulkScoreMode === 'single') {
      const val = clamp(bulkSingleScore);
      setData((prev) => ({
        ...prev,
        students: prev.students.map((st) => ({
          ...st,
          [key]: val,
        })),
      }));
    } else {
      const tokens = bulkScoreText
        .split(/[\n,\t\s]+/)
        .map((x) => x.trim())
        .filter(Boolean);

      if (!tokens.length) return;

      const sorted = [...data.students].sort((a, b) => a.number - b.number);
      const updatedMap = new Map<string, number>();

      sorted.forEach((st, idx) => {
        if (idx < tokens.length) {
          updatedMap.set(st.id, clamp(tokens[idx]));
        }
      });

      setData((prev) => ({
        ...prev,
        students: prev.students.map((st) => {
          if (updatedMap.has(st.id)) {
            return { ...st, [key]: updatedMap.get(st.id)! };
          }
          return st;
        }),
      }));
    }

    closeBulkScoreModal();
  };

  const buildPrintHref = (targetList: Student[]) => {
    const payload: PrintPayload = {
      settings,
      cut: data.cut,
      fb: data.fb,
      students: targetList,
      rep,
    };
    const base = typeof window !== 'undefined' ? window.location.pathname : '/';
    return `${base}?print=1#printdata=${encodeURIComponent(JSON.stringify(payload))}`;
  };

  const openPrintModal = (targetList: Student[]) => {
    setPrintModalList(targetList);
    setTimeout(() => {
      if (printDialogRef.current && !printDialogRef.current.open) {
        printDialogRef.current.showModal();
      }
    }, 0);
  };

  const closePrintModal = () => {
    printDialogRef.current?.close();
    setPrintModalList(null);
  };

  const handlePrintClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetList: Student[]
  ) => {
    if (!targetList.length) {
      e.preventDefault();
      return;
    }
    if (!isInIframe) {
      e.preventDefault();
      window.focus();
      window.print();
      return;
    }
    // Inside sandboxed preview iframe:
    // 1. Let the <a> tag open the unsandboxed new tab (?print=1#printdata=...) which auto-runs window.print()
    // 2. Also open the in-app Print & PDF Preview Modal so the user can download PDF directly if desired
    openPrintModal(targetList);
  };

  const handleDownloadPrintHTML = () => {
    const paEl = document.getElementById('pa');
    if (!paEl) return;
    const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>${settings.grade}학년 ${settings.cls}반 ${settings.sem}학기 총괄평가 성적표</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=Noto+Serif+KR:wght@500;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0;padding:20px;background:#fff;color:#111;font-family:"Noto Sans KR",system-ui,sans-serif}
.pg{max-width:210mm;margin:0 auto 24px}
.sheet{background:#fff;color:#111;border:1px solid #64748b;border-radius:10px;padding:20px;font-size:${rep.fs}px;line-height:1.55;margin-bottom:8mm}
.sheet h2{font-family:"Noto Serif KR",Georgia,serif;font-size:1.5em;text-align:center;border-bottom:2px solid #111;padding-bottom:8px;margin:0 0 12px}
.sheet table{width:100%;border-collapse:collapse;margin-bottom:10px;font-size:1em}
.sheet th,.sheet td{border:1px solid #64748b;padding:5px 7px;color:#111;text-align:center}
.sheet td{font-weight:bold}
.sheet th{background:#1e293b;color:#fff;font-weight:500}
.sheet td.l{text-align:left}
.sheet .opi{border:1px solid #64748b;font-size:${rep.ofs}px;line-height:1.65;margin-bottom:10px;overflow:hidden;padding:0}
.sheet .opi-title{background:#1e293b;color:#fff;font-weight:500;padding:6px 10px;text-align:left;border-bottom:1px solid #64748b;font-size:1em}
.sheet .opi-body{padding:10px}
.sheet .opi-body p{margin:0 0 6px;font-weight:bold}
.sheet .opi-body p:last-child{margin-bottom:0}
.sheet .sign{text-align:right;margin-top:8px;font-size:16.11px;font-weight:bold}
.sheet .guide td,.sheet .guide th{font-size:.92em}
.pg2 .sheet{height:134mm;overflow:hidden}
@media print{body{padding:0}.pg{padding:10mm;box-sizing:border-box;margin:0;break-after:page}.pg:last-child{break-after:auto}@page{size:A4 portrait;margin:0}}
</style>
</head>
<body>
${paEl.innerHTML}
<script>window.onload=function(){setTimeout(function(){window.print()},300)};</script>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${settings.grade}학년_${settings.cls}반_${settings.sem}학기_성적표_인쇄용.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const renderBadge = (g: Grade) => <span className={`g ${g}`}>{g}</span>;

  const renderSheet = (st: Student, o?: { fs: number; ofs: number }) => {
    const subs = settings.subs;
    const d = new Date();
    return (
      <div
        key={st.id}
        className="sheet"
        style={
          o
            ? ({
                '--fs': `${o.fs}px`,
                '--ofs': `${o.ofs}px`,
              } as React.CSSProperties)
            : undefined
        }
      >
        <h2>{settings.sem}학기 총괄평가 성적표</h2>
        <table>
          <tbody>
            <tr>
              <th>학교</th>
              <td>{settings.school}</td>
              <th>학년 반 번호</th>
              <td>
                {settings.grade}학년 {settings.cls}반 {st.number}번
              </td>
              <th>이름</th>
              <td>{st.name || '—'}</td>
            </tr>
          </tbody>
        </table>
        <table className="guide">
          <thead>
            <tr>
              <th style={{ width: '20%' }}>성취수준</th>
              <th style={{ width: '22%' }}>성취율</th>
              <th>성취특성 안내</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>A</td>
              <td>{data.cut.A}% 이상</td>
              <td className="l">{LV.A[1]}</td>
            </tr>
            <tr>
              <td>B</td>
              <td>{data.cut.B}% 이상</td>
              <td className="l">{LV.B[1]}</td>
            </tr>
            <tr>
              <td>C</td>
              <td>{data.cut.C}% 이상</td>
              <td className="l">{LV.C[1]}</td>
            </tr>
            <tr>
              <td>D</td>
              <td>{data.cut.C}% 미만</td>
              <td className="l">{LV.D[1]}</td>
            </tr>
          </tbody>
        </table>
        <table>
          <thead>
            <tr>
              <th style={{ width: '20%' }}>교과</th>
              <th style={{ width: '22%' }}>성취수준</th>
              <th>성취특성</th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => {
              const v = st[K[s]];
              const g = gradeOf(v);
              return (
                <tr key={s}>
                  <td>{s}</td>
                  <td>
                    <b>{g}</b>
                  </td>
                  <td className="l">
                    ‘{g}’ 수준으로 {LV[g][1]}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="opi">
          <div className="opi-title">※ 교과 성취 수준에 따른 종합 평가 피드백 및 의견</div>
          <div className="opi-body">
            {subs.map((s) => (
              <p key={s}>
                <b>[{s}]</b> {eff(st, s)}
              </p>
            ))}
          </div>
        </div>
        <p className="sign">
          담임교사 {settings.teacher} (인)
        </p>
      </div>
    );
  };

  const renderPages = (list: Student[], o: ReportOptions) => {
    if (!list.length) {
      return (
        <div className="empty">
          출력할 학생이 없습니다. 성적 입력 탭에서 학생을 먼저 추가해 주세요.
        </div>
      );
    }
    const n = o.per;
    const chunks: Student[][] = [];
    for (let i = 0; i < list.length; i += n) {
      chunks.push(list.slice(i, i + n));
    }
    return chunks.map((chunk, idx) => (
      <div key={idx} className={`pg ${n === 2 ? 'pg2' : ''}`}>
        {chunk.map((s) => renderSheet(s, o))}
      </div>
    ));
  };

  const previewStudent = findStu(sel) || sortedStudents[0];
  const printTargetList =
    printModalList ?? (tab === 2 ? repList() : sortedStudents);

  if (standalonePrint) {
    return (
      <>
        <div className="print-standalone-bar">
          <div>
            <strong style={{ fontSize: '16px' }}>
              {settings.grade}학년 {settings.cls}반 · {settings.sem}학기 총괄평가 성적표 인쇄
            </strong>
            <span style={{ marginLeft: '12px', fontSize: '13px', opacity: 0.8 }}>
              총 {data.students.length}명 · 인쇄창이 자동으로 열리지 않으면 오른쪽 버튼을 눌러 주세요.
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn sm"
              style={{ background: '#fff', color: '#14121f', borderColor: '#fff' }}
              onClick={() => {
                window.focus();
                window.print();
              }}
            >
              인쇄창 열기
            </button>
            <button
              type="button"
              className="btn sm"
              style={{ background: 'transparent', color: '#fff', borderColor: '#64748b' }}
              onClick={() => window.close()}
            >
              창 닫기
            </button>
          </div>
        </div>
        <div ref={standaloneBodyRef} className="print-standalone-body">
          {renderPages(data.students, rep)}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="screen-only">

        <header className="hero" id="top">
          <div className="wrap">
            <div className="sky" id="app">
              <div className="win">
                <div className="bar">
                  <b />
                  <b />
                  <b />
                  <span id="ttl">
                    {settings.grade}학년 {settings.cls}반 · {settings.sem}학기 총괄평가
                  </span>
                  <span id="saved">자동 저장됨</span>
                </div>
                <div className="appbody">
                  <aside id="side">
                    <h4>학급 정보</h4>
                    <label>
                      학교
                      <input
                        value={settings.school}
                        onChange={(e) =>
                          setSettings((prev) => ({ ...prev, school: e.target.value }))
                        }
                      />
                    </label>
                    <div className="two">
                      <label>
                        학년
                        <select
                          value={settings.grade}
                          onChange={(e) =>
                            setSettings((prev) => ({ ...prev, grade: e.target.value }))
                          }
                        >
                          {[1, 2, 3, 4, 5, 6].map((n) => (
                            <option key={n} value={String(n)}>
                              {n}학년
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        반
                        <select
                          value={settings.cls}
                          onChange={(e) =>
                            setSettings((prev) => ({ ...prev, cls: e.target.value }))
                          }
                        >
                          {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={String(n)}>
                              {n}반
                            </option>
                          ))}
                          {!Array.from({ length: 20 }, (_, i) => String(i + 1)).includes(
                            settings.cls
                          ) && (
                            <option value={settings.cls}>{settings.cls}반</option>
                          )}
                        </select>
                      </label>
                    </div>
                    <label>
                      담임교사
                      <input
                        value={settings.teacher}
                        onChange={(e) =>
                          setSettings((prev) => ({ ...prev, teacher: e.target.value }))
                        }
                      />
                    </label>
                    <label>
                      학기
                      <select
                        value={settings.sem}
                        onChange={(e) =>
                          handleSemesterSwitch(e.target.value as '1' | '2')
                        }
                      >
                        <option value="1">1학기</option>
                        <option value="2">2학기</option>
                      </select>
                    </label>
                    <h4>평가 과목</h4>
                    <div>
                      {SUBS.map((s) => (
                        <label key={s} className="chk">
                          <input
                            type="checkbox"
                            checked={settings.subs.includes(s)}
                            onChange={(e) => handleSubjectToggle(s, e.target.checked)}
                          />
                          {s}
                        </label>
                      ))}
                    </div>
                    <h4>바로가기</h4>
                    <a
                      href={buildPrintHref(sortedStudents)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn dark"
                      onClick={(e) => handlePrintClick(e, sortedStudents)}
                    >
                      성적표 전체 인쇄
                    </a>
                    <div className="two">
                      <button type="button" className="btn" onClick={handleOpenBackup}>
                        백업
                      </button>
                      <button type="button" className="btn" onClick={handleOpenRestore}>
                        복원
                      </button>
                    </div>
                  </aside>

                  <main>
                    <div className="tabs" id="tabs" role="tablist">
                      {['1. 성적 입력', '2. 피드백 입력', '3. 통지표 인쇄', '4. 성적 분석'].map(
                        (label, idx) => (
                          <button
                            key={label}
                            type="button"
                            role="tab"
                            aria-selected={tab === idx}
                            onClick={() => setTab(idx)}
                          >
                            {label}
                          </button>
                        )
                      )}
                    </div>

                    <div id="view">
                      {tab === 0 && (
                        <>
                          <div className="card">
                            <h3>성취수준 등급 기준 점수</h3>
                            <p className="d">
                              점수를 입력하면 이 기준에 따라 성취수준(A~D)이 자동으로 정해집니다.
                            </p>
                            <div className="cuts">
                              {(['A', 'B', 'C'] as const).map((g) => (
                                <label key={g} className="cutc">
                                  {renderBadge(g)}
                                  {LV[g][0]}
                                  <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={data.cut[g]}
                                    onChange={(e) => {
                                      const val = clamp(e.target.value);
                                      setData((prev) => ({
                                        ...prev,
                                        cut: { ...prev.cut, [g]: val },
                                      }));
                                    }}
                                  />
                                  점 이상
                                </label>
                              ))}
                              <div className="cutc">
                                {renderBadge('D')}미흡 <b id="cdv">{data.cut.C}점 미만</b>
                              </div>
                            </div>
                          </div>

                          <div className="card">
                            <h3>학생 평가 성적 입력</h3>
                            <p className="d">
                              입력 즉시 자동 저장됩니다. 행을 선택하면 아래 미리보기가 바뀝니다.
                            </p>
                             <div className="tools">
                              <button
                                type="button"
                                className="btn sm dark"
                                onClick={handleAddStudent}
                              >
                                학생 1명 추가
                              </button>
                              <button
                                type="button"
                                className="btn sm"
                                onClick={handleOpenBulk}
                              >
                                이름 일괄 등록
                              </button>
                              <button
                                type="button"
                                className="btn sm"
                                style={{ background: '#e0e7ff', color: '#3730a3', borderColor: '#c7d2fe' }}
                                onClick={() => handleOpenBulkScores()}
                              >
                                ⚡ 과목별 점수 일괄 입력
                              </button>
                              <button
                                type="button"
                                className="btn sm"
                                onClick={handleSortStudents}
                              >
                                번호 정렬
                              </button>
                              <button
                                type="button"
                                className="btn sm red"
                                onClick={handleClearStudents}
                              >
                                {clearArmed ? '한 번 더 누르면 모두 삭제' : '비우기'}
                              </button>
                            </div>

                            <div className="tw">
                              <table>
                                <thead>
                                  <tr>
                                    <th>번호</th>
                                    <th>이름</th>
                                    {settings.subs.map((s) => (
                                      <th key={s}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                          <span>{s}</span>
                                          <button
                                            type="button"
                                            title={`${s} 점수 일괄 입력`}
                                            style={{
                                              border: '1px solid #cbd5e1',
                                              background: '#fff',
                                              borderRadius: '4px',
                                              padding: '1px 5px',
                                              fontSize: '11px',
                                              fontWeight: 'normal',
                                              cursor: 'pointer',
                                              color: '#475569',
                                            }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleOpenBulkScores(s);
                                            }}
                                          >
                                            일괄
                                          </button>
                                        </div>
                                      </th>
                                    ))}
                                    <th />
                                  </tr>
                                </thead>
                                <tbody id="rows">
                                  {data.students.length === 0 ? (
                                    <tr>
                                      <td colSpan={9}>
                                        <div className="empty">
                                          등록된 학생이 없습니다. 위 버튼으로 학생을 추가해 보세요.
                                        </div>
                                      </td>
                                    </tr>
                                  ) : (
                                    data.students.map((s) => (
                                      <tr
                                        key={s.id}
                                        data-id={s.id}
                                        className={s.id === sel ? 'sel' : ''}
                                        onClick={() => setSel(s.id)}
                                        onFocus={() => setSel(s.id)}
                                      >
                                        <td style={{ textAlign: 'center' }}>
                                          <input
                                            className="no"
                                            type="number"
                                            min={1}
                                            value={s.number}
                                            style={{ textAlign: 'center' }}
                                            aria-label="번호"
                                            onChange={(e) => {
                                              const num = parseInt(e.target.value, 10) || 1;
                                              setData((prev) => ({
                                                ...prev,
                                                students: prev.students.map((item) =>
                                                  item.id === s.id
                                                    ? { ...item, number: num }
                                                    : item
                                                ),
                                              }));
                                            }}
                                          />
                                        </td>
                                        <td>
                                          <input
                                            className="nm"
                                            value={s.name}
                                            placeholder="이름"
                                            aria-label="이름"
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              setData((prev) => ({
                                                ...prev,
                                                students: prev.students.map((item) =>
                                                  item.id === s.id ? { ...item, name: val } : item
                                                ),
                                              }));
                                            }}
                                          />
                                        </td>
                                        {settings.subs.map((b) => {
                                          const key = K[b];
                                          const score = s[key];
                                          const g = gradeOf(score);
                                          return (
                                            <td key={b}>
                                              <div className="sc">
                                                <input
                                                  type="number"
                                                  min={0}
                                                  max={100}
                                                  value={score}
                                                  aria-label={`${s.name} ${b} 점수`}
                                                  onChange={(e) => {
                                                    const val = clamp(e.target.value);
                                                    setData((prev) => ({
                                                      ...prev,
                                                      students: prev.students.map((item) =>
                                                        item.id === s.id
                                                          ? { ...item, [key]: val }
                                                          : item
                                                      ),
                                                    }));
                                                  }}
                                                />
                                                <span className={`g ${g}`}>{g}</span>
                                              </div>
                                            </td>
                                          );
                                        })}
                                        <td>
                                          <button
                                            type="button"
                                            className="btn sm red"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteStudent(s.id);
                                            }}
                                          >
                                            삭제
                                          </button>
                                        </td>
                                      </tr>
                                    ))
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          <div className="card">
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '8px',
                                flexWrap: 'wrap',
                                marginBottom: '10px',
                              }}
                            >
                              <h3>실시간 통지표 미리보기</h3>
                              <div className="tools" style={{ margin: 0 }}>
                                <button
                                  type="button"
                                  className="btn sm"
                                  onClick={() => handleStepPreview(-1)}
                                >
                                  이전 학생
                                </button>
                                <button
                                  type="button"
                                  className="btn sm"
                                  onClick={() => handleStepPreview(1)}
                                >
                                  다음 학생
                                </button>
                              </div>
                            </div>
                            <div id="pv">
                              {previewStudent ? (
                                renderSheet(previewStudent)
                              ) : (
                                <div className="empty">
                                  학생을 등록하면 미리보기가 나타납니다.
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {tab === 1 && (
                        <FeedbackPhraseEditor
                          settings={settings}
                          feedbackMap={data.fb}
                          onChangeFeedbackMap={(nextFb) =>
                            setData((prev) => ({ ...prev, fb: nextFb }))
                          }
                          students={sortedStudents}
                          onUpdateStudentFeedback={(studentId, subject, text) => {
                            setData((prev) => ({
                              ...prev,
                              students: prev.students.map((st) => {
                                if (st.id !== studentId) return st;
                                const nextOv = { ...st.ov };
                                if (text) {
                                  nextOv[subject] = text;
                                } else {
                                  delete nextOv[subject];
                                }
                                return { ...st, ov: nextOv };
                              }),
                            }));
                          }}
                          onBulkUpdateStudentFeedback={(studentIds, subject, text) => {
                            setData((prev) => ({
                              ...prev,
                              students: prev.students.map((st) => {
                                if (!studentIds.includes(st.id)) return st;
                                const nextOv = { ...st.ov };
                                if (text) {
                                  nextOv[subject] = text;
                                } else {
                                  delete nextOv[subject];
                                }
                                return { ...st, ov: nextOv };
                              }),
                            }));
                          }}
                          gradeOf={gradeOf}
                          defaultFeedback={DF}
                        />
                      )}

                      {tab === 2 && (
                        <>
                          <div className="card">
                            <h3>인쇄 및 출력 옵션</h3>
                            <div className="opts" style={{ marginTop: '10px' }}>
                              <label>
                                출력 대상
                                <select
                                  value={rep.who}
                                  onChange={(e) =>
                                    setRep((prev) => ({ ...prev, who: e.target.value }))
                                  }
                                >
                                  <option value="all">전체 학생</option>
                                  {sortedStudents.map((s) => (
                                    <option key={s.id} value={s.id}>
                                      {s.number}번 {s.name}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label>
                                페이지당 인쇄 매수
                                <select
                                  value={rep.per}
                                  onChange={(e) =>
                                    setRep((prev) => ({
                                      ...prev,
                                      per: parseInt(e.target.value, 10) as 1 | 2,
                                    }))
                                  }
                                >
                                  <option value={1}>A4 1명씩</option>
                                  <option value={2}>A4 2명씩</option>
                                </select>
                              </label>
                              <label>
                                표·학생정보 글자
                                <select
                                  value={rep.fs}
                                  onChange={(e) =>
                                    setRep((prev) => ({
                                      ...prev,
                                      fs: parseInt(e.target.value, 10),
                                    }))
                                  }
                                >
                                  {[11, 12, 13, 14].map((n) => (
                                    <option key={n} value={n}>
                                      {n}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label>
                                의견란 글자
                                <select
                                  value={rep.ofs}
                                  onChange={(e) =>
                                    setRep((prev) => ({
                                      ...prev,
                                      ofs: parseInt(e.target.value, 10),
                                    }))
                                  }
                                >
                                  {[11, 12, 13, 14, 15].map((n) => (
                                    <option key={n} value={n}>
                                      {n}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <a
                                href={buildPrintHref(repList())}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn dark"
                                onClick={(e) => handlePrintClick(e, repList())}
                              >
                                성적표 인쇄하기
                              </a>
                            </div>
                            <p className="tip">
                              💡 인쇄창이 열리면 ‘설정 더보기’에서 ‘배경 그래픽’을 체크하고 머리글과
                              바닥글은 해제하면 훨씬 깔끔합니다.
                            </p>
                          </div>
                          <div id="rp">{renderPages(repList(), rep)}</div>
                        </>
                      )}

                      {tab === 3 && (
                        <>
                          {data.students.length === 0 ? (
                            <div className="empty">분석할 학생이 없습니다.</div>
                          ) : (
                            <>
                              <div className="stats">
                                {settings.subs.map((s) => {
                                  const scores = data.students.map((x) => x[K[s]]);
                                  const dist: Record<Grade, number> = {
                                    A: 0,
                                    B: 0,
                                    C: 0,
                                    D: 0,
                                  };
                                  scores.forEach((v) => dist[gradeOf(v)]++);
                                  const avg =
                                    scores.reduce((x, y) => x + y, 0) / scores.length;
                                  const max = Math.max(...scores);
                                  const min = Math.min(...scores);
                                  const col: Record<Grade, string> = {
                                    A: 'var(--A)',
                                    B: 'var(--B)',
                                    C: 'var(--C)',
                                    D: 'var(--D)',
                                  };
                                  return (
                                    <div
                                      key={s}
                                      className="card"
                                      style={{ margin: 0 }}
                                    >
                                      <h3>{s}</h3>
                                      <div className="big">
                                        {avg.toFixed(1)}
                                        <span
                                          style={{
                                            font: '400 clamp(13px, 0.95vw, 16px) var(--sans)',
                                            color: 'var(--mut)',
                                          }}
                                        >
                                          {' '}
                                          평균
                                        </span>
                                      </div>
                                      <p className="d" style={{ margin: '2px 0 6px' }}>
                                        최고 {max} · 최저 {min}
                                      </p>
                                      {(['A', 'B', 'C', 'D'] as const).map((g) => (
                                        <div key={g} className="bl">
                                          {renderBadge(g)}
                                          <div>
                                            <i
                                              style={{
                                                width: `${
                                                  (dist[g] / data.students.length) * 100
                                                }%`,
                                                background: col[g],
                                              }}
                                            />
                                          </div>
                                          <span>{dist[g]}명</span>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="card">
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '10px',
                                  }}
                                >
                                  <h3>학생별 성적 종합 일람</h3>
                                  <button
                                    type="button"
                                    className="btn sm"
                                    onClick={handleOpenExportCSV}
                                  >
                                    CSV로 내보내기
                                  </button>
                                </div>
                                <div className="tw">
                                  <table>
                                    <thead>
                                      <tr>
                                        <th>번호</th>
                                        <th>이름</th>
                                        {settings.subs.map((s) => (
                                          <th key={s}>{s}</th>
                                        ))}
                                        <th>평균</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {sortedStudents.map((s) => {
                                        const stuAvg =
                                          settings.subs.reduce(
                                            (acc, b) => acc + s[K[b]],
                                            0
                                          ) / settings.subs.length;
                                        return (
                                          <tr key={s.id}>
                                            <td>{s.number}</td>
                                            <td>{s.name}</td>
                                            {settings.subs.map((b) => (
                                              <td key={b}>
                                                <div className="sc">
                                                  {s[K[b]]}
                                                  {renderBadge(gradeOf(s[K[b]]))}
                                                </div>
                                              </td>
                                            ))}
                                            <td>{stuAvg.toFixed(1)}</td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </main>
                </div>
              </div>
            </div>
          </div>
        </header>

        <footer>
          <div className="wrap">© 총괄평가 자동화 · 학급 총괄평가 결과 출력 시스템</div>
        </footer>

        <dialog
          ref={dialogRef}
          id="dlg"
          onClose={() => setDialogConfig(null)}
        >
          <h3 id="dt">{dialogConfig?.title}</h3>
          <p id="dd">{dialogDesc}</p>
          <textarea
            id="dx"
            spellCheck={false}
            readOnly={!dialogConfig?.apply}
            value={dialogText}
            onChange={(e) => setDialogText(e.target.value)}
          />
          <input
            ref={fileInputRef}
            type="file"
            id="df"
            accept=".csv,.txt,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const reader = new FileReader();
              reader.onload = () => {
                setDialogText(String(reader.result ?? ''));
                e.target.value = '';
              };
              reader.readAsText(f, 'utf-8');
            }}
          />
          <div className="tools">
            {dialogConfig?.apply && (
              <button
                type="button"
                className="btn sm"
                id="dfile"
                onClick={() => fileInputRef.current?.click()}
              >
                파일 선택
              </button>
            )}
            <button
              type="button"
              className="btn sm"
              id="dcopy"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(dialogText);
                  setCopied(true);
                } catch {
                  const ta = document.querySelector<HTMLTextAreaElement>('#dx');
                  ta?.select();
                  document.execCommand('copy');
                  setCopied(true);
                }
                setTimeout(() => setCopied(false), 1200);
              }}
            >
              {copied ? '복사됨' : '복사'}
            </button>
            {dialogConfig?.apply && (
              <button
                type="button"
                className="btn sm dark"
                id="dok"
                onClick={() => {
                  if (dialogConfig.apply && dialogConfig.apply(dialogText) !== false) {
                    closeDialog();
                  }
                }}
              >
                적용
              </button>
            )}
            <button
              type="button"
              className="btn sm"
              id="dx2"
              onClick={closeDialog}
            >
              닫기
            </button>
          </div>
        </dialog>

        <dialog
          ref={printDialogRef}
          className="print-dlg"
          onClose={() => setPrintModalList(null)}
        >
          <h3>통지표 인쇄</h3>
          <p>
            새 탭에서 인쇄창이 열렸습니다. 만약 브라우저 팝업 차단 등으로 인쇄창이 열리지 않았다면 아래{' '}
            <b>새 창에서 인쇄창 열기</b>를 이용해 주세요.
          </p>
          <div ref={printPreviewBoxRef} className="print-preview-box">
            {renderPages(printTargetList, rep)}
          </div>
          <div className="tools" style={{ justifyContent: 'flex-end' }}>
            <a
              href={buildPrintHref(printTargetList)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn sm dark"
            >
              새 창에서 인쇄창 열기
            </a>
            <button
              type="button"
              className="btn sm"
              onClick={handleDownloadPrintHTML}
            >
              인쇄용 HTML 파일 저장
            </button>
            <button
              type="button"
              className="btn sm"
              onClick={closePrintModal}
            >
              닫기
            </button>
          </div>
        </dialog>

        <dialog
          ref={bulkScoreDialogRef}
          onClose={() => setBulkScoreSub(null)}
          style={{ width: 'min(640px, 94vw)' }}
        >
          {bulkScoreSub && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ margin: 0 }}>[{bulkScoreSub}] 점수 일괄 입력</h3>
                <div className="sub-tabs" style={{ margin: 0 }}>
                  {settings.subs.map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={s === bulkScoreSub}
                      onClick={() => setBulkScoreSub(s)}
                      style={{ padding: '4px 12px', fontSize: '13px' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sub-tabs" style={{ marginBottom: '14px' }}>
                <button
                  type="button"
                  aria-pressed={bulkScoreMode === 'single'}
                  onClick={() => setBulkScoreMode('single')}
                >
                  동일 점수 일괄 입력
                </button>
                <button
                  type="button"
                  aria-pressed={bulkScoreMode === 'list'}
                  onClick={() => setBulkScoreMode('list')}
                >
                  점수 목록 붙여넣기 (엑셀 복사)
                </button>
              </div>

              {bulkScoreMode === 'single' ? (
                <div>
                  <p className="d">
                    현재 등록된 학생 {sortedStudents.length}명 전체의 [{bulkScoreSub}] 점수를 지정한 점수로 일괄 변경합니다.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '14px 0' }}>
                    <label style={{ fontWeight: 600, fontSize: '15px' }}>일괄 적용 점수:</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={bulkSingleScore}
                      onChange={(e) => setBulkSingleScore(clamp(e.target.value))}
                      style={{ width: '100px', fontSize: '16px', fontWeight: 'bold', textAlign: 'center' }}
                    />
                    <span>점 (성취수준 등급 자동 계산)</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    <small style={{ color: 'var(--mut)', alignSelf: 'center', marginRight: '4px' }}>빠른 선택:</small>
                    {[100, 90, 85, 80, 75, 70, 60].map((score) => (
                      <button
                        key={score}
                        type="button"
                        className="btn sm"
                        style={{ padding: '2px 10px', height: '28px', fontSize: '12px' }}
                        onClick={() => setBulkSingleScore(score)}
                      >
                        {score}점
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="d">
                    엑셀이나 메모장에서 점수 목록을 복사해 아래에 붙여넣으세요. 1번 학생부터 차례대로 [{bulkScoreSub}] 점수가 반영됩니다.
                  </p>
                  <textarea
                    value={bulkScoreText}
                    onChange={(e) => setBulkScoreText(e.target.value)}
                    placeholder={'예:\n90\n85\n80\n75\n95\n(또는 쉼표로 구분: 90, 85, 80, 75, 95)'}
                    rows={5}
                    style={{ fontFamily: 'monospace', fontSize: '13px', marginBottom: '10px' }}
                  />
                  {bulkScoreText.trim() && (
                    <div style={{ background: 'var(--card)', padding: '10px 12px', borderRadius: '8px', maxHeight: '120px', overflowY: 'auto', fontSize: '12.5px', marginBottom: '12px' }}>
                      <strong>적용 미리보기:</strong>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '4px', marginTop: '6px' }}>
                        {sortedStudents.slice(0, bulkScoreText.split(/[\n,\t\s]+/).filter(Boolean).length).map((st, i) => {
                          const val = clamp(bulkScoreText.split(/[\n,\t\s]+/).filter(Boolean)[i] || '0');
                          return (
                            <div key={st.id} style={{ color: 'var(--mut)' }}>
                              {st.number}번 {st.name || '학생'}: <b style={{ color: 'var(--ink)' }}>{val}점</b>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="tools" style={{ justifyContent: 'flex-end', margin: '16px 0 0' }}>
                <button type="button" className="btn sm dark" onClick={handleApplyBulkScores}>
                  적용하기
                </button>
                <button type="button" className="btn sm" onClick={closeBulkScoreModal}>
                  취소
                </button>
              </div>
            </div>
          )}
        </dialog>
      </div>

      <div id="pa">{renderPages(printTargetList, rep)}</div>
    </>
  );
}

