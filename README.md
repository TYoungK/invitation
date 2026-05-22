# Static Wedding Invitation

GitHub Pages에 그대로 올릴 수 있는 정적 모바일 청첩장입니다.

## 파일

- `index.html`: 청첩장 본문
- `styles.css`: 반응형 스타일
- `script.js`: 갤러리 확대 보기와 댓글 영역
- `assets/`: 생성한 웨딩 이미지

## 댓글 기능

정적 호스팅만으로는 모든 방문자가 공유하는 댓글 저장소를 직접 운영할 수 없습니다. 대신 GitHub Pages와 잘 맞는 Giscus를 붙일 수 있게 준비해 두었습니다.

1. GitHub 저장소에서 Discussions를 켭니다.
2. https://giscus.app 에서 저장소와 카테고리를 선택합니다.
3. 발급된 `repo`, `repoId`, `category`, `categoryId` 값을 `script.js`의 `GISCUS_CONFIG`에 넣습니다.

설정 전에는 브라우저 `localStorage`에만 저장되는 미리보기 방명록이 표시됩니다.

## GitHub Pages 배포

저장소에 이 파일들을 커밋한 뒤 GitHub에서 `Settings > Pages > Deploy from a branch`를 선택하고 `main` 브랜치의 root를 지정하면 됩니다.
