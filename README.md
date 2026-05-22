# Static Wedding Invitation

GitHub Pages에 그대로 올릴 수 있는 정적 모바일 청첩장입니다.

## 파일

- `index.html`: 청첩장 본문
- `styles.css`: 반응형 스타일
- `script.js`: 갤러리 확대 보기와 Firebase 방명록
- `assets/`: 생성한 웨딩 이미지

## Firebase 방명록

정적 호스팅만으로는 모든 방문자가 공유하는 댓글 저장소를 직접 운영할 수 없습니다. 이 샘플은 GitHub Pages에서 페이지를 띄우고, Firebase Firestore를 외부 DB로 사용해 로그인 없는 방명록을 저장합니다.

1. Firebase Console에서 프로젝트를 만듭니다.
2. Firestore Database를 만들고 프로덕션 모드로 시작합니다.
3. 웹 앱을 추가한 뒤 발급된 Firebase config를 `script.js`의 `FIREBASE_CONFIG`에 넣습니다.
4. Firestore Rules에 아래 규칙을 게시합니다.

```txt
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /guestbookMessages/{messageId} {
      allow read: if true;
      allow create: if
        request.resource.data.keys().hasOnly(['name', 'message', 'createdAt']) &&
        request.resource.data.name is string &&
        request.resource.data.name.size() >= 1 &&
        request.resource.data.name.size() <= 24 &&
        request.resource.data.message is string &&
        request.resource.data.message.size() >= 1 &&
        request.resource.data.message.size() <= 300 &&
        request.resource.data.createdAt == request.time;
      allow update, delete: if false;
    }
  }
}
```

설정 전에는 브라우저 `localStorage`에만 저장되는 미리보기 방명록이 표시됩니다.

## GitHub Pages 배포

저장소에 이 파일들을 커밋한 뒤 GitHub에서 `Settings > Pages > Deploy from a branch`를 선택하고 `main` 브랜치의 root를 지정하면 됩니다.
