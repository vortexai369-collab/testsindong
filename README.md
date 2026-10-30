# 총괄평가 자동화 (Student Grade & Feedback System)

국어·수학·영어 등 과목별 점수를 입력하면 성취수준(A~D)이 자동으로 산출되고, 교사가 설정한 과목별/수준별 맞춤 피드백 문구가 입력되어 A4 개별 성적 통지표를 즉시 미리보기 및 일괄 인쇄(PDF 다운로드)할 수 있는 웹 애플리케이션입니다.

---

## 🚀 주요 기능

1. **학생 명단 및 성적 관리**
   - 학생 추가, 삭제 및 기본 성적 입력
   - 과목별 일괄 점수 입력 기능 지원
2. **성취수준 자동 판정 & 피드백 자동 매칭**
   - 점수에 따른 성취도(A, B, C, D) 자동 계산
   - 수준별 맞춤 권장 피드백 문구 자동 적용
3. **피드백 문구 커스텀 관리**
   - 과목별, 성취수준별 피드백 문구를 자유롭게 편집 및 저장
4. **A4 규격 성적 통지표 출력**
   - 인쇄 및 PDF 저장에 최적화된 A4 레이아웃
   - 학생별 개별 출력 또는 학급 전체 일괄 인쇄 지원

---

## 🛠️ 기술 스택

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons
- **Build Tool**: Vite
- **Export/Print**: jsPDF, html2canvas

---

## 💻 실행 방법 (로컬 실행)

```bash
# 1. 저장소 복제 (Clone)
git clone <저장소-URL>
cd <저장소-폴더명>

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:3000` 접속 후 사용하실 수 있습니다.

---

## 🌐 타 플랫폼 무료 배포 가이드 (Vercel / Netlify / Cloudflare Pages)

GitHub에 소스코드가 올라간 후, 다른 무료 호스팅 서비스를 통해 누구나 접속 가능한 웹사이트로 배포할 수 있습니다.

### Vercel 배포 설정 (가장 추천)
1. [Vercel](https://vercel.com) 로그인 후 **"Add New..." → "Project"** 클릭
2. GitHub 저장소 선택 후 **Import**
3. 설정값 확인:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. **Deploy** 버튼 클릭 → 1분 내에 배포 완료 URL 생성!

### Netlify 배포 설정
1. [Netlify](https://www.netlify.com) 로그인 후 **"Add new site" → "Import an existing project"**
2. GitHub 선택 및 저장소 연결
3. Build command: `npm run build`, Publish directory: `dist` 지정 후 Deploy

