# Gamza games

개인 게임을 모아 보여 주는 반응형 포털입니다. Node.js 20 이상만 필요하며 별도의 패키지 설치나 빌드가 없습니다.

## 실행

```powershell
npm start
```

브라우저에서 http://localhost:3000 을 엽니다. 종료는 터미널에서 Ctrl+C입니다. 포트를 변경하려면 PowerShell에서 `$env:PORT = '3100'`을 설정한 뒤 실행하세요. 서버는 로컬 컴퓨터에서만 접근하도록 바인딩됩니다. HTML을 직접 열면 게임 목록 API가 동작하지 않습니다.

```powershell
npm test
```

## 현재 상태

왁뿌볼 아레나, 왁뿌몬월드, 왁뿌볼 뿌수기야를 제공받은 GitHub Pages 주소로 연결했습니다. 카드에서 상세 화면으로 이동하면 게임을 삽입 화면 또는 새 탭에서 실행할 수 있습니다. 털뭉치는 기존대로 ‘개발 중’으로 표시합니다. 썸네일은 직접 제작한 포털용 SVG 콘셉트 일러스트이며 실제 게임 화면이 아닙니다.

| 게임 | 실행 주소 |
| --- | --- |
| 왁뿌볼 아레나 | https://gamjadough.github.io/Wax-Ball/arena/ |
| 왁뿌몬월드 | https://gamjadough.github.io/wakppu-pet-world/# |
| 왁뿌볼 뿌수기야 | https://gamjadough.github.io/Wax-Ball/wakppuball/ |

## 게임 추가 및 연결

`data/games.json`의 배열에 객체를 추가하거나 기존 객체를 수정합니다. 각 게임의 `id`는 중복 없이 영문, 숫자, 하이픈을 사용하세요.

| 필드 | 용도 |
| --- | --- |
| `id`, `name`, `description` | 고유 ID, 게임 이름, 소개 |
| `genre` | `액션`, `캐주얼`, `실험작` 중 하나 |
| `thumbnail` | 실제 존재하는 이미지의 URL 경로. 이미지를 `public/assets/`에 추가하고 `/assets/파일명.svg`로 지정 |
| `type` | `web` 또는 `desktop` |
| `status` | `ready`, `connection-needed`, `in-development` |
| `addedAt` | 등록일 `YYYY-MM-DD`; 최근 게임 정렬 기준 |
| `launchUrl` | 실제 웹 게임의 `http://` 또는 `https://` URL, 미설정 시 `null` |
| `localProject` | 로컬 웹 빌드 폴더와 진입 파일; 미설정 시 `null` |
| `downloadUrl` | 실제 데스크톱 다운로드의 HTTP(S) URL; 미설정 시 `null` |

### 기존 로컬 웹 게임 연결

실제 게임의 웹 빌드 폴더를 확인한 뒤 `localProject`에 지정하고 `status`를 `ready`로 바꾸세요. 아래 값은 형식 예시이며 실제 위치로 교체해야 합니다.

```json
"status": "ready",
"launchUrl": null,
"localProject": {
  "directory": "C:/실제/게임/웹빌드폴더",
  "entry": "index.html"
}
```

`directory`는 절대 경로나 포털 폴더 기준 상대 경로를 지원합니다. 실제 진입 파일이 존재할 때만 플레이 버튼이 표시됩니다. 원본 프로젝트는 읽기 전용으로 서비스하며 수정하거나 삭제하지 않습니다. 게임의 정적 웹 빌드 출력 폴더만 지정하세요. 지정한 폴더 안의 파일들은 로컬 HTTP 서버로 제공되므로 비밀 파일이 있는 전체 소스 폴더를 지정하지 마세요.

게임은 `/projects/게임ID/진입파일`에서 독립적으로 실행됩니다. 이미지·스크립트는 상대 경로를 사용한 정적 빌드가 적합합니다. 루트 절대 경로(`/assets/...`)를 전제로 한 게임은 해당 게임의 기존 개발 서버를 실행하고 `launchUrl`을 그 서버 주소로 설정하세요. Unity/Godot 등의 압축 빌드나 서버 API가 필요한 프로젝트는 해당 프로젝트의 서버로 실행하고 URL로 연결하세요.

### 외부 URL 연결

`status`를 `ready`로 바꾸고 `launchUrl`에 확인한 게임 URL을 지정합니다. URL 설정이 로컬 경로보다 우선합니다. 외부 서버의 iframe 제한이 있으면 ‘새 탭에서 실행’ 버튼을 사용하세요. 외부 URL의 실제 가용성은 해당 서비스를 확인해야 합니다.

### 털뭉치 다운로드 연결

`type: "desktop"`을 유지하고 실제 다운로드 URL을 `downloadUrl`에 등록합니다. 등록하면 게임 소개 화면에서 다운로드 버튼이 활성화됩니다. 파일이 없으면 계속 개발 중 화면으로 표시됩니다.

## 구조 및 기능

- `public/index.html`, `styles.css`, `app.js`: 포털 화면, 반응형 스타일, 검색·필터·라우팅
- `public/assets/`: 실제 SVG 로고와 콘셉트 일러스트
- `data/games.json`: 게임 등록 데이터
- `server.mjs`: 정적 파일과 게임 목록 API, 기존 게임 폴더 읽기 제공
- `tests/portal.test.mjs`: 검색·필터·게임 이동·최근 게임 정렬·API·파일·로컬 게임 연결 검증

검색은 이름·장르·설명을 대상으로 하고 카테고리와 함께 적용됩니다. `/` 키로 검색창에 포커스할 수 있습니다. 카드에서 상세 페이지로 이동하고 실제 연결된 웹 게임은 iframe, 새 탭, 전체 화면으로 실행합니다. 상단 로고·뒤로가기 링크로 언제든 포털에 돌아올 수 있습니다. 필터와 검색어는 페이지를 이동해도 현재 탭에서 유지됩니다.

글꼴은 Google Fonts의 Noto Sans KR을 사용하며 네트워크가 없으면 시스템 글꼴로 표시됩니다. 게임 이미지와 앱 로직은 모두 로컬에 포함되어 있습니다.

## GitHub Pages 배포

배포 대상 저장소는 `gamjadough/game`입니다. `.github/workflows/pages.yml`에서 main 브랜치가 갱신될 때 테스트, 정적 빌드, Pages 배포를 실행합니다.

1. GitHub 저장소의 Settings → Pages에서 Source를 **GitHub Actions**로 지정합니다.
2. main에 변경을 올리거나 Actions → Deploy Gamza games to GitHub Pages → Run workflow를 실행합니다.
3. Actions의 배포 결과에서 실제 게시 URL을 확인합니다.

비공개 저장소의 Pages 지원 여부는 GitHub 계정 요금제에 따라 다릅니다. Pages 설정에서 지원 여부를 확인하세요. 공개로 전환하면 저장소 코드도 공개되므로 소유자가 결정해야 합니다.

`npm run build`로 `dist/`에 정적 배포 파일을 만듭니다. 저장소 이름이 URL에 포함되는 환경에서도 이미지·스타일·게임 목록이 상대 경로로 로드됩니다. 서버 없이 `games.json`을 읽기 때문에 PC를 꺼도 포털을 열 수 있습니다.

온라인 배포에서는 `localProject`와 로컬 실행 URL을 제외합니다. 기존 게임은 복사·수정하지 않으며, `data/games.json`에 등록된 HTTP(S) 게임 URL로 연결합니다. 로컬 파일을 웹에서 플레이하려면 게임을 따로 배포한 뒤 실제 URL을 등록하세요. `dist/`는 빌드 때 재생성되므로 직접 수정하지 마세요.
