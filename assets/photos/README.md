# 写真フォルダ（assets/photos）

合宿LPで使用する写真です。ファイル名は **表示順の番号** にそろえています。

## フォルダ構成

```
assets/photos/
├── hero/          … トップ（ヒーロー）周囲のコラージュ（14枚）
│   ├── hero-01.jpg
│   ├── hero-02.jpg
│   └── … hero-14.jpg
└── voice/         … 「昨年度の様子」マーキー用（6枚）
    ├── voice-01.jpg
    ├── voice-02.jpg
    └── … voice-06.jpg
```

## 番号と HTML の対応

| ファイル | 用途 |
|---------|------|
| `hero-01.jpg` 〜 `hero-14.jpg` | `index.html` の `hero-photo--1` 〜 `--14` と同じ順 |
| `voice-01.jpg` 〜 `voice-06.jpg` | `script.js` の `VOICE_MARQUEE_PHOTOS`（voice 6枚）と同じ順 |
| 上記 hero + voice 計20枚 | 「昨年度の様子」の横スクロールマーキー（`initVoicePhotoMarquee`） |

写真を差し替えるときは、**同じ番号のファイル名**で上書きするか、`index.html`（hero）・`script.js`（マーキー）のパスと番号をそろえてください。

## 推奨サイズ

| フォルダ | 推奨サイズ |
|---------|-----------|
| `hero/` | 800×600px 前後 |
| `voice/` | 800×600px 前後 |

## 注意

- ファイル名は **英数字とハイフン** のみ（例: `hero-03.jpg`）
- 人物が写る場合は **掲載許可** を取得してください
- 公開前に [TinyPNG](https://tinypng.com/) などで軽量化すると表示が速くなります
