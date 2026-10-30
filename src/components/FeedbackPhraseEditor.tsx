import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  RefreshCw,
  Settings,
  Check,
  Sparkles,
  Users,
  CheckSquare,
  Square,
  Trash2,
  Copy,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

type Subject = '국어' | '수학' | '영어' | '사회' | '과학';
type SubjectKey = 'k' | 'm' | 'e' | 's' | 'sc';
type Grade = 'A' | 'B' | 'C' | 'D';

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

interface AppSettings {
  school: string;
  grade: string;
  cls: string;
  teacher: string;
  sem: '1' | '2';
  subs: Subject[];
}

interface FeedbackPhraseEditorProps {
  settings: AppSettings;
  feedbackMap: Record<Subject, Record<Grade, string>>;
  onChangeFeedbackMap: (nextFb: Record<Subject, Record<Grade, string>>) => void;
  students: Student[];
  onUpdateStudentFeedback: (studentId: string, subject: Subject, text: string | undefined) => void;
  onBulkUpdateStudentFeedback: (studentIds: string[], subject: Subject, text: string | undefined) => void;
  gradeOf: (score: number) => Grade;
  defaultFeedback: Record<Subject, Record<Grade, string>>;
}

const K: Record<Subject, SubjectKey> = { 국어: 'k', 수학: 'm', 영어: 'e', 사회: 's', 과학: 'sc' };

const LV: Record<Grade, [string, string]> = {
  A: ['매우우수', '학업 성취도가 매우 높음.'],
  B: ['우수', '기본학력이 높음.'],
  C: ['보통', '기본학력이 성취됨.'],
  D: ['미흡', '기본학력 향상을 위한 노력이 필요함.'],
};

const parseCleanJson = (text: string): any => {
  let clean = text.trim();
  if (!clean) return null;

  const jsonBlockRegex = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/i;
  const match = clean.match(jsonBlockRegex);
  if (match && match[1]) {
    clean = match[1].trim();
  } else {
    if (clean.includes('```')) {
      clean = clean.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
    }
    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      clean = clean.substring(firstBrace, lastBrace + 1);
    }
  }

  let parsedText = '';
  let inString = false;
  let escaped = false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (escaped) {
      parsedText += char;
      escaped = false;
      continue;
    }
    if (char === '\\') {
      parsedText += char;
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      parsedText += char;
      continue;
    }
    if (inString) {
      if (char === '\n') {
        parsedText += '\\n';
      } else if (char === '\r') {
        // skip
      } else {
        parsedText += char;
      }
    } else {
      parsedText += char;
    }
  }

  parsedText = parsedText.replace(/,\s*([\]}])/g, '$1');
  return JSON.parse(parsedText);
};

export default function FeedbackPhraseEditor({
  settings,
  feedbackMap,
  onChangeFeedbackMap,
  students,
  onUpdateStudentFeedback,
  onBulkUpdateStudentFeedback,
  gradeOf,
  defaultFeedback,
}: FeedbackPhraseEditorProps) {
  const [mainTab, setMainTab] = useState<'common' | 'student'>('common');
  const [activeSubject, setActiveSubject] = useState<Subject>(() =>
    settings.subs.length > 0 ? settings.subs[0] : '국어'
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync activeSubject when settings.subs change
  useEffect(() => {
    if (settings.subs.length > 0 && !settings.subs.includes(activeSubject)) {
      setActiveSubject(settings.subs[0]);
    }
  }, [settings.subs, activeSubject]);

  // Evaluation criteria state per subject
  const [evaluationCriteriaMap, setEvaluationCriteriaMap] = useState<Record<Subject, string>>({
    국어: '',
    수학: '',
    영어: '',
    사회: '',
    과학: '',
  });

  const [aiDraft, setAiDraft] = useState<Record<Grade, string[]> | null>(null);
  const [pastedCommonJsonText, setPastedCommonJsonText] = useState<string>('');
  const [showCommonPromptText, setShowCommonPromptText] = useState<boolean>(false);

  // Individual / Bulk student editing states
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [individualActiveId, setIndividualActiveId] = useState<string>(() =>
    students.length > 0 ? students[0].id : ''
  );
  const [studentTraits, setStudentTraits] = useState<string>('');
  const [generatedOptions, setGeneratedOptions] = useState<string[]>([]);
  const [generatedCommonEvaluation, setGeneratedCommonEvaluation] = useState<string>('');
  const [pastedStudentJsonText, setPastedStudentJsonText] = useState<string>('');
  const [showStudentPromptText, setShowStudentPromptText] = useState<boolean>(false);
  const [bulkFeedbackText, setBulkFeedbackText] = useState<string>('');

  // Fallback active student initialization
  useEffect(() => {
    if (students.length > 0 && (!individualActiveId || !students.some((s) => s.id === individualActiveId))) {
      setIndividualActiveId(students[0].id);
    }
  }, [students, individualActiveId]);

  const activeStudent = students.find((s) => s.id === individualActiveId) || students[0];

  // Clear student options when active student or subject changes
  useEffect(() => {
    setGeneratedOptions([]);
    setGeneratedCommonEvaluation('');
  }, [individualActiveId, activeSubject]);

  const showTemporarySuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  const copyToClipboard = async (text: string, successMsg: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      showTemporarySuccess(successMsg);
    } catch {
      alert('클립보드 복사에 실패했습니다. 직접 복사해 주세요.');
    }
  };

  // Helper for common level prompt
  const getCommonPromptText = () => {
    const criteria = evaluationCriteriaMap[activeSubject].trim() || '교육과정 핵심 성취 기준에 따름';
    return `# 역할
너는 대한민국 초등학교 교사야. 내가 제공하는 [평가 내용 / 성취 기준]을 바탕으로, 학교 성적표나 총괄평가 통지표에 바로 등록할 수 있는 '성취수준별 종합 평가 피드백' 예시문 후보군을 성취수준 등급별(A, B, C, D)로 기재 작성해 줘.

# 대상 학년 및 학기: ${settings.grade}학년 ${settings.sem}학기
# 교과 과목: ${activeSubject}
# 평가 내용 및 성취 기준:
${criteria}

# 작성 규칙
1. 최우수(A등급), 우수(B등급), 보통(C등급), 노력 요함(D등급) 각각에 대해 **서로 다른 작성 스타일과 관점을 가진 총 3가지 피드백 예시문(옵션)**을 작성합니다. (각 등급별로 3개씩 총 12개의 문구를 작성하게 됩니다.)
2. 각 등급의 모든 예시문(옵션)은 반드시 다음의 [지정된 서두 문구]로 정확하게 시작하고, 제공된 평가 내용 및 성취 기준의 세부 맞춤 성취 양상을 매끄럽고 자연스러운 한 문단(각 200~250자 내외)으로 완성할 것.
   - A등급: "${activeSubject}과 학업 성취 수준이 전반적으로 매우 우수하며," 로 시작할 것.
   - B등급: "${activeSubject}과 학업 성취 수준이 전반적으로 우수하며," 로 시작할 것.
   - C등급: "${activeSubject}과 학업 성취 수준이 전반적으로 보통 수준이며," 로 시작할 것.
   - D등급: "${activeSubject}과 학업 성취 수준 향상을 위해 전반적으로 노력이 요망되며," 로 시작할 것.
3. 각 등급별 3가지 피드백은 다음과 같이 다양한 학생 성향과 학습태도를 다르게 반영해 주세요:
   - 옵션 1 (평가내용에 대한 부분 중심): 평가 내용에 대한 주요한 부분이 들어 갈 수 있도록 요약 중심
   - 옵션 2 (이해력·창의성 중심): 평가 내용 및 성취기준에 대한 핵심 원리 파악 및 창의성과 뛰어난 문제 해결력 중심
   - 옵션 3 (발전가능성 및 격려 중심): 과제 해결 집착력 및 발전 가능성, 적극적인 질문과 피드백 수용 태도 중심 (D등급의 경우, 보완책과 가정 협력, 따뜻한 격려 중심)
4. 초등학생들의 인성부분은 제외하고 교과 역량, 구체적인 학습 태도를 다루며, 학부모와 학생이 보았을 때 정중하고 격려가 되면서도 객관적이어야 합니다.
5. 어미는 평서문 형태로 해야합니다. 평서문이란 문장의 끝이 ~입니다./ ~합니다./ ~있습니다. 같은 형식입니다. ~함/~임과 같은 종결형 어미를 사용하지 않도록 합니다.

# 출력 요구사항
1. 먼저 사용자(교사)가 한눈에 파악하기 좋게, 작성한 총 12개의 피드백 문구들을 등급별로 비교할 수 있는 깔끔한 마크다운 표(Table)로 정리해서 표시해 주세요.
2. 그 다음, 표 아래에 앱에서 자동으로 데이터를 파싱해 불러올 수 있도록 아래 명시된 JSON 구조를 그대로 따르는 유효한 JSON 코드 블록(\`\`\`json ... \`\`\`)을 정확히 출력해 주세요. (주의: 코드 블록 외부에는 다른 잡담이나 설명 텍스트를 적지 마세요.)

\`\`\`json
{
  "A": [
    "A등급 첫 번째 옵션 피드백 문구...",
    "A등급 두 번째 옵션 피드백 문구...",
    "A등급 세 번째 옵션 피드백 문구..."
  ],
  "B": [
    "B등급 첫 번째 옵션 피드백 문구...",
    "B등급 두 번째 옵션 피드백 문구...",
    "B등급 세 번째 옵션 피드백 문구..."
  ],
  "C": [
    "C등급 첫 번째 옵션 피드백 문구...",
    "C등급 두 번째 옵션 피드백 문구...",
    "C등급 세 번째 옵션 피드백 문구..."
  ],
  "D": [
    "D등급 첫 번째 옵션 피드백 문구...",
    "D등급 두 번째 옵션 피드백 문구...",
    "D등급 세 번째 옵션 피드백 문구..."
  ]
}
\`\`\``;
  };

  const handleCopyCommonPrompt = () => {
    const promptText = getCommonPromptText();
    copyToClipboard(
      promptText,
      '성취수준별 12개 후보군 생성용 맞춤 프롬프트가 성공적으로 복사되었습니다! Gemini나 ChatGPT 창에 붙여넣어 주세요.'
    );
    setShowCommonPromptText(true);
  };

  const handleLoadCommonJson = () => {
    if (!pastedCommonJsonText.trim()) {
      alert('AI 답변 JSON 내용을 먼저 입력 또는 붙여넣기 해주세요.');
      return;
    }
    try {
      const parsed = parseCleanJson(pastedCommonJsonText);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('올바른 JSON 오브젝트 형식이 아닙니다.');
      }
      const expectedGrades: Grade[] = ['A', 'B', 'C', 'D'];
      for (const g of expectedGrades) {
        if (!parsed[g] || !Array.isArray(parsed[g])) {
          throw new Error(`JSON 내부에 ${g}등급 옵션 배열이 누락되었거나 올바르지 않습니다.`);
        }
      }
      setAiDraft(parsed);
      setPastedCommonJsonText('');
      showTemporarySuccess(
        'AI가 생성한 12가지 피드백 후보군이 성공적으로 로드되었습니다! 아래 후보군 리스트에서 마음에 드는 문구를 [적용]해 보세요.'
      );
    } catch (err: any) {
      alert(`JSON 파싱 실패: ${err.message || 'A, B, C, D 키를 가진 구조여야 합니다.'}`);
    }
  };

  const handleApplyOptionToCommon = (grade: Grade, text: string) => {
    const nextMap = {
      ...feedbackMap,
      [activeSubject]: {
        ...feedbackMap[activeSubject],
        [grade]: text,
      },
    };
    onChangeFeedbackMap(nextMap);
    showTemporarySuccess(
      `[${activeSubject} ${grade}등급] 공통 피드백 문구가 적용 및 자동 저장되었습니다!`
    );
  };

  // Helper for student prompt
  const getStudentPromptText = () => {
    if (!activeStudent) return '';
    const criteria = evaluationCriteriaMap[activeSubject].trim() || '교육과정 핵심 성취 기준에 따름';
    const score = activeStudent[K[activeSubject]];
    const grade = gradeOf(score);

    return `# 역할
너는 대한민국 초등학교 교사야. 제공된 정보를 토대로 이 학생만을 위한 '개인별 종합 피드백 추천 문구 10종'을 작성해 줘.

# 대상 학년 및 학기: ${settings.grade}학년 ${settings.sem}학기
# 교과 과목: ${activeSubject}
# 평가 내용 및 성취 기준:
${criteria}

# 개별 대상 학생 정보:
- 학생 이름: ${activeStudent.name || activeStudent.number + '번 학생'}
- 학업 성취 수준: ${grade}등급 (${score}점)
- 학생 특징 및 특이사항: ${studentTraits.trim() || '일반적인 특징에 맞는 전반적인 격려 중심의 피드백'}

# 작성 규칙
1. 제공된 [학업 성취 수준], [평가 기준]과 [학생 특징 및 특이사항]을 자연스럽게 융합하여 이 학생만을 위한 개별 맞춤 피드백 예시문 10개를 다양하고 정중한 어조로 작성해 줘.
2. 각 10개의 예시문은 반드시 아래의 지정된 서두 문구로 완벽히 일관성 있게 시작해야 합니다:
   - A등급일 때: "${activeSubject}과 학업 성취 수준이 전반적으로 매우 우수하며," 로 시작할 것.
   - B등급일 때: "${activeSubject}과 학업 성취 수준이 전반적으로 우수하며," 로 시작할 것.
   - C등급일 때: "${activeSubject}과 학업 성취 수준이 전반적으로 보통 수준이며," 로 시작할 것.
   - D등급일 때: "${activeSubject}과 학업 성취 수준 향상을 위해 전반적으로 노력이 요망되며," 로 시작할 것.
3. 각 추천 문구는 초등학생의 눈높이에 맞춰 격려와 객관적 성장을 균형 있게 다루어야 합니다.
4. 어미는 평서문 형태로 해야합니다. 평서문이란 문장의 끝이 ~입니다./ ~합니다./ ~있습니다. 같은 형식입니다. ~함/~임과 같은 종결형 어미를 사용하지 않도록 합니다.

# 출력 요구사항
1. 먼저 사용자(교사)가 한눈에 파악하기 좋게, 작성한 10가지 피드백 예시문들을 비교해 볼 수 있는 깔끔한 마크다운 표(Table)로 정리해서 표시해 주세요.
2. 그 다음, 표 아래에 앱에서 자동으로 데이터를 파싱해 불러올 수 있도록 아래 명시된 JSON 구조를 그대로 따르는 유효한 JSON 코드 블록(\`\`\`json ... \`\`\`)을 정확히 출력해 주세요. (주의: 코드 블록 외부에는 다른 잡담이나 설명 텍스트를 적지 마세요.)

\`\`\`json
{
  "commonEvaluation": "평가 내용에 대한 전반적인 요약 및 공통 총평",
  "options": [
    "1번째 개별 추천 피드백 문구...",
    "2번째 개별 추천 피드백 문구...",
    "3번째 개별 추천 피드백 문구...",
    "4번째 개별 추천 피드백 문구...",
    "5번째 개별 추천 피드백 문구...",
    "6번째 개별 추천 피드백 문구...",
    "7번째 개별 추천 피드백 문구...",
    "8번째 개별 추천 피드백 문구...",
    "9번째 개별 추천 피드백 문구...",
    "10번째 개별 추천 피드백 문구..."
  ]
}
\`\`\``;
  };

  const handleCopyStudentPrompt = () => {
    const promptText = getStudentPromptText();
    if (!promptText) return;
    copyToClipboard(
      promptText,
      `${activeStudent?.name || '학생'} 맞춤형 10종 생성 프롬프트가 복사되었습니다! AI 창에 붙여넣어 주세요.`
    );
    setShowStudentPromptText(true);
  };

  const handleLoadStudentJson = () => {
    if (!pastedStudentJsonText.trim()) {
      alert('AI 답변 JSON 내용을 입력해주세요.');
      return;
    }
    try {
      const parsed = parseCleanJson(pastedStudentJsonText);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('올바른 JSON 오브젝트 형식이 아닙니다.');
      }
      if (!parsed.options || !Array.isArray(parsed.options)) {
        throw new Error("JSON 내부에 'options' 배열이 누락되었습니다.");
      }
      setGeneratedOptions(parsed.options);
      setGeneratedCommonEvaluation(parsed.commonEvaluation || '');
      setPastedStudentJsonText('');
      showTemporarySuccess(
        '학생 개별 맞춤 추천 10개 후보군이 성공적으로 불러와졌습니다! 아래 목록에서 [적용] 버튼을 눌러주세요.'
      );
    } catch (err: any) {
      alert(`JSON 파싱 실패: ${err.message || "options 배열 구조를 확인해주세요."}`);
    }
  };

  const handleSelectStudentFeedbackOption = (text: string) => {
    if (!activeStudent) return;
    onUpdateStudentFeedback(activeStudent.id, activeSubject, text);
    showTemporarySuccess(
      `[${activeStudent.name}] 학생의 ${activeSubject} 개별 맞춤 피드백으로 적용되었습니다!`
    );
  };

  const handleToggleSelectAllRoster = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map((s) => s.id));
    }
  };

  const handleToggleStudentCheck = (id: string) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter((x) => x !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const handleApplyBulkFeedback = () => {
    if (selectedStudentIds.length === 0) {
      alert('일괄 적용할 학생을 명렬표에서 체크해주세요.');
      return;
    }
    if (!bulkFeedbackText.trim()) {
      alert('일괄 입력할 피드백 문구를 입력해주세요.');
      return;
    }
    onBulkUpdateStudentFeedback(selectedStudentIds, activeSubject, bulkFeedbackText);
    showTemporarySuccess(
      `체크된 학생 ${selectedStudentIds.length}명에게 [${activeSubject}] 피드백이 일괄 반영되었습니다!`
    );
  };

  const handleClearBulkFeedback = () => {
    if (selectedStudentIds.length === 0) {
      alert('초기화할 학생을 명렬표에서 체크해주세요.');
      return;
    }
    if (
      window.confirm(
        `선택된 학생 ${selectedStudentIds.length}명의 [${activeSubject}] 개별 피드백을 모두 삭제하고 공통 기본 피드백으로 복원하시겠습니까?`
      )
    ) {
      onBulkUpdateStudentFeedback(selectedStudentIds, activeSubject, undefined);
      showTemporarySuccess('선택된 학생들의 개별 피드백이 공통 기본값으로 복원되었습니다.');
    }
  };

  const activeStudentFeedback = activeStudent?.ov[activeSubject] || '';
  const activeStudentScore = activeStudent ? activeStudent[K[activeSubject]] : 0;
  const activeStudentGrade = activeStudent ? gradeOf(activeStudentScore) : 'A';

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="card" style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <h3>피드백 문구 사전 및 AI 맞춤 프롬프트 연동</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <a
              href="https://gemini.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn sm"
              style={{ background: '#e0e7ff', color: '#3730a3', borderColor: '#c7d2fe' }}
            >
              <ExternalLink className="w-3.5 h-3.5" style={{ display: 'inline', marginRight: '4px' }} />
              Gemini 바로가기
            </a>
            <a
              href="https://chatgpt.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn sm"
              style={{ background: '#d1fae5', color: '#065f46', borderColor: '#a7f3d0' }}
            >
              <ExternalLink className="w-3.5 h-3.5" style={{ display: 'inline', marginRight: '4px' }} />
              ChatGPT 바로가기
            </a>
          </div>
        </div>

        {/* Tab 1 (Common Level) vs Tab 2 (Student Individual) Mode Buttons */}
        <div className="sub-tabs" style={{ marginTop: '14px', marginBottom: '14px' }}>
          <button
            type="button"
            aria-pressed={mainTab === 'common'}
            onClick={() => setMainTab('common')}
          >
            <BookOpen className="w-3.5 h-3.5" style={{ display: 'inline', marginRight: '4px' }} />
            1. 성취수준별 공통 문구 설정
          </button>
          <button
            type="button"
            aria-pressed={mainTab === 'student'}
            onClick={() => setMainTab('student')}
          >
            <Users className="w-3.5 h-3.5" style={{ display: 'inline', marginRight: '4px' }} />
            2. 학생별 개별 맞춤 피드백 및 AI 추천
          </button>
        </div>

        {/* Subject Selector Buttons */}
        <div className="sub-tabs" style={{ marginBottom: 0 }}>
          {settings.subs.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={s === activeSubject}
              onClick={() => {
                setActiveSubject(s);
                setAiDraft(null);
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div
          style={{
            background: '#ecfdf5',
            color: '#065f46',
            border: '1px solid #a7f3d0',
            borderRadius: '10px',
            padding: '10px 14px',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Check className="w-4 h-4" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ==================== MAIN TAB 1: COMMON PRESETS ==================== */}
      {mainTab === 'common' && (
        <>
          {/* Evaluation Criteria & Prompt Builder Section */}
          <div className="card">
            <h3>[{activeSubject}] 평가 내용 및 성취 기준 설정 (AI 프롬프트 주입)</h3>
            <p className="d">
              {settings.grade}학년 {settings.sem}학기 {activeSubject} 평가 기준을 입력하면 맞춤형 AI 프롬프트가 자동으로 작성됩니다.
            </p>
            <textarea
              value={evaluationCriteriaMap[activeSubject]}
              onChange={(e) =>
                setEvaluationCriteriaMap({
                  ...evaluationCriteriaMap,
                  [activeSubject]: e.target.value,
                })
              }
              rows={3}
              placeholder="예: 단원의 주요 성취기준이나 이원목적분류표의 평가 내용을 드래그해 붙여넣으세요..."
              style={{ marginBottom: '14px' }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {/* Step 1: Copy Prompt Card */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                <small style={{ color: '#4f46e5', fontWeight: 700 }}>1단계</small>
                <h4 style={{ margin: '4px 0 6px', fontSize: '14px' }}>맞춤 프롬프트 생성 및 복사</h4>
                <p style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '12px' }}>
                  입력한 성취기준이 주입된 AI 프롬프트를 클립보드에 복사합니다.
                </p>
                <div className="tools" style={{ margin: 0 }}>
                  <button type="button" className="btn sm dark" onClick={handleCopyCommonPrompt}>
                    <Sparkles className="w-3.5 h-3.5" style={{ display: 'inline', marginRight: '4px' }} />
                    추천 프롬프트 복사하기
                  </button>
                  <button
                    type="button"
                    className="btn sm"
                    onClick={() => setShowCommonPromptText(!showCommonPromptText)}
                  >
                    {showCommonPromptText ? '프롬프트 닫기' : '프롬프트 보기'}
                  </button>
                </div>
              </div>

              {/* Step 2: Paste AI Response Card */}
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '16px' }}>
                <small style={{ color: '#059669', fontWeight: 700 }}>2단계</small>
                <h4 style={{ margin: '4px 0 6px', fontSize: '14px' }}>AI 답변 JSON 데이터 붙여넣기</h4>
                <p style={{ fontSize: '12.5px', color: '#047857', marginBottom: '10px' }}>
                  Gemini/ChatGPT가 출력한 JSON을 붙여넣고 [결과 불러오기]를 눌러주세요.
                </p>
                <textarea
                  value={pastedCommonJsonText}
                  onChange={(e) => setPastedCommonJsonText(e.target.value)}
                  placeholder="AI 답변 JSON(```json 블록 포함 가능)을 여기에 붙여넣으세요..."
                  rows={2}
                  style={{ minHeight: '60px', marginBottom: '8px', fontSize: '12px', fontFamily: 'monospace' }}
                />
                <button type="button" className="btn sm dark" style={{ width: '100%' }} onClick={handleLoadCommonJson}>
                  결과 불러오기
                </button>
              </div>
            </div>

            {/* Collapsible Prompt Preview Area */}
            {showCommonPromptText && (
              <div
                style={{
                  marginTop: '14px',
                  background: '#1e293b',
                  color: '#e2e8f0',
                  padding: '14px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '220px',
                  overflowY: 'auto',
                }}
              >
                {getCommonPromptText()}
              </div>
            )}
          </div>

          {/* AI Draft Candidate Panel (When JSON is loaded) */}
          {aiDraft && (
            <div className="card" style={{ background: '#f0fdf4', borderColor: '#86efac' }}>
              <h3>✨ AI 등급별 3종 피드백 후보군 (원하는 문구를 [공통 적용]하세요)</h3>
              <p className="d">각 등급별 3가지 추천 문구 중 마음에 드는 항목을 클릭하면 하단 공통 템플릿에 자동 반영됩니다.</p>
              {(['A', 'B', 'C', 'D'] as const).map((g) => (
                <div key={g} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <span className={`g ${g}`}>{g}</span>
                    <strong style={{ fontSize: '13.5px' }}>{LV[g][0]} 후보군</strong>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                    {Array.isArray(aiDraft[g]) &&
                      aiDraft[g].map((optText, oIdx) => (
                        <div key={oIdx} style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '8px' }}>
                          <textarea
                            value={optText}
                            onChange={(e) => {
                              const nextDraft = { ...aiDraft };
                              nextDraft[g] = [...nextDraft[g]];
                              nextDraft[g][oIdx] = e.target.value;
                              setAiDraft(nextDraft);
                            }}
                            rows={4}
                            style={{ fontSize: '12.5px', lineHeight: 1.5 }}
                          />
                          <button
                            type="button"
                            className="btn sm dark"
                            onClick={() => handleApplyOptionToCommon(g, optText)}
                          >
                            <Check className="w-3.5 h-3.5" style={{ display: 'inline', marginRight: '4px' }} />
                            공통 {g}등급에 적용
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Standard Common Preset Textareas */}
          <div className="card">
            <h3>성취수준별 공통 문구 편집</h3>
            <p className="d">과목과 등급마다 기본 피드백을 직접 수정할 수 있습니다.</p>
            {(['A', 'B', 'C', 'D'] as const).map((g) => (
              <div key={g} className="fbrow">
                <div>
                  <span className={`g ${g}`}>{g}</span>
                  <small>{LV[g][0]}</small>
                </div>
                <textarea
                  value={feedbackMap[activeSubject][g]}
                  onChange={(e) =>
                    onChangeFeedbackMap({
                      ...feedbackMap,
                      [activeSubject]: {
                        ...feedbackMap[activeSubject],
                        [g]: e.target.value,
                      },
                    })
                  }
                />
              </div>
            ))}
            <div className="tools" style={{ justifyContent: 'flex-start' }}>
              <button
                type="button"
                className="btn sm"
                onClick={() =>
                  onChangeFeedbackMap({
                    ...feedbackMap,
                    [activeSubject]: { ...defaultFeedback[activeSubject] },
                  })
                }
              >
                이 과목 초기화
              </button>
            </div>
          </div>
        </>
      )}

      {/* ==================== MAIN TAB 2: STUDENT CUSTOMIZED ==================== */}
      {mainTab === 'student' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 260px) 1fr', gap: '16px' }}>
          {/* Left panel: Roster */}
          <div className="card" style={{ marginBottom: 0, padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <strong style={{ fontSize: '13px' }}>학생 명렬표 ({students.length}명)</strong>
              <button type="button" className="btn sm" onClick={handleToggleSelectAllRoster}>
                {selectedStudentIds.length === students.length ? '해제' : '전체선택'}
              </button>
            </div>

            <div style={{ maxHeight: '600px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {students.map((s) => {
                const score = s[K[activeSubject]];
                const g = gradeOf(score);
                const hasCustom = Boolean(s.ov[activeSubject]);
                const isChecked = selectedStudentIds.includes(s.id);
                const isActive = s.id === individualActiveId;

                return (
                  <div
                    key={s.id}
                    onClick={() => setIndividualActiveId(s.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: isActive ? '2px solid #4a5ce8' : '1px solid #e4e3e8',
                      background: isActive ? '#f4f5fe' : '#fff',
                      cursor: 'pointer',
                      fontSize: '12.5px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStudentCheck(s.id);
                        }}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4" style={{ color: '#4a5ce8' }} />
                        ) : (
                          <Square className="w-4 h-4" style={{ color: '#a3a0b0' }} />
                        )}
                      </span>
                      <b>
                        {s.number}번 {s.name || '(이름 없음)'}
                      </b>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {hasCustom && (
                        <small style={{ background: '#d1fae5', color: '#065f46', padding: '1px 4px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>
                          맞춤
                        </small>
                      )}
                      <span className={`g ${g}`}>{g}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right panel: Editor & AI Recommendations */}
          <div className="card" style={{ marginBottom: 0 }}>
            {selectedStudentIds.length > 1 ? (
              /* Bulk Mode */
              <div>
                <h3>일괄 피드백 입력 모드 ({selectedStudentIds.length}명 체크됨)</h3>
                <p className="d">체크한 학생 전체에게 동시 적용할 피드백 문구를 입력하세요.</p>
                <textarea
                  value={bulkFeedbackText}
                  onChange={(e) => setBulkFeedbackText(e.target.value)}
                  rows={5}
                  placeholder="체크된 학생들에게 적용할 피드백을 적어주세요..."
                  style={{ marginBottom: '12px' }}
                />
                <div className="tools" style={{ justifyContent: 'flex-end' }}>
                  <button type="button" className="btn sm red" onClick={handleClearBulkFeedback}>
                    선택 학생 개별 피드백 초기화
                  </button>
                  <button type="button" className="btn sm dark" onClick={handleApplyBulkFeedback}>
                    <Check className="w-3.5 h-3.5" style={{ display: 'inline', marginRight: '4px' }} />
                    {selectedStudentIds.length}명에게 일괄 적용
                  </button>
                </div>
              </div>
            ) : activeStudent ? (
              /* Individual Mode */
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <h3>
                    [{activeStudent.number}번 {activeStudent.name}] 학생 맞춤 피드백
                  </h3>
                  <small style={{ color: '#6b6877' }}>
                    {activeSubject} 점수: <b>{activeStudentScore}점</b> ({activeStudentGrade}등급)
                  </small>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <textarea
                    value={activeStudentFeedback}
                    onChange={(e) => onUpdateStudentFeedback(activeStudent.id, activeSubject, e.target.value || undefined)}
                    rows={4}
                    placeholder={`기본 공통 문구가 적용 중입니다. 이곳에 직접 쓰거나 아래 AI 추천 문구를 클릭하면 개별 적용됩니다.`}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <small style={{ color: '#6b6877' }}>
                      {activeStudentFeedback ? '맞춤 개별 기재됨 · 실시간 자동 저장됨' : '공통 기본 템플릿 적용 중'}
                    </small>
                    <div className="tools" style={{ margin: 0 }}>
                      <button
                        type="button"
                        className="btn sm"
                        onClick={() =>
                          onUpdateStudentFeedback(activeStudent.id, activeSubject, feedbackMap[activeSubject][activeStudentGrade])
                        }
                      >
                        공통 {activeStudentGrade}등급 문구 가져오기
                      </button>
                      {activeStudentFeedback && (
                        <button
                          type="button"
                          className="btn sm red"
                          onClick={() => onUpdateStudentFeedback(activeStudent.id, activeSubject, undefined)}
                        >
                          지우고 공통 복원
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Individual AI 10 Recommendation Prompt Generator */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  <h4 style={{ margin: '0 0 6px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles className="w-4 h-4" style={{ color: '#4a5ce8' }} />
                    [{activeStudent.name}] 학생 맞춤형 10종 추천 프롬프트 생성기
                  </h4>

                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                    학생 관찰 특기사항 / 행동 특성 (선택 입력)
                  </label>
                  <textarea
                    value={studentTraits}
                    onChange={(e) => setStudentTraits(e.target.value)}
                    rows={2}
                    placeholder="예: 글의 중심 내용 파악이 매우 우수하나 발표 참여는 조금 수줍어함..."
                    style={{ minHeight: '50px', marginBottom: '10px', fontSize: '12.5px' }}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                    {/* Step 2: Copy Prompt */}
                    <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px' }}>
                      <small style={{ color: '#4f46e5', fontWeight: 700 }}>1단계</small>
                      <h5 style={{ margin: '2px 0 4px', fontSize: '13px' }}>개인 맞춤 프롬프트 복사</h5>
                      <div className="tools" style={{ margin: 0 }}>
                        <button type="button" className="btn sm dark" onClick={handleCopyStudentPrompt}>
                          <Sparkles className="w-3 h-3" style={{ display: 'inline', marginRight: '4px' }} />
                          개인 프롬프트 복사
                        </button>
                        <button type="button" className="btn sm" onClick={() => setShowStudentPromptText(!showStudentPromptText)}>
                          {showStudentPromptText ? '닫기' : '보기'}
                        </button>
                      </div>
                    </div>

                    {/* Step 3: Paste AI Response */}
                    <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px' }}>
                      <small style={{ color: '#059669', fontWeight: 700 }}>2단계</small>
                      <h5 style={{ margin: '2px 0 4px', fontSize: '13px' }}>AI 답변 JSON 로드</h5>
                      <textarea
                        value={pastedStudentJsonText}
                        onChange={(e) => setPastedStudentJsonText(e.target.value)}
                        placeholder="10종 JSON 답변을 여기에 붙여넣으세요..."
                        rows={1}
                        style={{ minHeight: '40px', marginBottom: '6px', fontSize: '11px', fontFamily: 'monospace' }}
                      />
                      <button type="button" className="btn sm dark" style={{ width: '100%' }} onClick={handleLoadStudentJson}>
                        로드
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Prompt Preview */}
                  {showStudentPromptText && (
                    <div
                      style={{
                        marginTop: '10px',
                        background: '#1e293b',
                        color: '#e2e8f0',
                        padding: '12px',
                        borderRadius: '8px',
                        fontSize: '11.5px',
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap',
                        maxHeight: '180px',
                        overflowY: 'auto',
                      }}
                    >
                      {getStudentPromptText()}
                    </div>
                  )}

                  {/* Render 10 Recommendation Candidates */}
                  {generatedOptions.length > 0 && (
                    <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                      {generatedCommonEvaluation && (
                        <div style={{ background: '#1e293b', color: '#f8fafc', padding: '10px', borderRadius: '8px', marginBottom: '10px', fontSize: '12px' }}>
                          <b>📢 [공통 총평 요약]:</b> {generatedCommonEvaluation}
                        </div>
                      )}
                      <strong style={{ fontSize: '12.5px', color: '#1e293b', display: 'block', marginBottom: '8px' }}>
                        📋 AI 10가지 추천 옵션 중 마음에 드는 항목을 클릭하세요:
                      </strong>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '360px', overflowY: 'auto' }}>
                        {generatedOptions.map((optText, oIdx) => (
                          <div
                            key={oIdx}
                            onClick={() => handleSelectStudentFeedbackOption(optText)}
                            style={{
                              background: '#fff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '8px',
                              padding: '10px 12px',
                              fontSize: '12.5px',
                              lineHeight: 1.5,
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                          >
                            <div>
                              <b style={{ color: '#4a5ce8', marginRight: '6px' }}>#{oIdx + 1}</b>
                              {optText}
                            </div>
                            <button type="button" className="btn sm dark" style={{ flexShrink: 0 }}>
                              적용 <ArrowRight className="w-3 h-3" style={{ display: 'inline', marginLeft: '2px' }} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="empty">선택된 학생이 없습니다.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
